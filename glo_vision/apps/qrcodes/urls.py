from django.urls import path
from . import views

urlpatterns = [
    path('generer/<str:code>/', views.GenererQRCodeView.as_view(), name='generer-qr'),
    path('valider/', views.ValiderQRCodeView.as_view(), name='valider-qr'),
    path('verifier/<str:token>/', views.VerifierQRCodePublicView.as_view(), name='verifier-qr'),
]