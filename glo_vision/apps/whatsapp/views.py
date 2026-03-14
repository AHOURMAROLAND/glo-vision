from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .green_api_client import verifier_numero

class VerifierNumeroView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        numero = request.data.get('numero')
        if not numero:
            return Response({'error': 'Numéro manquant'}, status=400)

        result = verifier_numero(numero)
        existe = result.get('existsWhatsapp', False)

        return Response({
            'valide': existe,
            'numero': numero,
        })