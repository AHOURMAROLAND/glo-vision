from django.urls import path
from . import views

urlpatterns = [
    path('verifier-numero/', views.VerifierNumeroView.as_view(), name='verifier-numero'),
]