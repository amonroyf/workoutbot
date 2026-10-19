package main

import (
	"encoding/json"
	"log"
	"net"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"
)

type rateLimiter struct {
	mu       sync.Mutex
	clients  map[string]*clientLimit
	limit    int
	window   time.Duration
	cleanup  time.Duration
}

type clientLimit struct {
	tokens    int
	lastSeen  time.Time
}

func newRateLimiter(limit int, window, cleanup time.Duration) *rateLimiter {
	rl := &rateLimiter{
		clients: make(map[string]*clientLimit),
		limit:   limit,
		window:  window,
		cleanup: cleanup,
	}
	go rl.cleanupLoop()
	return rl
}

func (rl *rateLimiter) cleanupLoop() {
	ticker := time.NewTicker(rl.cleanup)
	defer ticker.Stop()
	for range ticker.C {
		rl.mu.Lock()
		for ip, cl := range rl.clients {
			if time.Since(cl.lastSeen) > rl.window*2 {
				delete(rl.clients, ip)
			}
		}
		rl.mu.Unlock()
	}
}

func (rl *rateLimiter) allow(ip string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	cl, exists := rl.clients[ip]

	if !exists {
		rl.clients[ip] = &clientLimit{
			tokens:   rl.limit - 1,
			lastSeen: now,
		}
		return true
	}

	elapsed := now.Sub(cl.lastSeen)
	cl.tokens += int(elapsed / rl.window)
	if cl.tokens > rl.limit {
		cl.tokens = rl.limit
	}

	if cl.tokens <= 0 {
		cl.lastSeen = now
		return false
	}

	cl.tokens--
	cl.lastSeen = now
	return true
}

func getClientIP(r *http.Request) string {
	xff := r.Header.Get("X-Forwarded-For")
	if xff != "" {
		return strings.Split(xff, ",")[0]
	}
	xri := r.Header.Get("X-Real-Ip")
	if xri != "" {
		return xri
	}
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return host
}

var (
	apiLimiter = newRateLimiter(60, time.Minute, 5*time.Minute)
)

func chainMiddleware(next http.HandlerFunc, limiter *rateLimiter) http.HandlerFunc {
	return securityHeadersMiddleware(
		corsMiddleware(
			rateLimitMiddleware(limiter,
				loggingMiddleware(next),
			),
		),
	)
}

func securityHeadersMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-Frame-Options", "DENY")
		w.Header().Set("X-XSS-Protection", "1; mode=block")
		w.Header().Set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload")
		w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
		next(w, r)
	}
}

func corsMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		allowedOrigins := []string{
			"http://localhost:5173",
			"http://localhost:8080",
		}

		if prodURL := os.Getenv("FRONTEND_URL"); prodURL != "" {
			allowedOrigins = append(allowedOrigins, prodURL)
		}

		origin := r.Header.Get("Origin")
		allowed := false
		for _, o := range allowedOrigins {
			if o == origin {
				allowed = true
				break
			}
		}

		if allowed {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			w.Header().Set("Access-Control-Max-Age", "86400")
		}

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next(w, r)
	}
}

func rateLimitMiddleware(limiter *rateLimiter, next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ip := getClientIP(r)
		if !limiter.allow(ip) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusTooManyRequests)
			json.NewEncoder(w).Encode(map[string]interface{}{
				"success": false,
				"error":   "rate_limit",
				"message": "Demasiadas requests, intenta más tarde",
			})
			return
		}
		next(w, r)
	}
}

func loggingMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		sw := &statusWriter{ResponseWriter: w, status: 200}
		next(sw, r)
		duration := time.Since(start)
		log.Printf(
			"method=%s path=%s status=%d duration=%s ip=%s",
			r.Method, r.URL.Path, sw.status, duration, getClientIP(r),
		)
	}
}

type statusWriter struct {
	http.ResponseWriter
	status int
}

func (sw *statusWriter) WriteHeader(code int) {
	sw.status = code
	sw.ResponseWriter.WriteHeader(code)
}
