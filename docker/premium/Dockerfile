FROM python:3.12

WORKDIR /app/

COPY server.py /app/server.py
COPY requirements.txt /app/requirements.txt
COPY setup.sh /app/setup.sh
RUN chmod +x /app/setup.sh && \
    /app/setup.sh

EXPOSE 5432

CMD ["python", "server.py"]