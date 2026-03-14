from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/catalogue/', include('apps.catalogue.urls')),
    path('api/commandes/', include('apps.commandes.urls')),
    path('api/paiements/', include('apps.paiements.urls')),
    path('api/qrcodes/', include('apps.qrcodes.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)