#!/bin/bash

cd "$(dirname "$0")" || exit 1

function cleanup {
    if [[ $1 == "prod" ]] || [[ $1 == "" ]]; then
        docker compose --profile prod rm -f
    elif [[ $1 == "dev" ]]; then
        docker compose --profile dev rm -f
    elif [[ $1 == "backend" ]]; then
        docker compose --profile backend rm -f
    fi
    echo "Cleanup $1 completed."
}

trap "cleanup $1" EXIT

if [[ $1 == "prod" ]] || [[ $1 == "" ]]; then
    echo "Running in production mode"
    docker compose --profile prod up --build
elif [[ $1 == "dev" ]]; then
    echo "Running in development mode"
    docker compose --profile dev up --build
elif [[ $1 == "backend" ]]; then
    echo "Running backend only in development mode"
    docker compose --profile backend up --build
elif [[ $1 == "help" ]] || [[ $1 == "--help" ]] || [[ $1 == "-h" ]]; then
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
