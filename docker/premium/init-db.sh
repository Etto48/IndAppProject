#!/bin/bash

set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
	CREATE USER premium;
	CREATE DATABASE premium;
	GRANT ALL PRIVILEGES ON DATABASE premium TO premium;
EOSQL

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "premium" <<-EOSQL
    CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE
    );
EOSQL

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "premium" <<-EOSQL
    CREATE TABLE IF NOT EXISTS subscriptions (
        id INTEGER PRIMARY KEY,
        tripadvisor_id INTEGER NOT NULL,
        FOREIGN KEY (id) REFERENCES customers(id) ON DELETE CASCADE
    );
EOSQL
