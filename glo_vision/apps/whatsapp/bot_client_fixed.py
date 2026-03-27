import requests
import os
import base64
import logging

logger  = logging.getLogger(__name__)
BOT_URL = os.getenv('WHATSAPP_BOT_URL', 'http://localhost:3001')

def bot_est_connecte():
    try:
        r = requests.get(f"{BOT_URL}/statut", timeout=3)
        return r.json().get('connecte', False)
    except Exception:
        return False

def envoyer_message(numero, message):
    if not bot_est_connecte():
        logger.warning(f"Bot WA non connecté — message non envoyé à {numero}")
        return {'success': False, 'error': 'Bot non connecté'}
    try:
        r = requests.post(f"{BOT_URL}/envoyer-message", json={
            'numero':  numero,
            'message': message,
        }, timeout=10)
        return r.json()
    except Exception as e:
        logger.error(f"Erreur envoi message WA: {e}")
        return {'success': False}

def verifier_numero(numero):
    if not bot_est_connecte():
        logger.warning("Bot WA non connecté — vérification impossible")
        return {'valide': False, 'error': 'Bot non connecté'}
    try:
        r = requests.post(f"{BOT_URL}/verifier-numero", json={
            'numero': numero,
        }, timeout=10)
        return r.json()
    except Exception as e:
        logger.error(f"Erreur vérif numéro WA: {e}")
        return {'valide': False}

def envoyer_pdf(numero, pdf_buffer, nom_fichier, caption=''):
    if not bot_est_connecte():
        logger.warning(f"Bot WA non connecté — PDF non envoyé à {numero}")
        return {'success': False}
    try:
        pdf_base64 = base64.b64encode(pdf_buffer.read()).decode('utf-8')
        r = requests.post(f"{BOT_URL}/envoyer-pdf", json={
            'numero':      numero,
            'pdf_base64':  pdf_base64,
            'nom_fichier': nom_fichier,
            'caption':     caption,
        }, timeout=15)
        return r.json()
    except Exception as e:
        logger.error(f"Erreur envoi PDF WA: {e}")
        return {'success': False}

def envoyer_image(numero, url_image, caption=''):
    if not bot_est_connecte():
        logger.warning(f"Bot WA non connecté — image non envoyée à {numero}")
        return {'success': False}
    try:
        r = requests.post(f"{BOT_URL}/envoyer-image", json={
            'numero':    numero,
            'url_image': url_image,
            'caption':   caption,
        }, timeout=10)
        return r.json()
    except Exception as e:
        logger.error(f"Erreur envoi image WA: {e}")
        return {'success': False}
