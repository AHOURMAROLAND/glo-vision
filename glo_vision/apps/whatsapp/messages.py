def msg_recu_avance(commande):
    return f"""Bonjour {commande.nom_client} !

Votre commande *{commande.code}* a bien été enregistrée.

*Tableau :* {commande.tableau.titre}
*Quantité :* {commande.nb_unites} unité(s)
*Montant total :* {commande.montant_total} FCFA
*Acompte payé :* {commande.montant_avance} FCFA
*Solde restant :* {commande.montant_solde} FCFA

Nous traitons votre commande et vous informons dès qu'elle est prête.

Merci de votre confiance — *Glo Vision*"""

def msg_tableau_pret(commande, qr_url):
    return f"""Bonjour {commande.nom_client} !

Votre tableau est *prêt* !

*Commande :* {commande.code}
*Tableau :* {commande.tableau.titre}

Venez récupérer votre commande et régler le solde de *{commande.montant_solde} FCFA*.

Présentez ce QR code à notre équipe lors du retrait :
{qr_url}

À bientôt — *Glo Vision*"""

def msg_recu_final(commande):
    return f"""Merci {commande.nom_client} !

Votre commande *{commande.code}* est clôturée.

*Tableau :* {commande.tableau.titre}
*Acompte payé :* {commande.montant_avance} FCFA
*Solde payé :* {commande.montant_solde} FCFA
*Total :* {commande.montant_total} FCFA

Merci pour votre confiance.
Revenez nous voir bientôt !

*Glo Vision*"""

def msg_notif_admin(commande):
    return f"""Nouvelle commande reçue !

*Code :* {commande.code}
*Client :* {commande.nom_client}
*WhatsApp :* {commande.numero_whatsapp}
*Tableau :* {commande.tableau.titre}
*Quantité :* {commande.nb_unites}
*Montant total :* {commande.montant_total} FCFA
*Acompte :* {commande.montant_avance} FCFA"""