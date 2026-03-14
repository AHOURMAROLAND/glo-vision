from rest_framework import generics
from rest_framework.permissions import AllowAny
from .models import Tableau
from .serializers import TableauListSerializer, TableauDetailSerializer

class TableauListView(generics.ListAPIView):
    queryset = Tableau.objects.filter(disponible=True)
    serializer_class = TableauListSerializer
    permission_classes = [AllowAny]

class TableauDetailView(generics.RetrieveAPIView):
    queryset = Tableau.objects.filter(disponible=True)
    serializer_class = TableauDetailSerializer
    permission_classes = [AllowAny]