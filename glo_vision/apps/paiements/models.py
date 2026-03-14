from django.db import models

class Paiement(models.Model):

    class Type(models.TextChoices):
        AVANCE = 'AVANCE', 'Avance 50%'
        SOLDE = 'SOLDE', 'Solde 50%'

    class Statut(models.TextChoices):
        EN_ATTENTE = 'EN_ATTENTE', 'En attente'
        SUCCES = 'SUCCES', 'Succès'
        ECHEC = 'ECHEC', 'Échec'

    commande = models.ForeignKey(
        'commandes.Commande',
        on_delete=models.CASCADE,
        related_name='paiements'
    )
    type_paiement = models.CharField(
        max_length=10,
        choices=Type.choices
    )
    montant = models.DecimalField(max_digits=10, decimal_places=2)
    statut = models.CharField(
        max_length=10,
        choices=Statut.choices,
        default=Statut.EN_ATTENTE
    )
    token_paydunya = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Paiement'
        verbose_name_plural = 'Paiements'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.type_paiement} — {self.commande.code} — {self.statut}"