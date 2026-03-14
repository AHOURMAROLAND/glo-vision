from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Tableau, PhotoRealisation
from .serializers import TableauListSerializer, TableauDetailSerializer, PhotoRealisationSerializer

class TableauListView(generics.ListAPIView):
    queryset = Tableau.objects.filter(disponible=True)
    serializer_class = TableauListSerializer
    permission_classes = [AllowAny]

class TableauDetailView(generics.RetrieveAPIView):
    queryset = Tableau.objects.all()
    serializer_class = TableauDetailSerializer
    permission_classes = [AllowAny]

class TableauAdminListView(generics.ListAPIView):
    queryset = Tableau.objects.all()
    serializer_class = TableauDetailSerializer
    permission_classes = [IsAdminUser]

class TableauCreateView(generics.CreateAPIView):
    serializer_class = TableauListSerializer
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser]

class TableauUpdateView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Tableau.objects.all()
    serializer_class = TableauListSerializer
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser]

class PhotoRealisationCreateView(APIView):
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, pk):
        try:
            tableau = Tableau.objects.get(pk=pk)
        except Tableau.DoesNotExist:
            return Response({'error': 'Tableau introuvable'}, status=404)

        image   = request.FILES.get('image')
        legende = request.data.get('legende', '')
        ordre   = request.data.get('ordre', 0)

        if not image:
            return Response({'error': 'Image requise'}, status=400)

        photo = PhotoRealisation.objects.create(
            tableau=tableau,
            image=image,
            legende=legende,
            ordre=ordre,
        )
        return Response(PhotoRealisationSerializer(photo).data, status=201)

class PhotoRealisationDeleteView(APIView):
    permission_classes = [IsAdminUser]

    def delete(self, request, pk):
        try:
            photo = PhotoRealisation.objects.get(pk=pk)
            photo.delete()
            return Response(status=204)
        except PhotoRealisation.DoesNotExist:
            return Response({'error': 'Photo introuvable'}, status=404)