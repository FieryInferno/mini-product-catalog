package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"mini-product-catalog/backend/internal/handlers"

	"github.com/gorilla/mux"
	_ "github.com/lib/pq"
	"github.com/rs/cors"
)

type healthResponse struct {
	Status string `json:"status"`
}

func main() {
	db, err := connectWithRetry()
	if err != nil {
		log.Fatalf("database connection failed: %v", err)
	}
	defer db.Close()

	router := mux.NewRouter()
	router.Use(jsonMiddleware)

	router.HandleFunc("/health", healthHandler).Methods(http.MethodGet)
	handler := handlers.NewProductHandler(db)
	handler.RegisterRoutes(router)

	port := getEnv("PORT", "8080")
	origins := getEnv("CORS_ALLOWED_ORIGINS", "*")

	if origins == "*" {
		log.Println("WARNING: CORS_ALLOWED_ORIGINS is set to '*', allowing all origins. This is not recommended for production.")
	}

	log.Printf("backend listening on :%s", port)
	corsHandler := cors.New(cors.Options{
		AllowedOrigins: []string{origins},
		AllowedMethods: []string{
			http.MethodGet,
			http.MethodPost,
			http.MethodPut,
			http.MethodDelete,
			http.MethodOptions,
		},
		AllowedHeaders: []string{"Content-Type"},
	})

	if err := http.ListenAndServe(":"+port, corsHandler.Handler(router)); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}

func connectWithRetry() (*sql.DB, error) {
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		getEnv("DB_HOST", "db"),
		getEnv("DB_PORT", "5432"),
		getEnv("DB_USER", "postgres"),
		getEnv("DB_PASSWORD", "postgres"),
		getEnv("DB_NAME", "products"),
	)

	var db *sql.DB
	var err error
	for i := 0; i < 20; i++ {
		db, err = sql.Open("postgres", dsn)
		if err == nil {
			err = db.Ping()
		}
		if err == nil {
			return db, nil
		}
		log.Printf("waiting for database (%d/20): %v", i+1, err)
		time.Sleep(2 * time.Second)
	}

	return nil, err
}

func healthHandler(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(healthResponse{Status: "ok"})
}

func jsonMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		next.ServeHTTP(w, r)
	})
}

func getEnv(key, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	return value
}
