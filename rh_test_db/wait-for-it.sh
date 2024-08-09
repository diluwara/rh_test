#!/usr/bin/env bash

set -e

host="$1"
shift
cmd="$@"

# Check if pg_isready is installed (specific to PostgreSQL)
if ! command -v pg_isready &> /dev/null
then
    echo "pg_isready could not be found, please ensure it is installed."
    exit
fi

until pg_isready -h "$host" -p 5432; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

>&2 echo "Postgres is up - executing command"
exec $cmd
