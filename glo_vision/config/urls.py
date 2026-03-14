from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from apps.notifications.stats_views import StatsView
import json

@csrf_exempt
def api_login(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        user = authenticate(request, username=data.get('username'), password=data.get('password'))
        if user and user.is_staff:
            login(request, user)
            return JsonResponse({'username': user.username, 'email': user.email})
        return JsonResponse({'error': 'Identifiants invalides'}, status=401)
    return JsonResponse({'error': 'Méthode non autorisée'}, status=405)

@csrf_exempt
def api_logout(request):
    logout(request)
    return JsonResponse({'status': 'ok'})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/login/', api_login),
    path('api/auth/logout/', api_logout),
    path('api/catalogue/', include('apps.catalogue.urls')),
    path('api/commandes/', include('apps.commandes.urls')),
    path('api/paiements/', include('apps.paiements.urls')),
    path('api/qrcodes/', include('apps.qrcodes.urls')),
    path('api/whatsapp/', include('apps.whatsapp.urls')),
    path('api/stats/', StatsView.as_view(), name='stats'),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)