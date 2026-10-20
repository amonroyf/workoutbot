package main

import (
	"testing"
	"time"
)

func checkinEn(fecha string, hora int, reps int) Checkin {
	dia, _ := time.ParseInLocation("2006-01-02", fecha, zonaCOT)
	return Checkin{
		UID:         "u1",
		Fecha:       fecha,
		CreadoEn:    dia.Add(time.Duration(hora) * time.Hour),
		ClaseID:     "clasico",
		ClaseNombre: "Clásico",
		TotalReps:   reps,
		Perfectas:   reps / 2,
		MejorCombo:  reps,
		DuracionSec: 160,
		Score:       reps,
	}
}

func TestResumenVacio(t *testing.T) {
	ahora := time.Date(2026, 10, 21, 9, 0, 0, 0, zonaCOT)
	r := construirResumen(nil, ahora)

	if r.Hoy || r.Racha != 0 || r.DiasSemana != 0 || r.TotalSesiones != 0 {
		t.Fatalf("resumen vacio inesperado: %+v", r)
	}
	if len(r.Semana) != 7 {
		t.Fatalf("semana debe tener 7 dias, tiene %d", len(r.Semana))
	}
	if r.Ultima != nil || r.Anterior != nil {
		t.Fatal("no debe haber sesiones")
	}
}

func TestRachaYMetaSemanal(t *testing.T) {
	ahora := time.Date(2026, 10, 21, 9, 0, 0, 0, zonaCOT)
	checkins := []Checkin{
		checkinEn("2026-10-19", 8, 10),
		checkinEn("2026-10-20", 8, 11),
		checkinEn("2026-10-21", 8, 12),
		checkinEn("2026-10-21", 18, 13),
	}

	r := construirResumen(checkins, ahora)

	if !r.Hoy {
		t.Fatal("hoy debe estar marcado")
	}
	if r.Racha != 3 {
		t.Fatalf("racha esperada 3, obtuve %d", r.Racha)
	}
	if r.DiasSemana != 3 || r.MetaSemanal != 3 {
		t.Fatalf("semana esperada 3/3, obtuve %d/%d", r.DiasSemana, r.MetaSemanal)
	}
	if r.TotalSesiones != 4 {
		t.Fatalf("sesiones esperadas 4, obtuve %d", r.TotalSesiones)
	}
	if r.Ultima == nil || r.Ultima.TotalReps != 13 {
		t.Fatalf("ultima sesion inesperada: %+v", r.Ultima)
	}
	if r.Anterior == nil || r.Anterior.TotalReps != 12 {
		t.Fatalf("sesion anterior inesperada: %+v", r.Anterior)
	}
}

func TestRachaSeMantieneSiHoyNoHaEntrenado(t *testing.T) {
	ahora := time.Date(2026, 10, 21, 9, 0, 0, 0, zonaCOT)
	checkins := []Checkin{
		checkinEn("2026-10-19", 8, 10),
		checkinEn("2026-10-20", 8, 11),
	}

	r := construirResumen(checkins, ahora)

	if r.Hoy {
		t.Fatal("hoy no debe estar marcado")
	}
	if r.Racha != 2 {
		t.Fatalf("racha esperada 2, obtuve %d", r.Racha)
	}
	if r.DiasSemana != 2 {
		t.Fatalf("dias de semana esperados 2, obtuve %d", r.DiasSemana)
	}
}

func TestSemanaEmpiezaLunesYMarcaHoy(t *testing.T) {
	ahora := time.Date(2026, 10, 21, 9, 0, 0, 0, zonaCOT)
	r := construirResumen(nil, ahora)

	if r.Semana[0].Fecha != "2026-10-19" || r.Semana[0].Etiqueta != "L" {
		t.Fatalf("inicio de semana inesperado: %+v", r.Semana[0])
	}
	if r.Semana[2].Fecha != "2026-10-21" || !r.Semana[2].Hoy {
		t.Fatalf("hoy debe ser el tercer dia: %+v", r.Semana[2])
	}
	if r.Semana[6].Etiqueta != "D" {
		t.Fatalf("ultimo dia debe ser domingo: %+v", r.Semana[6])
	}
}

func TestFechaVaciaUsaCreadoEn(t *testing.T) {
	ahora := time.Date(2026, 10, 21, 9, 0, 0, 0, zonaCOT)
	c := checkinEn("", 8, 10)
	c.Fecha = ""
	c.CreadoEn = time.Date(2026, 10, 21, 8, 0, 0, 0, zonaCOT)

	r := construirResumen([]Checkin{c}, ahora)

	if !r.Hoy || r.Racha != 1 {
		t.Fatalf("debia contar el checkin por creado_en: %+v", r)
	}
}
