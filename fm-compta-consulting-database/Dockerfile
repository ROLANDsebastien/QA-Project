FROM mongo:6.0

COPY init-scripts/ /docker-entrypoint-initdb.d/

EXPOSE 27017

ENV MONGO_INITDB_DATABASE=compta_db

ENV MONGO_INITDB_ROOT_USERNAME=admin
ENV MONGO_INITDB_ROOT_PASSWORD=password

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD mongosh --quiet --eval 'db.runCommand("ping").ok' localhost:27017/compta_db || exit 1
