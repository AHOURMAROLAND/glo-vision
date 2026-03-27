from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Commande

@receiver(post_save, sender=Commande)
def commande_post_save(sender, instance, created, **kwargs):
    from apps.whatsapp.bot_client import envoyer_message, envoyer_pdf
    from apps.whatsapp.messages import (
        msg_notif_admin,
        msg_recu_avance,
        msg_tableau_pret,
        msg_recu_final,
    )
    from apps.paiements.recu_generator import generer_recu_avance, generer_recu_final
    from apps.notifications.utils import envoyer_notification_admin
    import os
    import logging

    logger         = logging.getLogger(__name__)
    numero_admin   = os.getenv('NUMERO_ADMIN_WHATSAPP', '')
    frontend_url   = os.getenv('FRONTEND_URL', 'http://localhost:5173')

    # --- NOUVELLE COMMANDE ---
    if created:
        if numero_admin:
            try:
                envoyer_message(numero_admin, msg_notif_admin(instance))
            except Exception as e:
                logger.error(f"Notif admin nouvelle commande: {e}")

        try:
            envoyer_notification_admin({
                'type':         'nouvelle_commande',
                'code':         instance.code,
                'client':       instance.nom_client,
                'whatsapp':     instance.numero_whatsapp,
                'tableau':      instance.tableau.titre,
                'nb_unites':    instance.nb_unites,
                'montant_total': str(instance.montant_total),
                'montant_avance': str(instance.montant_avance),
                'statut':       instance.statut,
            })
        except Exception as e:
            logger.error(f"Notification WS nouvelle commande: {e}")
        return

    # --- CHANGEMENT DE STATUT ---

    if instance.statut == Commande.Statut.PAYEE_AVANCE:
        # Reçu avance WhatsApp
        try:
            envoyer_message(instance.numero_whatsapp, msg_recu_avance(instance))
        except Exception as e:
            logger.error(f"Message reçu avance: {e}")

        # PDF reçu avance
        try:
            pdf_buffer = generer_recu_avance(instance)
            envoyer_pdf(
                instance.numero_whatsapp,
                pdf_buffer,
                f"recu_avance_{instance.code}.pdf",
                caption=f"Votre reçu d'acompte — {instance.code}"
            )
        except Exception as e:
            logger.error(f"PDF reçu avance: {e}")

        # Notif admin WS
        try:
            envoyer_notification_admin({
                'type':    'statut_change',
                'code':    instance.code,
                'client':  instance.nom_client,
                'statut':  instance.statut,
                'message': f"Commande {instance.code} — acompte reçu",
            })
        except Exception as e:
            logger.error(f"Notif WS PAYEE_AVANCE: {e}")

    elif instance.statut == Commande.Statut.PRETE:
        # Générer QR code automatiquement
        try:
            from apps.qrcodes.models import QRCode
            from django.utils import timezone
            from datetime import timedelta
            import uuid

            qr_obj, created_qr = QRCode.objects.get_or_create(
                commande=instance,
                defaults={
                    'token':    uuid.uuid4(),
                    'expire_a': timezone.now() + timedelta(days=30),
                    'utilise':  False,
                }
            )

            if not created_qr:
                qr_obj.token    = uuid.uuid4()
                qr_obj.utilise  = False
                qr_obj.expire_a = timezone.now() + timedelta(days=30)
                qr_obj.save()

            qr_url = f"{frontend_url}/qr/{qr_obj.token}"
            envoyer_message(instance.numero_whatsapp, msg_tableau_pret(instance, qr_url))

        except Exception as e:
            logger.error(f"Génération QR + message prêt: {e}")

        try:
            envoyer_notification_admin({
                'type':    'statut_change',
                'code':    instance.code,
                'client':  instance.nom_client,
                'statut':  instance.statut,
                'message': f"Commande {instance.code} — tableau prêt",
            })
        except Exception as e:
            logger.error(f"Notif WS PRETE: {e}")

    elif instance.statut == Commande.Statut.SOLDEE:
        # Message reçu final
        try:
            envoyer_message(instance.numero_whatsapp, msg_recu_final(instance))
        except Exception as e:
            logger.error(f"Message reçu final: {e}")

        # PDF reçu final
        try:
            pdf_buffer = generer_recu_final(instance)
            envoyer_pdf(
                instance.numero_whatsapp,
                pdf_buffer,
                f"recu_final_{instance.code}.pdf",
                caption=f"Votre reçu final — {instance.code}"
            )
        except Exception as e:
            logger.error(f"PDF reçu final: {e}")

        try:
            envoyer_notification_admin({
                'type':    'statut_change',
                'code':    instance.code,
                'client':  instance.nom_client,
                'statut':  instance.statut,
                'message': f"Commande {instance.code} — soldée et clôturée",
            })
        except Exception as e:
            logger.error(f"Notif WS SOLDEE: {e}")
