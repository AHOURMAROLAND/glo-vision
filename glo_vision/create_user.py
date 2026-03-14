import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

username = "admin_glo"
password = "password123!"

try:
    user = User.objects.get(username=username)
    user.set_password(password)
    user.save()
    print(f"User {username} updated with new password.")
except User.DoesNotExist:
    user = User.objects.create_superuser(username=username, email='admin@glo.vision', password=password)
    print(f"User {username} created successfully.")
