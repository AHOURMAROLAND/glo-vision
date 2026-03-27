"""
Client Django pour Evolution API (WhatsApp)
À utiliser avec Render.com ou serveur Docker
"""
import requests
import os
import base64
import logging

logger = logging.getLogger(__name__)

# Configuration
EVOLUTION_API_URL = os.getenv('EVOLUTION_API_URL', 'https://evolution-api-ton-projet.onrender.com')
EVOLUTION_API_KEY = os.getenv('EVOLUTION_API_KEY', 'ta_cle_api_secrete')
INSTANCE_NAME = os.getenv('EVOLUTION_INSTANCE', 'glo-vision-bot')

class EvolutionAPIClient:
    """Client pour communiquer avec Evolution API"""
    
    def __init__(self):
        self.base_url = EVOLUTION_API_URL
        self.headers = {
            'apikey': EVOLUTION_API_KEY,
            'Content-Type': 'application/json'
        }
    
    def _make_request(self, method, endpoint, **kwargs):
        """Effectue une requête HTTP vers l'API"""
        url = f"{self.base_url}{endpoint}"
        try:
            response = requests.request(
                method, url, headers=self.headers, timeout=30, **kwargs
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Erreur Evolution API: {e}")
            return {'error': str(e)}
    
    def create_instance(self):
        """Crée une instance WhatsApp"""
        data = {
            'instanceName': INSTANCE_NAME,
            'token': EVOLUTION_API_KEY,
            'qrcode': True,
            'webhook': {
                'enabled': False,
                'url': '',
                'webhookByEvents': False
            }
        }
        return self._make_request('POST', '/instance/create', json=data)
    
    def get_qrcode(self):
        """Récupère le QR code pour connexion WhatsApp"""
        return self._make_request(
            'GET', 
            f'/instance/connect/{INSTANCE_NAME}?number=' + requests.utils.quote(INSTANCE_NAME)
        )
    
    def check_connection(self):
        """Vérifie si l'instance est connectée"""
        result = self._make_request('GET', f'/instance/connectionState/{INSTANCE_NAME}')
        return result.get('state') == 'open'
    
    def send_text_message(self, number, message):
        """Envoie un message texte"""
        # Formater le numéro
        numero_clean = number.replace('+', '').replace(' ', '').replace('-', '')
        if not numero_clean.startswith('228'):
            numero_clean = '228' + numero_clean
        
        data = {
            'number': numero_clean,
            'text': message,
            'options': {
                'delay': 1200,
                'presence': 'composing'
            }
        }
        
        result = self._make_request(
            'POST', 
            f'/message/sendText/{INSTANCE_NAME}',
            json=data
        )
        
        if result.get('key'):
            logger.info(f"✅ Message envoyé à {number}")
            return {'success': True, 'id': result['key']['id']}
        else:
            logger.error(f"❌ Échec envoi message: {result}")
            return {'success': False, 'error': result.get('error', 'Unknown error')}
    
    def send_pdf(self, number, pdf_buffer, filename, caption=''):
        """Envoie un PDF"""
        numero_clean = number.replace('+', '').replace(' ', '').replace('-', '')
        if not numero_clean.startswith('228'):
            numero_clean = '228' + numero_clean
        
        # Encoder le PDF en base64
        pdf_base64 = base64.b64encode(pdf_buffer.read()).decode('utf-8')
        
        data = {
            'number': numero_clean,
            'media': f'data:application/pdf;base64,{pdf_base64}',
            'fileName': filename,
            'caption': caption,
            'options': {
                'delay': 1200
            }
        }
        
        result = self._make_request(
            'POST',
            f'/message/sendMedia/{INSTANCE_NAME}',
            json=data
        )
        
        if result.get('key'):
            logger.info(f"✅ PDF envoyé à {number}")
            return {'success': True}
        else:
            logger.error(f"❌ Échec envoi PDF: {result}")
            return {'success': False, 'error': result.get('error')}
    
    def verify_number(self, number):
        """Vérifie si un numéro existe sur WhatsApp"""
        numero_clean = number.replace('+', '').replace(' ', '').replace('-', '')
        if not numero_clean.startswith('228'):
            numero_clean = '228' + numero_clean
        
        result = self._make_request(
            'POST',
            '/chat/checkIsWhatsApp',
            json={'numbers': [numero_clean]}
        )
        
        if result and len(result) > 0:
            return {'valid': True, 'exists': result[0].get('exists', False)}
        return {'valid': False, 'exists': False}


# Instance globale du client
_evolution_client = None

def get_evolution_client():
    """Retourne l'instance du client Evolution API"""
    global _evolution_client
    if _evolution_client is None:
        _evolution_client = EvolutionAPIClient()
    return _evolution_client


# Fonctions compatibles avec l'ancien bot_client
def bot_est_connecte():
    """Vérifie si le bot est connecté"""
    try:
        client = get_evolution_client()
        return client.check_connection()
    except Exception:
        return False

def envoyer_message(numero, message):
    """Envoie un message WhatsApp"""
    client = get_evolution_client()
    if not client.check_connection():
        logger.warning(f"Bot non connecté - message non envoyé à {numero}")
        return {'success': False, 'error': 'Bot non connecté'}
    return client.send_text_message(numero, message)

def envoyer_pdf(numero, pdf_buffer, nom_fichier, caption=''):
    """Envoie un PDF"""
    client = get_evolution_client()
    if not client.check_connection():
        logger.warning(f"Bot non connecté - PDF non envoyé à {numero}")
        return {'success': False, 'error': 'Bot non connecté'}
    return client.send_pdf(numero, pdf_buffer, nom_fichier, caption)

def verifier_numero(numero):
    """Vérifie un numéro WhatsApp"""
    client = get_evolution_client()
    return client.verify_number(numero)
