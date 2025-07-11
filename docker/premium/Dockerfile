FROM postgres:latest

ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=postgres
ENV PGDATA=/var/lib/postgresql/data/pgdata

COPY init-db.sh /docker-entrypoint-initdb.d/