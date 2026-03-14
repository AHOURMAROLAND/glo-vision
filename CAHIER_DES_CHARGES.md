# Cahier des charges — Glo Vision

## Site e-commerce de tableaux encadrés sur mesure

**Version** : 1.0  
**Date** : Mars 2026  
**Statut** : Version 1 livrée

---

## 1. Présentation du projet

### 1.1 Contexte

Glo Vision est une entreprise de photographie professionnelle basée à Lomé, Togo. Elle propose à ses clients des tableaux encadrés personnalisés à partir de leurs propres photos. Le processus actuel est entièrement manuel (commandes par WhatsApp, paiements en espèces, suivi papier), ce qui limite la visibilité et la croissance de l'activité.

### 1.2 Objectif

Créer une vitrine e-commerce professionnelle permettant aux clients de :

- Consulter les modèles de tableaux disponibles
- Voir les réalisations passées pour chaque modèle
- Passer une commande en uploadant leur photo
- Payer un acompte en ligne de manière sécurisée
- Suivre leur commande et être notifié par WhatsApp

Et permettant à l'administratrice (photographe) de :

- Gérer le catalogue de tableaux
- Recevoir et traiter les commandes
- Notifier les clients automatiquement
- Clôturer les commandes via QR code
- Consulter les statistiques de son activité

### 1.3 Utilisateurs cibles

| Utilisateur | Description                                           |
| ----------- | ----------------------------------------------------- |
| Client      | Tout visiteur du site souhaitant commander un tableau |
| Admin       | La photographe — gère le catalogue et les commandes   |

---

## 2. Spécifications fonctionnelles

### 2.1 Module Catalogue (côté client)

#### 2.1.1 Page d'accueil

- Affichage d'une grille de tous les modèles de tableaux disponibles
- Chaque carte affiche : image principale, titre, prix unitaire
- Skeleton loader pendant le chargement
- Section hero avec présentation de l'activité
- Indicateurs : qualité originale conservée, acompte 50%, suivi WhatsApp

#### 2.1.2 Page détail tableau

- Accès par clic simple sur une carte de la page d'accueil
- Affichage du titre, description, prix unitaire
- Galerie de toutes les réalisations faites avec ce modèle
- Indication "Double-clic pour commander" sur chaque photo
- Bouton "Commander ce modèle" en haut de page

### 2.2 Module Commande (côté client)

#### 2.2.1 Modal de commande

- Ouverture par double-clic sur une réalisation ou clic sur "Commander"
- Sélection du nombre d'unités avec calcul automatique du prix
- Prix total et acompte (50%) affichés en temps réel
- Zone d'upload de photo(s) avec drag & drop
- Formats acceptés : JPG, PNG, WEBP
- Conservation de la qualité originale des photos
- Possibilité d'uploader plusieurs photos
- Aperçu des photos sélectionnées avec suppression individuelle

#### 2.2.2 Page panier

- Récapitulatif de tous les articles ajoutés
- Aperçu miniature des photos uploadées
- Possibilité de supprimer un article
- Total, acompte et solde affichés clairement
- Bouton "Valider ma commande"

#### 2.2.3 Page validation (informations client)

- Saisie du nom complet
- Saisie du numéro WhatsApp
- Vérification automatique du numéro via bot Green API
- Affichage du pseudo WhatsApp pour confirmation d'identité
- Si numéro invalide : invitation à ressaisir
- Résumé de la commande affiché en sidebar

#### 2.2.4 Page paiement

- Récapitulatif final : client, commandes, montants
- Montant de l'acompte (50%) mis en évidence
- Bouton "Payer via PayDunya"
- Redirection vers interface de paiement PayDunya
- Moyens de paiement : Orange Money, Wave, carte bancaire

#### 2.2.5 Page confirmation

- Affichage après paiement réussi
- Code commande unique affiché
- Détails : tableau, client, acompte payé, solde restant, statut
- Message d'information sur la suite du processus

### 2.3 Module WhatsApp (automatique)

| Déclencheur               | Message envoyé                     | Destinataire |
| ------------------------- | ---------------------------------- | ------------ |
| Nouvelle commande créée   | Notification avec détails commande | Admin        |
| Paiement acompte confirmé | Reçu d'avance (texte + PDF)        | Client       |
| Tableau marqué prêt       | "Votre tableau est prêt" + QR code | Client       |
| Commande clôturée         | Reçu final (texte + PDF)           | Client       |

### 2.4 Module QR Code (clôture commande)

1. Admin marque le tableau comme "prêt" dans le dashboard
2. Système génère un QR code unique lié à la commande
3. Bot WhatsApp envoie le lien QR au client
4. Client ouvre le lien sur son téléphone → affiche le QR code
5. Client vient en personne, présente son téléphone
6. Admin scanne le QR code depuis le dashboard
7. Système valide le token, clôture la commande
8. Bot envoie reçu final au client

- QR code à usage unique
- QR code expiré après utilisation
- Token lié au numéro WhatsApp du client

### 2.5 Module Paiement PayDunya

- Paiement de 50% du montant total lors de la commande
- Paiement du solde 50% en personne lors du retrait
- Callback IPN pour confirmation automatique
- Génération automatique de reçu PDF (acompte et final)
- Reçu envoyé par WhatsApp après chaque paiement

### 2.6 Module Admin — Dashboard

#### 2.6.1 Gestion catalogue

- Créer un modèle de tableau (titre, description, prix, image)
- Modifier un modèle existant
- Supprimer un modèle
- Activer / désactiver la visibilité d'un modèle
- Ajouter des photos de réalisation à chaque modèle
- Supprimer des photos de réalisation

#### 2.6.2 Gestion commandes

- Liste de toutes les commandes avec filtres par statut
- Détail d'une commande : client, tableau, photos, montants
- Changement de statut manuel
- Téléchargement des photos client en ZIP (haute qualité)
- Génération du QR code de retrait
- Annulation d'une commande

#### 2.6.3 Notifications temps réel

- Notification instantanée à chaque nouvelle commande
- Mise à jour automatique de la liste des commandes
- Historique des 10 dernières notifications

#### 2.6.4 Statistiques

- KPIs : visiteurs du jour, commandes du jour, total commandes
- Revenus : total encaissé, avances, soldes
- Graphique visiteurs sur 7 jours
- Graphique commandes sur 7 jours
- Répartition des commandes par statut (donut chart)

### 2.7 Cycle de vie d'une commande

```
EN_ATTENTE
    ↓ (paiement 50% confirmé)
PAYEE_AVANCE
    ↓ (admin démarre la production)
EN_PRODUCTION
    ↓ (admin marque prêt + génère QR)
PRETE
    ↓ (client vient récupérer)
RETRAIT_EN_COURS
    ↓ (admin scanne QR)
SOLDEE

À tout moment → ANNULEE
```

---

## 3. Spécifications techniques

### 3.1 Stack technologique

| Composant        | Technologie              | Version |
| ---------------- | ------------------------ | ------- |
| Backend          | Django                   | 6.0     |
| API REST         | Django REST Framework    | 3.x     |
| Frontend         | React (Vite)             | 18      |
| État global      | Zustand                  | 4.x     |
| Routing          | React Router DOM         | 6.x     |
| HTTP Client      | Axios                    | 1.x     |
| Upload           | React Dropzone           | 14.x    |
| Notifications UI | React Hot Toast          | 2.x     |
| Base de données  | SQLite (dev)             | —       |
| Temps réel       | Django Channels + Daphne | 4.x     |
| Bot WhatsApp     | Green API                | —       |
| Paiement         | PayDunya                 | v1      |
| Stockage photos  | Cloudinary (prod)        | —       |
| QR Code          | qrcode (Python)          | 8.x     |
| PDF              | ReportLab                | 4.x     |

### 3.2 Architecture backend

```
glo_vision/
├── apps/
│   ├── catalogue/        # Modèles Tableau, PhotoRealisation
│   ├── commandes/        # Modèles Commande, PhotoCommande + signals
│   ├── paiements/        # Modèle Paiement + PayDunya client + PDF
│   ├── qrcodes/          # Modèle QRCode + génération + validation
│   ├── whatsapp/         # Green API client + templates messages
│   └── notifications/    # WebSocket consumer + stats + middleware visiteurs
└── config/               # Settings + URLs + ASGI
```

### 3.3 Architecture frontend

```
frontend/src/
├── components/
│   ├── icons/            # 7 icônes SVG (Logo, Panier, Upload, Image, Check, Close, Arrow)
│   ├── common/           # Navbar, Footer, SkeletonCard
│   ├── catalogue/        # TableauCard
│   └── panier/           # ModalCommande
├── pages/                # 9 pages + 2 pages admin
├── services/             # api.js + catalogueService.js + commandeService.js
└── store/                # panierStore.js + authStore.js
```

### 3.4 Modèles de données

#### Tableau

| Champ            | Type           | Description           |
| ---------------- | -------------- | --------------------- |
| id               | BigInt PK      | Identifiant           |
| titre            | CharField(200) | Nom du modèle         |
| description      | TextField      | Description           |
| prix_unitaire    | DecimalField   | Prix par unité        |
| image_principale | ImageField     | Image de présentation |
| disponible       | BooleanField   | Visibilité catalogue  |
| created_at       | DateTimeField  | Date création         |

#### Commande

| Champ           | Type                 | Description              |
| --------------- | -------------------- | ------------------------ |
| id              | BigInt PK            | Identifiant              |
| code            | CharField(20)        | Code unique GLO-XXXXXXXX |
| tableau         | FK Tableau           | Modèle commandé          |
| nom_client      | CharField(200)       | Nom du client            |
| numero_whatsapp | CharField(20)        | Numéro WA client         |
| pseudo_whatsapp | CharField(200)       | Pseudo WA vérifié        |
| nb_unites       | PositiveIntegerField | Quantité                 |
| montant_total   | DecimalField         | Prix total               |
| montant_avance  | DecimalField         | 50% acompte              |
| montant_solde   | DecimalField         | 50% solde                |
| statut          | CharField choices    | Statut commande          |

#### QRCode

| Champ    | Type              | Description     |
| -------- | ----------------- | --------------- |
| commande | OneToOne Commande | Commande liée   |
| token    | UUIDField         | Token unique    |
| utilise  | BooleanField      | Déjà scanné     |
| expire_a | DateTimeField     | Date expiration |

### 3.5 APIs

| Méthode | Endpoint                               | Auth   | Description           |
| ------- | -------------------------------------- | ------ | --------------------- |
| GET     | /api/catalogue/                        | Public | Liste tableaux        |
| GET     | /api/catalogue/:id/                    | Public | Détail tableau        |
| POST    | /api/catalogue/admin/creer/            | Admin  | Créer tableau         |
| PATCH   | /api/catalogue/admin/:id/              | Admin  | Modifier tableau      |
| DELETE  | /api/catalogue/admin/:id/              | Admin  | Supprimer tableau     |
| POST    | /api/catalogue/admin/:id/realisations/ | Admin  | Ajouter réalisation   |
| DELETE  | /api/catalogue/admin/realisations/:id/ | Admin  | Supprimer réalisation |
| POST    | /api/commandes/                        | Public | Créer commande        |
| GET     | /api/commandes/:code/                  | Public | Détail commande       |
| GET     | /api/commandes/admin/list/             | Admin  | Liste commandes       |
| PATCH   | /api/commandes/admin/:code/statut/     | Admin  | Changer statut        |
| GET     | /api/commandes/admin/:code/photos/     | Admin  | Télécharger photos    |
| POST    | /api/paiements/:code/initier/          | Public | Initier paiement      |
| POST    | /api/paiements/callback/               | Public | Callback PayDunya     |
| POST    | /api/qrcodes/generer/:code/            | Admin  | Générer QR            |
| POST    | /api/qrcodes/valider/                  | Admin  | Valider QR            |
| GET     | /api/qrcodes/verifier/:token/          | Public | Vérifier QR           |
| POST    | /api/whatsapp/verifier-numero/         | Public | Vérifier n° WA        |
| GET     | /api/stats/                            | Admin  | Statistiques          |
| POST    | /api/auth/login/                       | Public | Connexion admin       |
| WS      | /ws/notifications/                     | Admin  | Temps réel            |

---

## 4. Spécifications de sécurité

### 4.1 Authentification

- Session Django avec durée de vie de 30 minutes
- Session expirée à la fermeture du navigateur
- Accès admin protégé par `IsAdminUser`
- Token CSRF sur toutes les requêtes POST/PATCH/DELETE

### 4.2 Protection des données

- Fichiers `.env` exclus du versionnage Git
- Variables sensibles (clés API) uniquement en variables d'environnement
- Photos clients stockées sur Cloudinary avec accès sécurisé

### 4.3 QR Code

- Token UUID v4 aléatoire — impossible à deviner
- Usage unique — invalide après premier scan
- Expiration automatique après 30 jours
- Lié au numéro WhatsApp du client

---

## 5. Charte graphique

### 5.1 Palette de couleurs

| Nom        | Hex                   | Usage                                 |
| ---------- | --------------------- | ------------------------------------- |
| Dark       | #1A1A2E               | Fond principal                        |
| Dark 2     | #0F0F1F               | Fond des cards                        |
| Dark 3     | #141428               | Fond inputs                           |
| Gold       | #C4963A               | Couleur principale — boutons, accents |
| Gold light | #D4A84A               | Hover boutons                         |
| Gold dim   | rgba(196,150,58,0.15) | Fonds dorés légers                    |
| Cream      | #F5F0E8               | Texte principal                       |
| Muted      | #8B7355               | Texte secondaire                      |
| Muted 2    | #4A4A5E               | Texte tertiaire                       |

### 5.2 Typographie

| Usage  | Police             | Poids                      |
| ------ | ------------------ | -------------------------- |
| Titres | Cormorant Garamond | 600-700                    |
| Corps  | Inter              | 400-500                    |
| Prix   | Inter              | 700                        |
| Labels | Inter              | 400 (letter-spacing 2-4px) |

### 5.3 Composants UI

- Bouton primaire : fond or (#C4963A), texte sombre
- Bouton outline : bordure crème, texte crème
- Bouton ghost : bordure muted, texte muted
- Cards : fond dark-2, bordure or à 25% opacité
- Inputs : fond dark-3, bordure or à 20% opacité, focus or
- Badges statut : couleurs sémantiques par statut
- Skeleton loader : animation shimmer dark-2/dark-3

---

## 6. Déploiement

### 6.1 Environnement de développement

| Service        | URL                               |
| -------------- | --------------------------------- |
| Backend Django | http://127.0.0.1:8000             |
| Frontend React | http://localhost:5173             |
| Django Admin   | http://127.0.0.1:8000/admin       |
| Dashboard      | http://localhost:5173/admin/login |

### 6.2 Environnement de production

| Service         | Hébergeur           | URL                        |
| --------------- | ------------------- | -------------------------- |
| Backend Django  | PythonAnywhere      | ton-app.pythonanywhere.com |
| Frontend React  | Vercel              | ton-app.vercel.app         |
| Photos          | Cloudinary          | CDN mondial                |
| Base de données | SQLite → PostgreSQL | —                          |

### 6.3 Variables d'environnement requises

```env
# Django
DEBUG=False
SECRET_KEY=
ALLOWED_HOSTS=

# Stockage
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# WhatsApp
GREEN_API_INSTANCE_ID=
GREEN_API_TOKEN=
NUMERO_ADMIN_WHATSAPP=

# Paiement
PAYDUNYA_MASTER_KEY=
PAYDUNYA_PRIVATE_KEY=
PAYDUNYA_TOKEN=
PAYDUNYA_MODE=live

# URLs
FRONTEND_URL=
BACKEND_URL=
```

---

## 7. Livrables version 1

### 7.1 Fonctionnalités livrées

- [x] Catalogue avec grille de tableaux et skeleton loaders
- [x] Page détail avec galerie des réalisations
- [x] Modal de commande avec upload photos drag & drop
- [x] Page panier avec récapitulatif
- [x] Vérification numéro WhatsApp en temps réel
- [x] Paiement 50% via PayDunya
- [x] Notifications WhatsApp automatiques (4 types)
- [x] Reçus PDF automatiques (acompte + final)
- [x] QR code de retrait unique et sécurisé
- [x] Dashboard admin — gestion commandes
- [x] Dashboard admin — gestion catalogue
- [x] Dashboard admin — statistiques et visiteurs
- [x] Notifications temps réel WebSocket
- [x] Icône admin discrète en pied de page
- [x] Session admin 30 minutes
- [x] Téléchargement photos client en ZIP
- [x] Design Or & Nuit professionnel

### 7.2 Fonctionnalités prévues version 2

- [ ] Page de suivi commande publique (code commande)
- [ ] Galerie portfolio publique
- [ ] Codes promo et remises
- [ ] Application mobile React Native
- [ ] Messagerie client-admin intégrée
- [ ] Export comptabilité PDF/Excel
- [ ] Migration WebSocket sur serveur dédié

---

## 8. Recette et tests

### 8.1 Tests à effectuer avant mise en production

| Test        | Action                      | Résultat attendu                |
| ----------- | --------------------------- | ------------------------------- |
| Catalogue   | Accéder à la page d'accueil | Grille de tableaux chargée      |
| Détail      | Cliquer sur un tableau      | Page galerie réalisations       |
| Commande    | Double-clic sur réalisation | Modal commande ouverte          |
| Upload      | Glisser une photo           | Photo ajoutée avec aperçu       |
| Calcul prix | Changer nb unités           | Prix mis à jour automatiquement |
| Panier      | Ajouter article             | Compteur navbar mis à jour      |
| WhatsApp    | Saisir n° valide            | Pseudo affiché + vérifié        |
| WhatsApp    | Saisir n° invalide          | Message d'erreur                |
| Paiement    | Cliquer payer               | Redirection PayDunya            |
| Callback    | Paiement confirmé           | Statut → PAYEE_AVANCE           |
| Reçu        | Paiement confirmé           | PDF reçu sur WhatsApp           |
| Notif admin | Nouvelle commande           | Notification dashboard          |
| QR          | Admin marque prêt           | QR envoyé au client             |
| Scan        | Admin scanne QR             | Commande → SOLDEE               |
| Reçu final  | Commande soldée             | PDF final sur WhatsApp          |
| Stats       | Onglet statistiques         | Graphiques affichés             |
| Login admin | Mauvais mot de passe        | Message d'erreur                |
| Session     | Inactivité 30 min           | Déconnexion automatique         |

---

## 9. Maintenance et évolution

### 9.1 Sauvegardes

- Base de données SQLite : sauvegarde quotidienne recommandée
- Photos Cloudinary : sauvegarde incluse dans l'offre

### 9.2 Mises à jour

- Dépendances Python : `pip install -r requirements.txt --upgrade`
- Dépendances Node : `npm update`

### 9.3 Monitoring

- Logs Django : consultables dans PythonAnywhere
- Erreurs frontend : console navigateur

---

_Document rédigé dans le cadre du développement de la version 1.0 de Glo Vision_  
_Lomé, Togo — Mars 2026_
