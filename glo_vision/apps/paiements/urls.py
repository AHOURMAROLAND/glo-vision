from django.urls import path
from . import views_sendava as views

urlpatterns = [
    path('<str:code>/initier/', views.InitierPaiementView.as_view(), name='initier-paiement'),
    path('webhook/', views.WebhookSendavaPayView.as_view(), name='webhook-sendavapay'),
]