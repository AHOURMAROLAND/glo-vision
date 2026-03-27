#!/bin/bash
# Script de déploiement pour Evolution API sur Render
# Usage: ./deploy-to-render.sh

echo "🚀 Déploiement Evolution API sur Render.com"
echo "============================================"

# Vérifier si Render CLI est installé
if ! command -v render &> /dev/null; then
    echo "❌ Render CLI non installé"
    echo "Installe-le avec: npm install -g @render/cli"
    echo "Ou utilise le dashboard web: https://dashboard.render.com"
    exit 1
fi

# Vérifier la connexion
if ! render whoami &> /dev/null; then
    echo "❌ Non connecté à Render"
    echo "Connecte-toi avec: render login"
    exit 1
fi

echo "✅ Connecté à Render"

# Créer le blueprint
echo "📦 Création du service Evolution API..."
render blueprint apply --file render.yaml

echo ""
echo "✅ Déploiement initié !"
echo ""
echo "📋 Prochaines étapes:"
echo "1. Va sur https://dashboard.render.com"
echo "2. Attends que le service démarre (2-3 minutes)"
echo "3. Récupère l'URL du service (ex: https://evolution-api-xxx.onrender.com)"
echo "4. Mets à jour EVOLUTION_API_URL dans ton .env Django"
echo "5. Crée une instance via l'API et scanne le QR code"
echo ""
echo "🔗 URL de management: https://dashboard.render.com"
