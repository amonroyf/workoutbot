package main

import (
	"sort"
	"time"
)

const metaSemanal = 3

var zonaCOT = time.FixedZone("COT", -5*60*60)

type Checkin struct {
	UID         string    `firestore:"uid" json:"-"`
	Fecha       string    `firestore:"fecha" json:"fecha"`
	CreadoEn    time.Time `firestore:"creado_en" json:"-"`
	ClaseID     string    `firestore:"clase_id" json:"clase_id"`
	ClaseNombre string    `firestore:"clase_nombre" json:"clase_nombre"`
	TotalReps   int       `firestore:"total_reps" json:"total_reps"`
	Perfectas   int       `firestore:"perfectas" json:"perfectas"`
	MejorCombo  int       `firestore:"mejor_combo" json:"mejor_combo"`
	DuracionSec int       `firestore:"duracion_sec" json:"duracion_sec"`
	Score       int       `firestore:"score" json:"score"`
}

type SesionResumen struct {
	Fecha       string `json:"fecha"`
	ClaseID     string `json:"clase_id"`
	ClaseNombre string `json:"clase_nombre"`
	TotalReps   int    `json:"total_reps"`
	Perfectas   int    `json:"perfectas"`
	MejorCombo  int    `json:"mejor_combo"`
	DuracionSec int    `json:"duracion_sec"`
	Score       int    `json:"score"`
}

type DiaResumen struct {
	Fecha    string `json:"fecha"`
	Etiqueta string `json:"etiqueta"`
	Hecha    bool   `json:"hecha"`
	Hoy      bool   `json:"hoy"`
}

type Resumen struct {
	Hoy           bool           `json:"hoy"`
	Racha         int            `json:"racha"`
	MetaSemanal   int            `json:"meta_semanal"`
	DiasSemana    int            `json:"dias_semana"`
	Semana        []DiaResumen   `json:"semana"`
	TotalSesiones int            `json:"total_sesiones"`
	Ultima        *SesionResumen `json:"ultima"`
	Anterior      *SesionResumen `json:"anterior"`
}

func fechaCOT(t time.Time) string {
	return t.In(zonaCOT).Format("2006-01-02")
}

func inicioSemanaCOT(t time.Time) time.Time {
	local := t.In(zonaCOT)
	local = time.Date(local.Year(), local.Month(), local.Day(), 0, 0, 0, 0, zonaCOT)
	offset := (int(local.Weekday()) + 6) % 7
	return local.AddDate(0, 0, -offset)
}

func construirResumen(checkins []Checkin, ahora time.Time) Resumen {
	ahora = ahora.In(zonaCOT)
	hoy := fechaCOT(ahora)

	dias := make(map[string]bool, len(checkins))
	for _, checkin := range checkins {
		fecha := checkin.Fecha
		if fecha == "" && !checkin.CreadoEn.IsZero() {
			fecha = fechaCOT(checkin.CreadoEn)
		}
		if fecha != "" {
			dias[fecha] = true
		}
	}

	ordenados := append([]Checkin(nil), checkins...)
	sort.SliceStable(ordenados, func(i, j int) bool {
		return ordenados[i].CreadoEn.After(ordenados[j].CreadoEn)
	})

	var ultima *SesionResumen
	var anterior *SesionResumen
	if len(ordenados) > 0 {
		s := sesionDe(ordenados[0])
		ultima = &s
	}
	if len(ordenados) > 1 {
		s := sesionDe(ordenados[1])
		anterior = &s
	}

	cursor := ahora
	if !dias[hoy] {
		cursor = ahora.AddDate(0, 0, -1)
	}
	racha := 0
	for dias[fechaCOT(cursor)] {
		racha++
		cursor = cursor.AddDate(0, 0, -1)
	}

	inicio := inicioSemanaCOT(ahora)
	etiquetas := []string{"L", "M", "M", "J", "V", "S", "D"}
	semana := make([]DiaResumen, 0, 7)
	diasSemana := 0
	for i := 0; i < 7; i++ {
		fecha := fechaCOT(inicio.AddDate(0, 0, i))
		hecha := dias[fecha]
		if hecha {
			diasSemana++
		}
		semana = append(semana, DiaResumen{
			Fecha:    fecha,
			Etiqueta: etiquetas[i],
			Hecha:    hecha,
			Hoy:      fecha == hoy,
		})
	}

	return Resumen{
		Hoy:           dias[hoy],
		Racha:         racha,
		MetaSemanal:   metaSemanal,
		DiasSemana:    diasSemana,
		Semana:        semana,
		TotalSesiones: len(checkins),
		Ultima:        ultima,
		Anterior:      anterior,
	}
}

func sesionDe(checkin Checkin) SesionResumen {
	clase := checkin.ClaseNombre
	if clase == "" {
		clase = "Entrenamiento"
	}
	return SesionResumen{
		Fecha:       checkin.Fecha,
		ClaseID:     checkin.ClaseID,
		ClaseNombre: clase,
		TotalReps:   checkin.TotalReps,
		Perfectas:   checkin.Perfectas,
		MejorCombo:  checkin.MejorCombo,
		DuracionSec: checkin.DuracionSec,
		Score:       checkin.Score,
	}
}
