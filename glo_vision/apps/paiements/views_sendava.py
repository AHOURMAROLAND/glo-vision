from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import Paiement
from .sendavapay_client import creer_paiement, verifier_paiement, verifier_signature_webhook
from apps.commandes.models import Commande

class InitierPaiementView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, code):
        try:
            commande = Commande.objects.get(code=code)
        except Commande.DoesNotExist:
            return Response({'error': 'Commande introuvable'}, status=404)

        if commande.statut != Commande.Statut.EN_ATTENTE:
            return Response({'error': 'Commande déjà payée ou invalide'}, status=400)

        result = creer_paiement(commande)

        if result.get('success'):
            data = result.get('data', {})
            Paiement.objects.create(
                commande=commande,
                type_paiement=Paiement.Type.AVANCE,
                montant=commande.montant_avance,
                reference_paiement=data.get('reference', ''),
            )
            return Response({
                'payment_url': data.get('paymentUrl'),
                'reference':   data.get('reference'),
            })

        return Response({'error': 'Erreur SendavaPay', 'detail': result}, status=400)

@method_decorator(csrf_exempt, name='dispatch')
class WebhookSendavaPayView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        signature = request.headers.get('X-SendavaPay-Signature', '')
        event     = request.headers.get('X-SendavaPay-Event', '')

        if not verifier_signature_webhook(request.data, signature):
            return Response({'error': 'Signature invalide'}, status=401)

        data = request.data.get('data', {})

        if event == 'payment.completed':
            reference = data.get('reference')
            externe   = data.get('externalReference')

            try:
                commande = Commande.objects.get(code=externe)
                paiement = Paiement.objects.get(
                    commande=commande,
                    reference_paiement=reference
                )
                paiement.statut = Paiement.Statut.SUCCES
                paiement.save()

                commande.statut = Commande.Statut.PAYEE_AVANCE
                commande.save()

            except (Commande.DoesNotExist, Paiement.DoesNotExist) as e:
                return Response({'error': str(e)}, status=404)

        elif event == 'payment.failed':
            reference = data.get('reference')
            externe   = data.get('externalReference')
            try:
                commande = Commande.objects.get(code=externe)
                paiement = Paiement.objects.get(
                    commande=commande,
                    reference_paiement=reference
                )
                paiement.statut = Paiement.Statut.ECHEC
                paiement.save()
            except Exception:
                pass

        return Response({'received': True})
