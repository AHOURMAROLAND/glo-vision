# Glo Vision — Site e-commerce photographe

Site vitrine et e-commerce pour une photographe proposant des tableaux encadrés sur mesure.

## Stack technique

- **Backend** : Django 6 + Django REST Framework
- **Frontend** : React (Vite)
- **Base de données** : SQLite (dev) → PostgreSQL (prod)
- **Bot WhatsApp** : Green API
- **Paiement** : PayDunya
- **Stockage photos** : Cloudinary
- **Temps réel** : Django Channels + WebSocket
- **QR Code** : librairie qrcode Python

## Architecture

```
glo-vision/
├── glo_vision/          # Backend Django
│   ├── apps/
│   │   ├── catalogue/   # Tableaux + réalisations
│   │   ├── commandes/   # Commandes + photos client
│   │   ├── paiements/   # PayDunya + reçus PDF
│   │   ├── qrcodes/     # Génération + validation QR
│   │   ├── whatsapp/    # Bot Green API + messages
│   │   └── notifications/ # WebSocket + stats visiteurs
│   ├── config/          # Settings + URLs + ASGI
│   └── manage.py
└── frontend/            # React (Vite)
    └── src/
        ├── components/  # Icônes, Navbar, Cards
        ├── pages/       # Toutes les pages
        ├── services/    # Appels API
        └── store/       # Zustand (panier + auth)
```

## Installation locale

### Backend

```bash
cd glo_vision
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Linux/Mac
pip install -r requirements.txt
```

Crée le fichier `.env` :

```env
DEBUG=True
SECRET_KEY=change-moi-en-production
DEFAULT_FILE_STORAGE=django.core.files.storage.FileSystemStorage
GREEN_API_INSTANCE_ID=
GREEN_API_TOKEN=
NUMERO_ADMIN_WHATSAPP=
PAYDUNYA_MASTER_KEY=
PAYDUNYA_PRIVATE_KEY=
PAYDUNYA_TOKEN=
PAYDUNYA_MODE=test
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8000
```

```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
```

Crée le fichier `frontend/.env` :

```env
VITE_API_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000/ws
```

```bash
npm run dev
```

## URLs de développement

| Service         | URL                               |
| --------------- | --------------------------------- |
| Backend API     | http://127.0.0.1:8000/api/        |
| Django Admin    | http://127.0.0.1:8000/admin/      |
| Frontend        | http://localhost:5173/            |
| Admin Dashboard | http://localhost:5173/admin/login |

## Flux de commande

1. Client consulte le catalogue
2. Clique sur un tableau → galerie des réalisations
3. Double-clic → modal commande (nb unités + upload photos)
4. Saisit nom + numéro WhatsApp (vérifié par bot)
5. Paie 50% via PayDunya (Orange Money, Wave, carte)
6. Reçoit reçu d'avance par WhatsApp (message + PDF)
7. Admin notifié en temps réel + reçoit les photos HQ
8. Admin produit le tableau
9. Admin marque "prêt" → QR code généré + envoyé au client
10. Client vient récupérer + paie solde 50%
11. Admin scanne QR code → commande clôturée
12. Client reçoit reçu final par WhatsApp (message + PDF)

## APIs disponibles

| Méthode | URL                                | Description            |
| ------- | ---------------------------------- | ---------------------- |
| GET     | /api/catalogue/                    | Liste des tableaux     |
| GET     | /api/catalogue/:id/                | Détail + réalisations  |
| POST    | /api/commandes/                    | Créer commande         |
| GET     | /api/commandes/:code/              | Détail commande        |
| PATCH   | /api/commandes/admin/:code/statut/ | Changer statut         |
| GET     | /api/commandes/admin/list/         | Liste admin            |
| GET     | /api/commandes/admin/:code/photos/ | Télécharger photos ZIP |
| POST    | /api/paiements/:code/initier/      | Initier paiement       |
| POST    | /api/paiements/callback/           | Callback IPN PayDunya  |
| POST    | /api/qrcodes/generer/:code/        | Générer QR code        |
| POST    | /api/qrcodes/valider/              | Valider QR (clôture)   |
| GET     | /api/qrcodes/verifier/:token/      | Vérifier QR public     |
| POST    | /api/whatsapp/verifier-numero/     | Vérifier n° WhatsApp   |
| GET     | /api/stats/                        | Statistiques dashboard |
| POST    | /api/auth/login/                   | Connexion admin        |
| POST    | /api/auth/logout/                  | Déconnexion admin      |
| WS      | ws://.../ws/notifications/         | Notifs temps réel      |

## Statuts de commande

```
EN_ATTENTE → PAYEE_AVANCE → EN_PRODUCTION → PRETE → RETRAIT_EN_COURS → SOLDEE
                                                                      ↘ ANNULEE
```

## Configuration production

### PythonAnywhere (Backend)

1. Créer un compte sur pythonanywhere.com
2. Ouvrir un Bash console
3. Cloner le repo : `git clone https://github.com/AHOURMAROLAND/glo-vision.git`
4. Créer virtualenv et installer requirements
5. Configurer WSGI file
6. Ajouter les variables d'environnement

### Vercel (Frontend)

1. Connecter le repo GitHub sur vercel.com
2. Dossier racine : `frontend`
3. Build command : `npm run build`
4. Output directory : `dist`
5. Ajouter variable : `VITE_API_URL=https://ton-app.pythonanywhere.com/api`

### Variables d'environnement production

```env
DEBUG=False
SECRET_KEY=une-vraie-cle-secrete-longue
ALLOWED_HOSTS=ton-app.pythonanywhere.com
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
GREEN_API_INSTANCE_ID=
GREEN_API_TOKEN=
NUMERO_ADMIN_WHATSAPP=
PAYDUNYA_MASTER_KEY=
PAYDUNYA_PRIVATE_KEY=
PAYDUNYA_TOKEN=
PAYDUNYA_MODE=live
FRONTEND_URL=https://ton-app.vercel.app
BACKEND_URL=https://ton-app.pythonanywhere.com
```

## Palette de couleurs

| Nom        | Hex     | Usage              |
| ---------- | ------- | ------------------ |
| Dark       | #1A1A2E | Fond principal     |
| Dark 2     | #0F0F1F | Fond cards         |
| Gold       | #C4963A | Couleur principale |
| Gold light | #D4A84A | Hover boutons      |
| Cream      | #F5F0E8 | Texte principal    |
| Muted      | #8B7355 | Texte secondaire   |

## Auteur

Projet développé pour **Glo Vision** — Photographie professionnelle, Lomé, Togo.

---

_Version 1.0 — Mars 2026_
