from django.urls import path
from . import views

urlpatterns = [
    path('', views.CommandeCreateView.as_view(), name='commande-create'),
    path('admin/list/', views.CommandeListAdminView.as_view(), name='commande-admin-list'),
    path('admin/<str:code>/statut/', views.CommandeStatutUpdateView.as_view(), name='commande-statut-update'),
    path('admin/<str:code>/photos/', views.TelechargerPhotosCommandeView.as_view(), name='commande-photos-download'),
    path('<str:code>/', views.CommandeDetailView.as_view(), name='commande-detail'),
]