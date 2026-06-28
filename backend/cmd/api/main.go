package main

import (
	"fmt"
	"log"
	"mini-product-catalog/backend/config"
	router "mini-product-catalog/backend/internal/delivery/http"
	"net/http"
	"os"

	"github.com/rs/cors"
)

func printError(err error) {
	if err != nil {
		log.Fatalf("Error: %v\n", err)
		return
	}
}
func getEnv(key, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	return value
}
func main() {
	db, err := config.ConnectDatabase()

	printError(err)

	mux := router.InitializeRouter()
	port := getEnv("PORT", "8080")
	fmt.Printf("Server is running on http://localhost:%s\n", port)
	origins := getEnv("CORS_ALLOWED_ORIGINS", "*")

	if origins == "*" {
		log.Println("WARNING: CORS_ALLOWED_ORIGINS is set to '*', allowing all origins. This is not recommended for production.")
	}

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

	defer db.Close()

	if err = http.ListenAndServe(fmt.Sprintf(":%s", port), corsHandler.Handler(mux)); err != nil {
		printError(err)
	}
}
