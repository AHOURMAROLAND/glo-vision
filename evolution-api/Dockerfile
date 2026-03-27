# Dockerfile pour Evolution API sur Render
FROM atendai/evolution-api:latest

# Variables d'environnement par défaut
ENV SERVER_PORT=8080
ENV SERVER_URL=${RENDER_EXTERNAL_URL}

# Créer le répertoire pour les données persistantes
RUN mkdir -p /evolution/instances && chmod 777 /evolution/instances

# Exposer le port
EXPOSE 8080

# Commande de démarrage
CMD ["node", "./dist/src/main.js"]
