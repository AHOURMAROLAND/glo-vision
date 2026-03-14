from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
from .models import Paiement
from .paydunya_client import creer_invoice, verifier_invoice
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

        result = creer_invoice(commande)

        if result.get('response_code') == '00':
            Paiement.objects.create(
                commande=commande,
                type_paiement=Paiement.Type.AVANCE,
                montant=commande.montant_avance,
                token_paydunya=result.get('token', ''),
            )
            return Response({
                'payment_url': result.get('response_text'),
                'token': result.get('token'),
            })

        return Response({'error': 'Erreur PayDunya', 'detail': result}, status=400)

class CallbackPaiementView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get('data', {}).get('invoice', {}).get('token')
        if not token:
            return Response({'error': 'Token manquant'}, status=400)

        result = verifier_invoice(token)

        if result.get('status') == 'completed':
            custom_data = result.get('custom_data', {})
            commande_code = custom_data.get('commande_code')

            try:
                commande = Commande.objects.get(code=commande_code)
                paiement = Paiement.objects.get(
                    commande=commande,
                    token_paydunya=token
                )
                paiement.statut = Paiement.Statut.SUCCES
                paiement.save()

                commande.statut = Commande.Statut.PAYEE_AVANCE
                commande.save()

            except (Commande.DoesNotExist, Paiement.DoesNotExist):
                return Response({'error': 'Données introuvables'}, status=404)

        return Response({'status': 'ok'})