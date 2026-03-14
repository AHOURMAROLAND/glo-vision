import requests
import os

PAYDUNYA_MODE = os.getenv('PAYDUNYA_MODE', 'test')

if PAYDUNYA_MODE == 'live':
    BASE_URL = 'https://app.paydunya.com/api/v1'
else:
    BASE_URL = 'https://app.paydunya.com/sandbox-api/v1'

HEADERS = {
    'Content-Type': 'application/json',
    'PAYDUNYA-MASTER-KEY': os.getenv('PAYDUNYA_MASTER_KEY', ''),
    'PAYDUNYA-PRIVATE-KEY': os.getenv('PAYDUNYA_PRIVATE_KEY', ''),
    'PAYDUNYA-TOKEN': os.getenv('PAYDUNYA_TOKEN', ''),
}

def creer_invoice(commande):
    frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')
    payload = {
        "invoice": {
            "total_amount": float(commande.montant_avance),
            "description": f"Acompte 50% — Commande {commande.code} — {commande.tableau.titre}"
        },
        "store": {
            "name": "Glo Vision",
            "tagline": "Vos souvenirs encadrés",
        },
        "custom_data": {
            "commande_code": commande.code,
            "client_nom": commande.nom_client,
            "client_whatsapp": commande.numero_whatsapp,
        },
        "actions": {
            "callback_url": f"{os.getenv('BACKEND_URL', 'http://localhost:8000')}/api/paiements/callback/",
            "return_url": f"{frontend_url}/commande/{commande.code}/succes/",
            "cancel_url": f"{frontend_url}/commande/{commande.code}/annule/",
        }
    }

    response = requests.post(
        f"{BASE_URL}/checkout-invoice/create",
        json=payload,
        headers=HEADERS
    )
    return response.json()

def verifier_invoice(token):
    response = requests.get(
        f"{BASE_URL}/checkout-invoice/confirm/{token}",
        headers=HEADERS
    )
    return response.json()