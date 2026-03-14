from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Commande

@receiver(post_save, sender=Commande)
def commande_post_save(sender, instance, created, **kwargs):
    from apps.whatsapp.green_api_client import envoyer_message, envoyer_pdf
    from apps.whatsapp.messages import (
        msg_notif_admin,
        msg_recu_avance,
        msg_tableau_pret,
        msg_recu_final,
    )
    from apps.paiements.recu_generator import generer_recu_avance
    import os

    numero_admin = os.getenv('NUMERO_ADMIN_WHATSAPP', '')

    if created:
        if numero_admin:
            envoyer_message(numero_admin, msg_notif_admin(instance))

    else:
        if instance.statut == Commande.Statut.PAYEE_AVANCE:
            envoyer_message(instance.numero_whatsapp, msg_recu_avance(instance))
            try:
                instance._type_recu = 'avance'
                pdf_buffer = generer_recu_avance(instance)
                envoyer_pdf(
                    instance.numero_whatsapp,
                    pdf_buffer,
                    f"recu_avance_{instance.code}.pdf",
                    caption=f"Votre reçu d'acompte — {instance.code}"
                )
            except Exception as e:
                print(f"Erreur envoi PDF : {e}")

        elif instance.statut == Commande.Statut.PRETE:
            try:
                qr = instance.qrcode
                frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')
                qr_url = f"{frontend_url}/qr/{qr.token}"
                envoyer_message(instance.numero_whatsapp, msg_tableau_pret(instance, qr_url))
            except Exception:
                pass

        elif instance.statut == Commande.Statut.SOLDEE:
            envoyer_message(instance.numero_whatsapp, msg_recu_final(instance))
            try:
                instance._type_recu = 'final'
                pdf_buffer = generer_recu_avance(instance)
                envoyer_pdf(
                    instance.numero_whatsapp,
                    pdf_buffer,
                    f"recu_final_{instance.code}.pdf",
                    caption=f"Votre reçu final — {instance.code}"
                )
            except Exception as e:
                print(f"Erreur envoi PDF final : {e}")