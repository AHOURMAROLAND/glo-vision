import requests
import os
import hmac
import hashlib
import json

API_KEY  = os.getenv('SENDAVAPAY_API_KEY', '')
BASE_URL = 'https://sendavapay.com/api/v1'

HEADERS = {
    'Authorization': f'Bearer {API_KEY}',
    'Content-Type': 'application/json',
}

def creer_paiement(commande):
    frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')
    backend_url  = os.getenv('BACKEND_URL',  'http://localhost:8000')

    payload = {
        'amount':            float(commande.montant_avance),
        'currency':          'XOF',
        'description':       f"Acompte 50% — {commande.code} — {commande.tableau.titre}",
        'externalReference': commande.code,
        'customerName':      commande.nom_client,
        'customerPhone':     commande.numero_whatsapp,
        'redirectUrl':       f"{frontend_url}/commande/{commande.code}/succes/",
        'metadata': {
            'commande_code':    commande.code,
            'client_whatsapp':  commande.numero_whatsapp,
        }
    }

    response = requests.post(
        f"{BASE_URL}/create-payment",
        json=payload,
        headers=HEADERS
    )
    return response.json()

def verifier_paiement(reference):
    response = requests.post(
        f"{BASE_URL}/verify-payment",
        json={'reference': reference},
        headers=HEADERS
    )
    return response.json()

def verifier_signature_webhook(payload, signature):
    secret = os.getenv('SENDAVAPAY_WEBHOOK_SECRET', '')
    expected = hmac.new(
        secret.encode(),
        json.dumps(payload).encode(),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, signature)
