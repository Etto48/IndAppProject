FROM python:3.10

WORKDIR /app/

COPY server.py /app/server.py
COPY requirements.txt /app/requirements.txt
COPY setup.sh /app/setup.sh
RUN chmod +x /app/setup.sh && \
    /app/setup.sh

EXPOSE 5000

CMD ["python", "server.py"]