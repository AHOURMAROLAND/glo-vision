# 📘 Guide Déploiement Evolution API sur Render

## 🎯 Résumé
Evolution API est maintenant configuré pour remplacer le bot Baileys local.

## 📁 Fichiers créés
- `evolution-api/Dockerfile` - Configuration Docker
- `evolution-api/render.yaml` - Blueprint Render
- `evolution-api/docker-compose.yml` - Pour test local
- `apps/whatsapp/evolution_client.py` - Client Django
- `apps/whatsapp/bot_client.py` - Mise à jour pour utiliser Evolution

## 🚀 Déploiement

### Option 1: Via Dashboard Render (Recommandé)
1. Va sur https://dashboard.render.com
2. Clique "New +" → "Web Service"
3. Connecte ton repo GitHub ou upload le dossier
4. Sélectionne le runtime "Docker"
5. Configure:
   - **Name**: `evolution-api-glo-vision`
   - **Region**: Frankfurt (Europe)
   - **Plan**: Free ($0/mois)
   - **Dockerfile Path**: `./Dockerfile`
6. Variables d'environnement:
   ```
   SERVER_URL=https://evolution-api-glo-vision.onrender.com
   AUTHENTICATION_API_KEY=glo_vision_secret_key_2024
   AUTHENTICATION_EXPOSE_IN_FETCH_INSTANCES=true
   DATABASE_ENABLED=false
   ```
7. Disque persistant:
   - **Name**: `evolution-data`
   - **Mount Path**: `/evolution/instances`
   - **Size**: 1 GB (Free)
8. Clique "Create Web Service"

### Option 2: Via Render CLI
```bash
cd evolution-api
render blueprint apply
```

## 🔧 Configuration Django

### Variables d'environnement (.env)
```env
EVOLUTION_API_URL=https://evolution-api-glo-vision.onrender.com
EVOLUTION_API_KEY=glo_vision_secret_key_2024
EVOLUTION_INSTANCE=glo-vision-bot
```

## 📱 Connexion WhatsApp

### 1. Créer l'instance
```bash
curl -X POST "https://evolution-api-glo-vision.onrender.com/instance/create" \
  -H "apikey: glo_vision_secret_key_2024" \
  -H "Content-Type: application/json" \
  -d '{
    "instanceName": "glo-vision-bot",
    "token": "glo_vision_secret_key_2024",
    "qrcode": true
  }'
```

### 2. Récupérer le QR code
```bash
curl "https://evolution-api-glo-vision.onrender.com/instance/connect/glo-vision-bot" \
  -H "apikey: glo_vision_secret_key_2024"
```

### 3. Scanner avec WhatsApp
1. Ouvre WhatsApp sur ton téléphone
2. Menu ⋮ → Appareils connectés → Connecter un appareil
3. Scanne le QR code affiché

## ✅ Test

### Vérifier connexion
```bash
python manage.py shell -c "
from apps.whatsapp.bot_client import bot_est_connecte
print('Connecté:', bot_est_connecte())
"
```

### Envoyer message test
```bash
python manage.py shell -c "
from apps.whatsapp.bot_client import envoyer_message
result = envoyer_message('22890940402', 'Test depuis Evolution API!')
print(result)
"
```

## 🎉 Félicitations !
Le bot WhatsApp est maintenant hébergé sur Render et prêt à envoyer des messages !
