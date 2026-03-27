"""
Client WhatsApp utilisant Whapi.cloud avec rotation multi-canaux
3 canaux gratuits = 450 messages/jour max
"""
import requests
import os
import base64
import logging
from django.core.cache import cache

logger = logging.getLogger(__name__)

# Configuration des 3 canaux Whapi
CANAUX = [
    {
        'token': os.getenv('WHAPI_TOKEN_1', ''),
        'url':   os.getenv('WHAPI_URL_1', 'https://gate.whapi.cloud'),
        'nom':   'Canal 1',
    },
    {
        'token': os.getenv('WHAPI_TOKEN_2', ''),
        'url':   os.getenv('WHAPI_URL_2', 'https://gate.whapi.cloud'),
        'nom':   'Canal 2',
    },
    {
        'token': os.getenv('WHAPI_TOKEN_3', ''),
        'url':   os.getenv('WHAPI_URL_3', 'https://gate.whapi.cloud'),
        'nom':   'Canal 3',
    },
]


def get_canaux_actifs():
    """Retourne les canaux configurés (avec token)"""
    return [c for c in CANAUX if c['token']]


def marquer_canal_epuise(index):
    """Marque un canal comme épuisé jusqu'à minuit"""
    from django.utils import timezone
    import datetime
    now = timezone.now()
    minuit = now.replace(hour=0, minute=0, second=0, microsecond=0) + datetime.timedelta(days=1)
    secondes = int((minuit - now).total_seconds())
    cache.set(f'whapi_epuise_{index}', True, secondes)
    logger.warning(f"Whapi {CANAUX[index]['nom']} — quota atteint, repos jusqu'à minuit")


def canal_est_epuise(index):
    """Vérifie si un canal est marqué épuisé"""
    return cache.get(f'whapi_epuise_{index}', False)


def get_headers(canal):
    """Headers HTTP pour authentification Whapi"""
    return {
        'Authorization': f"Bearer {canal['token']}",
        'Content-Type':  'application/json',
    }


def formater_numero(numero):
    """Formate un numéro WhatsApp (228xxxxxxxx)"""
    n = numero.replace('+', '').replace(' ', '').replace('-', '')
    if not n.startswith('228'):
        n = '228' + n
    return n


def appeler_avec_rotation(endpoint, payload):
    """Appelle l'API Whapi avec rotation des canaux"""
    canaux = get_canaux_actifs()
    if not canaux:
        logger.error("Aucun canal Whapi configuré")
        return {'success': False, 'error': 'Aucun canal configuré'}

    for i, canal in enumerate(canaux):
        if canal_est_epuise(i):
            logger.info(f"{canal['nom']} épuisé — on passe au suivant")
            continue

        try:
            url = f"{canal['url']}/{endpoint}"
            r = requests.post(url, json=payload, headers=get_headers(canal), timeout=15)

            # Quota atteint (429 = Too Many Requests)
            if r.status_code == 429:
                marquer_canal_epuise(i)
                continue

            if r.status_code in [200, 201]:
                data = r.json()
                logger.info(f"✅ Message envoyé via {canal['nom']}")
                return {'success': True, 'data': data, 'canal': canal['nom']}

            logger.warning(f"{canal['nom']} erreur {r.status_code}: {r.text}")

        except requests.exceptions.Timeout:
            logger.error(f"{canal['nom']} timeout")
            continue
        except Exception as e:
            logger.error(f"{canal['nom']} exception: {e}")
            continue

    logger.error("Tous les canaux Whapi sont épuisés ou en erreur")
    return {'success': False, 'error': 'Tous les canaux épuisés'}


def envoyer_message(numero, message):
    """Envoie un message texte WhatsApp"""
    numero = formater_numero(numero)
    return appeler_avec_rotation('messages/text', {
        'to':   numero,
        'body': message,
    })


def verifier_numero(numero):
    """Vérifie si un numéro existe sur WhatsApp"""
    numero = formater_numero(numero)
    canaux = get_canaux_actifs()

    for i, canal in enumerate(canaux):
        if canal_est_epuise(i):
            continue
        try:
            url = f"{canal['url']}/contacts/{numero}"
            r = requests.get(url, headers=get_headers(canal), timeout=10)

            if r.status_code == 429:
                marquer_canal_epuise(i)
                continue

            if r.status_code == 200:
                data = r.json()
                existe = data.get('exists', False) or data.get('status') == 'valid'
                return {
                    'valid': existe,
                    'exists': existe,
                    'valide': existe,
                    'pseudo': data.get('name', numero),
                    'numero': numero,
                }

        except Exception as e:
            logger.error(f"Vérif numéro {canal['nom']}: {e}")
            continue

    return {'valide': False, 'valid': False, 'numero': numero}


def envoyer_pdf(numero, pdf_buffer, nom_fichier, caption=''):
    """Envoie un PDF par WhatsApp"""
    numero = formater_numero(numero)
    pdf_b64 = base64.b64encode(pdf_buffer.read()).decode('utf-8')
    mime_type = 'application/pdf'

    return appeler_avec_rotation('messages/document', {
        'to':       numero,
        'document': {
            'data':     pdf_b64,
            'filename': nom_fichier,
            'mimeType': mime_type,
        },
        'caption': caption,
    })


def envoyer_image(numero, url_image, caption=''):
    """Envoie une image par URL WhatsApp"""
    numero = formater_numero(numero)
    return appeler_avec_rotation('messages/image', {
        'to':    numero,
        'image': {'link': url_image},
        'caption': caption,
    })


def statut_canaux():
    """Retourne le statut des 3 canaux"""
    result = []
    for i, canal in enumerate(CANAUX):
        if not canal['token']:
            result.append({'nom': canal['nom'], 'status': 'non configuré'})
            continue
        epuise = canal_est_epuise(i)
        result.append({
            'nom':    canal['nom'],
            'status': 'épuisé (recharge à minuit)' if epuise else 'actif',
        })
    return result


def bot_est_connecte():
    """Vérifie si au moins un canal est actif"""
    canaux = get_canaux_actifs()
    if not canaux:
        return False
    
    # Vérifie si au moins un canal n'est pas épuisé
    for i, canal in enumerate(canaux):
        if not canal_est_epuise(i):
            return True
    return False
