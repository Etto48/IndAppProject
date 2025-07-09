#!/bin/sh
cd "$(dirname "$0")"
docker ps -q --filter "ancestor=ollama_docker" | xargs -r docker stop
docker build -t ollama_docker .
docker run -d -p 11434:11434 --rm ollama_docker