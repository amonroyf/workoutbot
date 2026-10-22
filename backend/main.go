package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"cloud.google.com/go/firestore"
	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
	"google.golang.org/api/iterator"
)

var (
	firestoreClient *firestore.Client
	firebaseAuth    *auth.Client
)

const (
	tiempoTrabajo  = 40
	tiempoDescanso = 20
)

type WorkoutLog struct {
	UID         string    `firestore:"uid" json:"-"`
	Date        time.Time `firestore:"date" json:"-"`
	Score       int       `firestore:"score" json:"score"`
	TotalReps   int       `firestore:"total_reps" json:"total_reps"`
	Perfectas   int       `firestore:"perfectas" json:"perfectas"`
	MejorCombo  int       `firestore:"mejor_combo" json:"mejor_combo"`
	DuracionSec int       `firestore:"duracion_sec" json:"duracion_sec"`
	ClaseID     string    `firestore:"clase_id" json:"clase_id"`
	ClaseNombre string    `firestore:"clase_nombre" json:"clase_nombre"`
}

type finishWorkoutRequest struct {
	Score       int    `json:"score"`
	TotalReps   int    `json:"total_reps"`
	Perfectas   int    `json:"perfectas"`
	MejorCombo  int    `json:"mejor_combo"`
	DuracionSec int    `json:"duracion_sec"`
	ClaseID     string `json:"clase_id"`
	ClaseNombre string `json:"clase_nombre"`
}

func main() {
	ctx := context.Background()

	app, err := firebase.NewApp(ctx, nil)
	if err != nil {
		log.Fatalf("Error inicializando Firebase: %v", err)
	}

	firebaseAuth, err = app.Auth(ctx)
	if err != nil {
		log.Fatalf("Error inicializando Firebase Auth: %v", err)
	}

	firestoreClient, err = app.Firestore(ctx)
	if err != nil {
		log.Fatalf("Error inicializando Firestore: %v", err)
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/api/v1/workout/finish", chainMiddleware(finishWorkoutHandler, apiLimiter))
	mux.HandleFunc("/api/v1/stats", chainMiddleware(statsHandler, apiLimiter))
	mux.HandleFunc("/api/v1/account", chainMiddleware(deleteAccountHandler, apiLimiter))
	mux.HandleFunc("/health", healthHandler)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	srv := &http.Server{
		Addr:         ":" + port,
		Handler:      mux,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		log.Printf("workoutbot escuchando en :%s", port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Error en el servidor: %v", err)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)
	<-stop

	log.Println("Apagando servidor...")
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Fatalf("Error apagando servidor: %v", err)
	}
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

func finishWorkoutHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	uid, err := verificarToken(r)
	if err != nil {
		responderError(w, "unauthorized", "Token inválido o expirado", http.StatusUnauthorized)
		return
	}

	var req finishWorkoutRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		responderError(w, "invalid_payload", "Payload inválido", http.StatusBadRequest)
		return
	}

	if req.Score < 0 || req.TotalReps < 0 || req.Perfectas < 0 || req.MejorCombo < 0 || req.DuracionSec < 0 {
		responderError(w, "invalid_payload", "Valores negativos no permitidos", http.StatusBadRequest)
		return
	}
	if req.DuracionSec > 3600 {
		req.DuracionSec = 3600
	}
	if req.Perfectas > req.TotalReps {
		req.Perfectas = req.TotalReps
	}
	if req.MejorCombo > req.TotalReps {
		req.MejorCombo = req.TotalReps
	}

	req.ClaseID = limitarTexto(strings.TrimSpace(req.ClaseID), 60)
	req.ClaseNombre = limitarTexto(strings.TrimSpace(req.ClaseNombre), 80)
	if req.ClaseID == "" {
		req.ClaseID = "clasico"
	}
	if req.ClaseNombre == "" {
		req.ClaseNombre = "Entrenamiento"
	}

	ahora := time.Now().In(zonaCOT)
	logData := WorkoutLog{
		UID:         uid,
		Date:        ahora,
		Score:       req.Score,
		TotalReps:   req.TotalReps,
		Perfectas:   req.Perfectas,
		MejorCombo:  req.MejorCombo,
		DuracionSec: req.DuracionSec,
		ClaseID:     req.ClaseID,
		ClaseNombre: req.ClaseNombre,
	}
	checkinData := Checkin{
		UID:         uid,
		Fecha:       fechaCOT(ahora),
		CreadoEn:    ahora,
		ClaseID:     req.ClaseID,
		ClaseNombre: req.ClaseNombre,
		TotalReps:   req.TotalReps,
		Perfectas:   req.Perfectas,
		MejorCombo:  req.MejorCombo,
		DuracionSec: req.DuracionSec,
		Score:       req.Score,
	}

	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	batch := firestoreClient.Batch()
	batch.Set(firestoreClient.Collection("workout_logs").NewDoc(), logData)
	batch.Set(firestoreClient.Collection("checkins").NewDoc(), checkinData)
	if _, err := batch.Commit(ctx); err != nil {
		log.Printf("Error guardando entrenamiento: %v", err)
		responderError(w, "internal_error", "Error guardando el entrenamiento", http.StatusInternalServerError)
		return
	}

	resumen, err := obtenerResumen(ctx, uid)
	if err != nil {
		log.Printf("Error calculando resumen: %v", err)
	}

	log.Printf("Workout guardado: uid=%s clase=%s score=%d reps=%d", uid, req.ClaseID, req.Score, req.TotalReps)

	w.Header().Set("Content-Type", "application/json")
	respuesta := map[string]interface{}{
		"success": true,
		"message": "Entrenamiento guardado",
	}
	if err == nil {
		respuesta["resumen"] = resumen
	}
	json.NewEncoder(w).Encode(respuesta)
}

func deleteAccountHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	uid, err := verificarToken(r)
	if err != nil {
		responderError(w, "unauthorized", "Token inválido o expirado", http.StatusUnauthorized)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 60*time.Second)
	defer cancel()

	for _, coleccion := range []string{"checkins", "workout_logs"} {
		if err := borrarDocumentosPorUID(ctx, coleccion, uid); err != nil {
			log.Printf("Error borrando %s de uid=%s: %v", coleccion, uid, err)
			responderError(w, "internal_error", "No se pudieron borrar los datos", http.StatusInternalServerError)
			return
		}
	}

	if err := firebaseAuth.DeleteUser(ctx, uid); err != nil && !auth.IsUserNotFound(err) {
		log.Printf("Error borrando usuario uid=%s: %v", uid, err)
		responderError(w, "internal_error", "No se pudo borrar la cuenta", http.StatusInternalServerError)
		return
	}

	log.Printf("Cuenta eliminada: uid=%s", uid)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Cuenta eliminada",
	})
}

func borrarDocumentosPorUID(ctx context.Context, coleccion, uid string) error {
	for {
		iter := firestoreClient.Collection(coleccion).Where("uid", "==", uid).Limit(400).Documents(ctx)
		batch := firestoreClient.Batch()
		total := 0

		for {
			doc, err := iter.Next()
			if err == iterator.Done {
				break
			}
			if err != nil {
				return err
			}
			batch.Delete(doc.Ref)
			total++
		}

		if total == 0 {
			return nil
		}
		if _, err := batch.Commit(ctx); err != nil {
			return err
		}
	}
}

func statsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	uid, err := verificarToken(r)
	if err != nil {
		responderError(w, "unauthorized", "Token inválido o expirado", http.StatusUnauthorized)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	resumen, err := obtenerResumen(ctx, uid)
	if err != nil {
		log.Printf("Error leyendo resumen: %v", err)
		responderError(w, "internal_error", "Error leyendo el progreso", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"resumen": resumen,
	})
}

func obtenerResumen(ctx context.Context, uid string) (Resumen, error) {
	iter := firestoreClient.Collection("checkins").Where("uid", "==", uid).Limit(400).Documents(ctx)
	checkins := make([]Checkin, 0, 32)
	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			return Resumen{}, err
		}
		var checkin Checkin
		if err := doc.DataTo(&checkin); err != nil {
			return Resumen{}, err
		}
		checkins = append(checkins, checkin)
	}
	return construirResumen(checkins, time.Now()), nil
}

func limitarTexto(texto string, max int) string {
	runas := []rune(texto)
	if len(runas) <= max {
		return texto
	}
	return string(runas[:max])
}

func verificarToken(r *http.Request) (string, error) {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		return "", fmt.Errorf("no authorization header")
	}

	parts := strings.SplitN(authHeader, " ", 2)
	if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
		return "", fmt.Errorf("invalid authorization format")
	}

	token := parts[1]
	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	tokenVerificado, err := firebaseAuth.VerifyIDToken(ctx, token)
	if err != nil {
		return "", err
	}

	return tokenVerificado.UID, nil
}

func responderError(w http.ResponseWriter, codigo, mensaje string, status int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": false,
		"error":   codigo,
		"message": mensaje,
	})
}
