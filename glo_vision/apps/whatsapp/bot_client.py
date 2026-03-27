import requests
import os
import base64

BOT_URL = os.getenv('WHATSAPP_BOT_URL', 'http://localhost:3001')

def envoyer_message(numero, message):
    try:
        r = requests.post(f"{BOT_URL}/envoyer-message", json={
            'numero':  numero,
            'message': message,
        }, timeout=10)
        return r.json()
    except Exception as e:
        print(f"Erreur bot WA message: {e}")
        return {'success': False}

def verifier_numero(numero):
    try:
        r = requests.post(f"{BOT_URL}/verifier-numero", json={
            'numero': numero,
        }, timeout=10)
        return r.json()
    except Exception as e:
        print(f"Erreur bot WA verif: {e}")
        return {'valide': False}

def envoyer_pdf(numero, pdf_buffer, nom_fichier, caption=''):
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
        print(f"Erreur bot WA PDF: {e}")
        return {'success': False}

def envoyer_image(numero, url_image, caption=''):
    try:
        r = requests.post(f"{BOT_URL}/envoyer-image", json={
            'numero':    numero,
            'url_image': url_image,
            'caption':   caption,
        }, timeout=10)
        return r.json()
    except Exception as e:
        print(f"Erreur bot WA image: {e}")
        return {'success': False}
