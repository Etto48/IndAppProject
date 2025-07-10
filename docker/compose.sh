#!/bin/bash

cd "$(dirname "$0")" || exit 1

if [[ $1 == "prod" ]] || [[ $1 == "" ]]; then
    echo "Running in production mode"
    docker compose up --build
elif [[ $1 == "dev" ]]; then
    echo "Running in development mode"
    docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build --watch
elif [[ $1 == "backend" ]]; then
    echo "Running backend only"
    docker compose up --build ollama piper
elif [[ $1 == "help"]] || [[ $1 == "--help" ]] || [[ $1 == "-h" ]]; then
    echo "Usage: $0 [prod|dev|backend]"
    echo "  prod: Run in production mode (default)"
    echo "  dev: Run in development mode with hot reloading"
    echo "  backend: Run only the backend services"
    echo "  help: Show this help message"
    exit 0
else
    echo "Invalid mode specified. Use 'prod', 'dev', or 'backend'."
    exit 1
fi