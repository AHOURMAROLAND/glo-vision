from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.core.cache import cache
from django.utils import timezone
from django.db.models import Count, Sum
from django.db.models.functions import TruncDate
from apps.commandes.models import Commande
from apps.paiements.models import Paiement
from datetime import timedelta

class StatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        today      = timezone.now().date()
        last_7     = [today - timedelta(days=i) for i in range(6, -1, -1)]

        # Visiteurs par jour (7 derniers jours)
        visiteurs = []
        for day in last_7:
            key_unique = f"visiteurs_unique_{day.isoformat()}"
            key_total  = f"visiteurs_total_{day.isoformat()}"
            ips    = cache.get(key_unique, set())
            total  = cache.get(key_total, 0)
            visiteurs.append({
                'date':    day.isoformat(),
                'uniques': len(ips),
                'total':   total,
            })

        # Commandes par statut
        commandes_statut = list(
            Commande.objects.values('statut')
            .annotate(count=Count('id'))
            .order_by('statut')
        )

        # Commandes par jour (7 derniers jours)
        commandes_jour = []
        for day in last_7:
            count = Commande.objects.filter(created_at__date=day).count()
            commandes_jour.append({ 'date': day.isoformat(), 'count': count })

        # Revenus
        total_encaisse = Paiement.objects.filter(
            statut='SUCCES'
        ).aggregate(total=Sum('montant'))['total'] or 0

        avances_encaissees = Paiement.objects.filter(
            statut='SUCCES', type_paiement='AVANCE'
        ).aggregate(total=Sum('montant'))['total'] or 0

        soldes_encaisses = Paiement.objects.filter(
            statut='SUCCES', type_paiement='SOLDE'
        ).aggregate(total=Sum('montant'))['total'] or 0

        # KPIs globaux
        total_commandes  = Commande.objects.count()
        commandes_today  = Commande.objects.filter(created_at__date=today).count()
        visiteurs_today  = len(cache.get(f"visiteurs_unique_{today.isoformat()}", set()))

        return Response({
            'kpis': {
                'total_commandes':      total_commandes,
                'commandes_aujourdhui': commandes_today,
                'visiteurs_aujourdhui': visiteurs_today,
                'total_encaisse':       float(total_encaisse),
                'avances':              float(avances_encaissees),
                'soldes':               float(soldes_encaisses),
            },
            'visiteurs_7j':     visiteurs,
            'commandes_7j':     commandes_jour,
            'commandes_statut': commandes_statut,
        })