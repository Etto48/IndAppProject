FROM ollama/ollama:latest

COPY ./setup.sh /app/setup.sh
RUN chmod +x /app/setup.sh && \
    /app/setup.sh

EXPOSE 11434

CMD ["serve"]