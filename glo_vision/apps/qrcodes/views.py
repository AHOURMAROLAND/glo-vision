from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser
from django.utils import timezone
import qrcode
import base64
from io import BytesIO
from .models import QRCode
from apps.commandes.models import Commande

def generer_qr_base64(token):
    frontend_url = __import__('os').getenv('FRONTEND_URL', 'http://localhost:5173')
    url = f"{frontend_url}/qr/{token}"
    qr = qrcode.make(url)
    buffer = BytesIO()
    qr.save(buffer, format='PNG')
    buffer.seek(0)
    img_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
    return f"data:image/png;base64,{img_base64}", url

class GenererQRCodeView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, code):
        try:
            commande = Commande.objects.get(code=code)
        except Commande.DoesNotExist:
            return Response({'error': 'Commande introuvable'}, status=404)

        if commande.statut not in [
            Commande.Statut.EN_PRODUCTION,
            Commande.Statut.PRETE
        ]:
            return Response({'error': 'Statut commande invalide pour QR code'}, status=400)

        qr_obj, created = QRCode.objects.get_or_create(commande=commande)

        if not created:
            qr_obj.token = __import__('uuid').uuid4()
            qr_obj.utilise = False
            qr_obj.expire_a = timezone.now() + __import__('datetime').timedelta(days=30)
            qr_obj.save()

        img_base64, url = generer_qr_base64(str(qr_obj.token))

        commande.statut = Commande.Statut.PRETE
        commande.save()

        return Response({
            'token': str(qr_obj.token),
            'qr_image': img_base64,
            'url': url,
            'commande': code,
        })

class ValiderQRCodeView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        token = request.data.get('token')
        if not token:
            return Response({'error': 'Token manquant'}, status=400)

        try:
            qr_obj = QRCode.objects.select_related('commande').get(token=token)
        except QRCode.DoesNotExist:
            return Response({'valide': False, 'error': 'QR code invalide'}, status=404)

        if not qr_obj.est_valide():
            return Response({'valide': False, 'error': 'QR code expiré ou déjà utilisé'}, status=400)

        qr_obj.utilise = True
        qr_obj.save()

        commande = qr_obj.commande
        commande.statut = Commande.Statut.SOLDEE
        commande.save()

        return Response({
            'valide': True,
            'commande_code': commande.code,
            'nom_client': commande.nom_client,
            'montant_solde': str(commande.montant_solde),
            'message': 'Commande clôturée avec succès'
        })

class VerifierQRCodePublicView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, token):
        try:
            qr_obj = QRCode.objects.select_related('commande').get(token=token)
        except QRCode.DoesNotExist:
            return Response({'valide': False}, status=404)

        return Response({
            'valide': qr_obj.est_valide(),
            'commande_code': qr_obj.commande.code,
            'nom_client': qr_obj.commande.nom_client,
        })