from django.urls import path
from . import views

urlpatterns = [
    path('', views.TableauListView.as_view(), name='tableau-list'),
    path('admin/list/', views.TableauAdminListView.as_view(), name='tableau-admin-list'),
    path('admin/creer/', views.TableauCreateView.as_view(), name='tableau-create'),
    path('admin/<int:pk>/', views.TableauUpdateView.as_view(), name='tableau-update'),
    path('admin/<int:pk>/realisations/', views.PhotoRealisationCreateView.as_view(), name='photo-create'),
    path('admin/realisations/<int:pk>/', views.PhotoRealisationDeleteView.as_view(), name='photo-delete'),
    path('<int:pk>/', views.TableauDetailView.as_view(), name='tableau-detail'),
]