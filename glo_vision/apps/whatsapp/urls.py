from django.urls import path
from . import views

urlpatterns = [
    path('verifier-numero/', views.VerifierNumeroView.as_view(), name='verifier-numero'),
    path('statut-canaux/', views.StatutCanauxView.as_view(), name='statut-canaux'),
]