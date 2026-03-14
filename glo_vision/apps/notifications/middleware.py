from django.utils import timezone
from django.core.cache import cache

class VisiteurMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if not request.path.startswith('/admin') and not request.path.startswith('/static'):
            today = timezone.now().date().isoformat()
            ip = request.META.get('HTTP_X_FORWARDED_FOR', request.META.get('REMOTE_ADDR', '')).split(',')[0].strip()
            key_unique = f"visiteurs_unique_{today}"
            key_total  = f"visiteurs_total_{today}"
            ips = cache.get(key_unique, set())
            ips.add(ip)
            cache.set(key_unique, ips, 60 * 60 * 25)
            cache.set(key_total, cache.get(key_total, 0) + 1, 60 * 60 * 25)

        return self.get_response(request)