FROM ollama/ollama:latest

COPY ./run_ollama.sh /root/run_ollama.sh
RUN chmod +x /root/run_ollama.sh && \
    /root/run_ollama.sh

EXPOSE 11434

CMD ["serve"]