from django.urls import path
from . import views

urlpatterns = [
    path('<str:code>/initier/', views.InitierPaiementView.as_view(), name='initier-paiement'),
    path('callback/', views.CallbackPaiementView.as_view(), name='callback-paiement'),
]