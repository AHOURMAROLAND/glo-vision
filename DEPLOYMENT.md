# Glo Vision — Guide de déploiement complet

## Table des matières

1. Configuration Green API (WhatsApp)
2. Configuration PayDunya
3. Déploiement PythonAnywhere (Backend)
4. Déploiement Vercel (Frontend)
5. Adaptation WebSocket → Polling
6. Checklist finale

---

## 1. Configuration Green API (WhatsApp)

### Créer le compte

1. Va sur **https://green-api.com**
2. Crée un compte gratuit
3. Crée une nouvelle instance
4. Tu obtiens deux clés : `INSTANCE_ID` et `TOKEN`

### Connecter ton numéro WhatsApp

1. Dans le dashboard Green API → clique sur ton instance
2. Scanne le QR code avec WhatsApp sur le téléphone dédié
3. Le statut passe à **authorized** — c'est bon

> **Important** : utilise un numéro SIM dédié uniquement au bot.
> Ne jamais utiliser ce numéro manuellement pour éviter le ban.
> Volume max recommandé : 50-80 messages / jour en gratuit.

### Ajouter dans .env

```env
GREEN_API_INSTANCE_ID=ton_instance_id
GREEN_API_TOKEN=ton_token
NUMERO_ADMIN_WHATSAPP=22890XXXXXX
```

### Messages envoyés automatiquement

| Déclencheur           | Destinataire | Contenu                   |
| --------------------- | ------------ | ------------------------- |
| Commande créée        | Admin        | Détails commande + photos |
| Statut → PAYEE_AVANCE | Client       | Reçu d'avance texte + PDF |
| Statut → PRETE        | Client       | QR code + message retrait |
| Statut → SOLDEE       | Client       | Reçu final texte + PDF    |

---

## 2. Configuration PayDunya

### Créer le compte

1. Va sur **https://app.paydunya.com**
2. Crée un compte business
3. Va dans **Paramètres → API**
4. Copie les 3 clés : Master Key, Private Key, Token

### Mode test d'abord

```env
PAYDUNYA_MASTER_KEY=ta_master_key_test
PAYDUNYA_PRIVATE_KEY=ta_private_key_test
PAYDUNYA_TOKEN=ton_token_test
PAYDUNYA_MODE=test
```

### Moyens de paiement supportés

- Orange Money
- Wave
- Carte bancaire Visa/Mastercard
- Moov Money

### Flux paiement

```
Client clique "Payer"
  → Backend crée invoice PayDunya
  → PayDunya retourne lien de paiement
  → Client redirigé sur page PayDunya
  → Client paie avec son moyen préféré
  → PayDunya envoie callback POST sur /api/paiements/callback/
  → Backend vérifie response_code === "00"
  → Commande → PAYEE_AVANCE
  → Signal → reçu WhatsApp envoyé
```

### Callback URL

En développement — utilise ngrok :

```bash
# Installer ngrok
winget install ngrok

# Exposer Django
ngrok http 8000
# → obtiens une URL genre https://abc123.ngrok.io
```

```env
BACKEND_URL=https://abc123.ngrok.io
```

En production :

```env
BACKEND_URL=https://ton-app.pythonanywhere.com
```

### Passer en mode live

Quand tout est testé :

```env
PAYDUNYA_MODE=live
PAYDUNYA_MASTER_KEY=ta_master_key_live
PAYDUNYA_PRIVATE_KEY=ta_private_key_live
PAYDUNYA_TOKEN=ton_token_live
```

---

## 3. Déploiement PythonAnywhere (Backend Django)

### Pourquoi PythonAnywhere

- Gratuit pour toujours (plan Beginner)
- Django natif — très simple à configurer
- SQLite inclus
- URL gratuite : `ton-nom.pythonanywhere.com`
- **Limite** : pas de WebSocket en gratuit → on utilise le polling

### Étapes de déploiement

**1. Créer le compte**
Va sur **https://www.pythonanywhere.com** → créer compte gratuit

**2. Ouvrir une console Bash**
Dans le dashboard → Consoles → Bash

**3. Cloner le repo**

```bash
git clone https://github.com/AHOURMAROLAND/glo-vision.git
cd glo-vision/glo_vision
```

**4. Créer le virtualenv**

```bash
mkvirtualenv --python=/usr/bin/python3.12 glovision
pip install -r requirements.txt
```

**5. Créer le fichier .env**

```bash
cat > .env << 'EOF'
DEBUG=False
SECRET_KEY=une-vraie-cle-secrete-tres-longue-et-aleatoire
ALLOWED_HOSTS=ton-nom.pythonanywhere.com
DEFAULT_FILE_STORAGE=cloudinary_storage.storage.MediaCloudinaryStorage
CLOUDINARY_CLOUD_NAME=ton_cloud_name
CLOUDINARY_API_KEY=ta_api_key
CLOUDINARY_API_SECRET=ton_api_secret
GREEN_API_INSTANCE_ID=ton_instance_id
GREEN_API_TOKEN=ton_token
NUMERO_ADMIN_WHATSAPP=22890XXXXXX
PAYDUNYA_MASTER_KEY=ta_master_key
PAYDUNYA_PRIVATE_KEY=ta_private_key
PAYDUNYA_TOKEN=ton_token
PAYDUNYA_MODE=live
FRONTEND_URL=https://glo-vision.vercel.app
BACKEND_URL=https://ton-nom.pythonanywhere.com
SESSION_COOKIE_AGE=1800
EOF
```

**6. Migrations et superuser**

```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py collectstatic --noinput
```

**7. Configurer le WSGI**
Dans PythonAnywhere → Web → Add new web app → Manual config → Python 3.12

Dans le fichier WSGI (cliquer sur le lien) remplace tout par :

```python
import os
import sys

path = '/home/ton-nom/glo-vision/glo_vision'
if path not in sys.path:
    sys.path.append(path)

os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
```

**8. Configurer le virtualenv**
Dans Web → Virtualenv → mettre :

```
/home/ton-nom/.virtualenvs/glovision
```

**9. Fichiers statiques**
Dans Web → Static files :

```
URL: /static/    Directory: /home/ton-nom/glo-vision/glo_vision/staticfiles
URL: /media/     Directory: /home/ton-nom/glo-vision/glo_vision/media
```

**10. Recharger le site**
Clique **Reload** → ton site est en ligne !

### Mettre à jour après un git push

```bash
cd ~/glo-vision
git pull
cd glo_vision
workon glovision
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
```

Puis **Reload** dans Web.

---

## 4. Déploiement Vercel (Frontend React)

### Pourquoi Vercel

- 100% gratuit
- Déploiement automatique depuis GitHub
- CDN mondial ultra rapide
- HTTPS automatique

### Étapes

**1. Créer le compte**
Va sur **https://vercel.com** → Sign up with GitHub

**2. Importer le projet**

- New Project → Import `glo-vision`
- **Root Directory** : `frontend`
- **Build Command** : `npm run build`
- **Output Directory** : `dist`

**3. Variables d'environnement**
Dans Settings → Environment Variables :

```
VITE_API_URL = https://ton-nom.pythonanywhere.com/api
VITE_WS_URL  = https://ton-nom.pythonanywhere.com/ws
```

**4. Déployer**
Clique Deploy → ton frontend est en ligne sur `glo-vision.vercel.app`

### Mettre à jour automatiquement

Chaque `git push` sur la branche `main` redéploie automatiquement. Rien à faire !

---

## 5. Adaptation WebSocket → Polling (PythonAnywhere)

PythonAnywhere gratuit ne supporte pas les WebSockets.
On remplace par du polling toutes les 30 secondes.

### Dans `src/pages/AdminDashboard.jsx`

Remplace la fonction `connecterWS` par :

```javascript
const connecterWS = () => {
  // Polling toutes les 30 secondes à la place du WebSocket
  const interval = setInterval(() => {
    chargerCommandes();
  }, 30000);

  // Stocker l'interval pour le nettoyer
  wsRef.current = { close: () => clearInterval(interval) };
};
```

> Quand tu migres vers Railway ou un VPS, tu remets le vrai
> WebSocket et les notifications sont instantanées.

---

## 6. Configuration Cloudinary (Stockage photos)

### Pourquoi Cloudinary

- 25 GB gratuit
- Conservation qualité originale
- URLs directes pour affichage
- Parfait pour les photos HQ

### Créer le compte

1. Va sur **https://cloudinary.com**
2. Crée un compte gratuit
3. Dashboard → API Keys → copie les 3 valeurs

```env
CLOUDINARY_CLOUD_NAME=ton_cloud_name
CLOUDINARY_API_KEY=ta_api_key
CLOUDINARY_API_SECRET=ton_api_secret
```

---

## 7. Checklist finale avant mise en ligne

### Backend

- [ ] Variables .env production configurées
- [ ] `DEBUG=False`
- [ ] `ALLOWED_HOSTS` configuré
- [ ] Migrations appliquées
- [ ] Superuser créé
- [ ] Static files collectés
- [ ] Cloudinary configuré et testé
- [ ] Green API connecté (numéro scanné)
- [ ] PayDunya mode live configuré
- [ ] Callback URL PayDunya → URL production

### Frontend

- [ ] `VITE_API_URL` → URL PythonAnywhere
- [ ] Build sans erreurs
- [ ] Déployé sur Vercel
- [ ] Tester le flux complet en production

### Tests fonctionnels

- [ ] Créer une catégorie avec image
- [ ] Ajouter des réalisations
- [ ] Passer une commande complète
- [ ] Vérifier réception WhatsApp (reçu avance)
- [ ] Admin voit la commande dans le dashboard
- [ ] Admin télécharge les photos ZIP
- [ ] Admin marque prêt → QR généré → client reçoit WA
- [ ] Scan QR → commande soldée
- [ ] Client reçoit reçu final WhatsApp

---

## Commandes utiles

### Backend local

```bash
cd glo_vision
venv\Scripts\activate        # Windows
python manage.py runserver
```

### Frontend local

```bash
cd frontend
npm run dev
```

### Git workflow

```bash
git add .
git commit -m "feat: description"
git push
```

---

_Documentation Glo Vision v1.0 — Mars 2026_
_Stack : Django + React + Green API + PayDunya + Cloudinary_
