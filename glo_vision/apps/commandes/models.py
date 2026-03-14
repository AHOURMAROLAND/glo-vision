from django.db import models
import uuid

class Commande(models.Model):

    class Statut(models.TextChoices):
        EN_ATTENTE = 'EN_ATTENTE', 'En attente'
        PAYEE_AVANCE = 'PAYEE_AVANCE', 'Payée avance'
        EN_PRODUCTION = 'EN_PRODUCTION', 'En production'
        PRETE = 'PRETE', 'Prête'
        RETRAIT_EN_COURS = 'RETRAIT_EN_COURS', 'Retrait en cours'
        SOLDEE = 'SOLDEE', 'Soldée'
        ANNULEE = 'ANNULEE', 'Annulée'

    code = models.CharField(
        max_length=20,
        unique=True,
        editable=False
    )
    tableau = models.ForeignKey(
        'catalogue.Tableau',
        on_delete=models.PROTECT,
        related_name='commandes'
    )
    nom_client = models.CharField(max_length=200)
    numero_whatsapp = models.CharField(max_length=20)
    pseudo_whatsapp = models.CharField(max_length=200, blank=True)
    nb_unites = models.PositiveIntegerField(default=1)
    montant_total = models.DecimalField(max_digits=10, decimal_places=2)
    montant_avance = models.DecimalField(max_digits=10, decimal_places=2)
    montant_solde = models.DecimalField(max_digits=10, decimal_places=2)
    statut = models.CharField(
        max_length=20,
        choices=Statut.choices,
        default=Statut.EN_ATTENTE
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Commande'
        verbose_name_plural = 'Commandes'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.code:
            self.code = f"GLO-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.code} — {self.nom_client}"


class PhotoCommande(models.Model):
    commande = models.ForeignKey(
        Commande,
        on_delete=models.CASCADE,
        related_name='photos'
    )
    image = models.ImageField(upload_to='commandes/photos/')
    nom_original = models.CharField(max_length=255, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Photo commande'
        verbose_name_plural = 'Photos commande'

    def __str__(self):
        return f"Photo {self.commande.code}"