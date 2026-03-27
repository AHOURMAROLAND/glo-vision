from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser
from .bot_client import verifier_numero, statut_canaux

class VerifierNumeroView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        numero = request.data.get('numero')
        if not numero:
            return Response({'error': 'Numéro manquant'}, status=400)

        result = verifier_numero(numero)
        return Response({
            'valide': result.get('valide', False),
            'pseudo': result.get('pseudo', numero),
            'numero': numero,
        })


class StatutCanauxView(APIView):
    """Retourne le statut des 3 canaux Whapi"""
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({'canaux': statut_canaux()})