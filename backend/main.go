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
	UID       string    `firestore:"uid" json:"-"`
	Date      time.Time `firestore:"date" json:"-"`
	Score     int       `firestore:"score" json:"score"`
	TotalReps int       `firestore:"total_reps" json:"total_reps"`
}

type finishWorkoutRequest struct {
	Score     int `json:"score"`
	TotalReps int `json:"total_reps"`
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

	if req.Score < 0 || req.TotalReps < 0 {
		responderError(w, "invalid_payload", "Valores negativos no permitidos", http.StatusBadRequest)
		return
	}

	logData := WorkoutLog{
		UID:       uid,
		Date:      time.Now(),
		Score:     req.Score,
		TotalReps: req.TotalReps,
	}

	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	_, _, err = firestoreClient.Collection("workout_logs").Add(ctx, logData)
	if err != nil {
		log.Printf("Error guardando log: %v", err)
		responderError(w, "internal_error", "Error guardando el log", http.StatusInternalServerError)
		return
	}

	log.Printf("Workout guardado: uid=%s score=%d reps=%d", uid, req.Score, req.TotalReps)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Entrenamiento guardado",
	})
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
