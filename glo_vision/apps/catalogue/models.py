from django.db import models

class Tableau(models.Model):
    titre = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    prix_unitaire = models.DecimalField(max_digits=10, decimal_places=2)
    image_principale = models.ImageField(upload_to='tableaux/')
    disponible = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Tableau'
        verbose_name_plural = 'Tableaux'
        ordering = ['-created_at']

    def __str__(self):
        return self.titre


class PhotoRealisation(models.Model):
    tableau = models.ForeignKey(
        Tableau,
        on_delete=models.CASCADE,
        related_name='realisations'
    )
    image = models.ImageField(upload_to='realisations/')
    legende = models.CharField(max_length=200, blank=True)
    ordre = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name = 'Photo de réalisation'
        verbose_name_plural = 'Photos de réalisation'
        ordering = ['ordre']

    def __str__(self):
        return f"Réalisation {self.tableau.titre} #{self.ordre}"