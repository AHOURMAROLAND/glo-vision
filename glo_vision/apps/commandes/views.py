from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Commande
from .serializers import CommandeCreateSerializer, CommandeDetailSerializer

class CommandeCreateView(generics.CreateAPIView):
    serializer_class = CommandeCreateSerializer
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        commande = serializer.save()
        return Response(
            CommandeDetailSerializer(commande).data,
            status=status.HTTP_201_CREATED
        )

class CommandeDetailView(generics.RetrieveAPIView):
    serializer_class = CommandeDetailSerializer
    permission_classes = [AllowAny]
    lookup_field = 'code'
    queryset = Commande.objects.all()

class CommandeListAdminView(generics.ListAPIView):
    serializer_class = CommandeDetailSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        queryset = Commande.objects.all()
        statut = self.request.query_params.get('statut')
        if statut:
            queryset = queryset.filter(statut=statut)
        return queryset

class CommandeStatutUpdateView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, code):
        try:
            commande = Commande.objects.get(code=code)
        except Commande.DoesNotExist:
            return Response({'error': 'Commande introuvable'}, status=404)

        nouveau_statut = request.data.get('statut')
        if nouveau_statut not in Commande.Statut.values:
            return Response({'error': 'Statut invalide'}, status=400)

        commande.statut = nouveau_statut
        commande.save()
        return Response(CommandeDetailSerializer(commande).data)