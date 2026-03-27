"""
Client WhatsApp utilisant Evolution API (Render.com)
Remplace l'ancien bot Baileys local
"""
from .evolution_client import (
    bot_est_connecte,
    envoyer_message,
    envoyer_pdf,
    envoyer_image,
    verifier_numero,
    get_evolution_client,
)

__all__ = [
    'bot_est_connecte',
    'envoyer_message',
    'envoyer_pdf',
    'envoyer_image',
    'verifier_numero',
    'get_evolution_client',
]
