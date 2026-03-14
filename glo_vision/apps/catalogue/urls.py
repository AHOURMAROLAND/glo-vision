from django.urls import path
from . import views

urlpatterns = [
    path('', views.TableauListView.as_view(), name='tableau-list'),
    path('<int:pk>/', views.TableauDetailView.as_view(), name='tableau-detail'),
]