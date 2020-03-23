FROM postgres:12-alpine

ENV POSTGRES_HOST_AUTH_METHOD=trust

COPY ./init.sql /docker-entrypoint-initdb.d/