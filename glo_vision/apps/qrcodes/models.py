from django.db import models
import uuid
from django.utils import timezone
from datetime import timedelta

class QRCode(models.Model):
    commande = models.OneToOneField(
        'commandes.Commande',
        on_delete=models.CASCADE,
        related_name='qrcode'
    )
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    utilise = models.BooleanField(default=False)
    expire_a = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'QR Code'
        verbose_name_plural = 'QR Codes'

    def save(self, *args, **kwargs):
        if not self.expire_a:
            self.expire_a = timezone.now() + timedelta(days=30)
        super().save(*args, **kwargs)

    def est_valide(self):
        return not self.utilise and timezone.now() < self.expire_a

    def __str__(self):
        return f"QR {self.commande.code} — {'utilisé' if self.utilise else 'valide'}"