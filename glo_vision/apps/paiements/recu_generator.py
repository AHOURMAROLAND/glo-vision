from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib.colors import HexColor, white, black
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from io import BytesIO
from django.utils import timezone

GOLD = HexColor('#C4963A')
DARK = HexColor('#1A1A2E')
LIGHT_GRAY = HexColor('#F5F0E8')
MEDIUM_GRAY = HexColor('#8B7355')

def generer_recu_avance(commande):
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=2*cm,
        leftMargin=2*cm,
        topMargin=2*cm,
        bottomMargin=2*cm
    )

    styles = getSampleStyleSheet()
    elements = []

    style_titre_boutique = ParagraphStyle(
        'TitreBoutique',
        parent=styles['Normal'],
        fontSize=28,
        textColor=DARK,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold',
        spaceAfter=2,
    )
    style_sous_titre = ParagraphStyle(
        'SousTitre',
        parent=styles['Normal'],
        fontSize=11,
        textColor=MEDIUM_GRAY,
        alignment=TA_CENTER,
        fontName='Helvetica',
        spaceAfter=4,
        letterSpacing=4,
    )
    style_type_recu = ParagraphStyle(
        'TypeRecu',
        parent=styles['Normal'],
        fontSize=14,
        textColor=white,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold',
        spaceAfter=0,
    )
    style_label = ParagraphStyle(
        'Label',
        parent=styles['Normal'],
        fontSize=10,
        textColor=MEDIUM_GRAY,
        fontName='Helvetica',
    )
    style_valeur = ParagraphStyle(
        'Valeur',
        parent=styles['Normal'],
        fontSize=11,
        textColor=DARK,
        fontName='Helvetica-Bold',
    )
    style_montant = ParagraphStyle(
        'Montant',
        parent=styles['Normal'],
        fontSize=22,
        textColor=GOLD,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold',
    )
    style_footer = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=9,
        textColor=MEDIUM_GRAY,
        alignment=TA_CENTER,
        fontName='Helvetica',
    )
    style_code = ParagraphStyle(
        'Code',
        parent=styles['Normal'],
        fontSize=13,
        textColor=GOLD,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold',
        spaceAfter=4,
    )

    elements.append(Paragraph("GLO VISION", style_titre_boutique))
    elements.append(Paragraph("PHOTOGRAPHIE", style_sous_titre))
    elements.append(HRFlowable(width="100%", thickness=2, color=GOLD, spaceAfter=12))

    type_label = "REÇU D'ACOMPTE" if hasattr(commande, '_type_recu') and commande._type_recu == 'avance' else "REÇU FINAL"
    banner_data = [[Paragraph(type_label, style_type_recu)]]
    banner_table = Table(banner_data, colWidths=[17*cm])
    banner_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), DARK),
        ('ROWBACKGROUNDS', (0, 0), (-1, -1), [DARK]),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
        ('ROUNDEDCORNERS', [6, 6, 6, 6]),
    ]))
    elements.append(banner_table)
    elements.append(Spacer(1, 16))

    elements.append(Paragraph(f"Code commande : {commande.code}", style_code))
    elements.append(Paragraph(
        f"Date : {timezone.now().strftime('%d/%m/%Y à %H:%M')}",
        ParagraphStyle('Date', parent=styles['Normal'], fontSize=10,
                       textColor=MEDIUM_GRAY, alignment=TA_CENTER, fontName='Helvetica')
    ))
    elements.append(Spacer(1, 16))

    info_data = [
        [Paragraph("CLIENT", style_label), Paragraph(commande.nom_client, style_valeur)],
        [Paragraph("WHATSAPP", style_label), Paragraph(commande.numero_whatsapp, style_valeur)],
        [Paragraph("TABLEAU", style_label), Paragraph(commande.tableau.titre, style_valeur)],
        [Paragraph("QUANTITÉ", style_label), Paragraph(str(commande.nb_unites), style_valeur)],
    ]
    info_table = Table(info_data, colWidths=[5*cm, 12*cm])
    info_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), LIGHT_GRAY),
        ('ROWBACKGROUNDS', (0, 0), (-1, -1), [LIGHT_GRAY, white]),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
        ('LINEBELOW', (0, 0), (-1, -2), 0.5, HexColor('#E0D8CC')),
    ]))
    elements.append(info_table)
    elements.append(Spacer(1, 20))

    elements.append(HRFlowable(width="100%", thickness=0.5, color=GOLD, spaceAfter=12))

    montant_data = [
        [Paragraph("Montant total", style_label),
         Paragraph(f"{commande.montant_total} FCFA", style_valeur)],
        [Paragraph("Acompte payé (50%)", style_label),
         Paragraph(f"{commande.montant_avance} FCFA",
                   ParagraphStyle('MontantVert', parent=styles['Normal'],
                                  fontSize=11, textColor=HexColor('#2A7A2A'),
                                  fontName='Helvetica-Bold'))],
        [Paragraph("Solde restant", style_label),
         Paragraph(f"{commande.montant_solde} FCFA",
                   ParagraphStyle('MontantOr', parent=styles['Normal'],
                                  fontSize=11, textColor=GOLD,
                                  fontName='Helvetica-Bold'))],
    ]
    montant_table = Table(montant_data, colWidths=[9*cm, 8*cm])
    montant_table.setStyle(TableStyle([
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('LINEBELOW', (0, 0), (-1, -2), 0.5, HexColor('#E0D8CC')),
    ]))
    elements.append(montant_table)
    elements.append(HRFlowable(width="100%", thickness=0.5, color=GOLD, spaceAfter=20))

    elements.append(Spacer(1, 12))
    elements.append(Paragraph(
        "Merci pour votre confiance !",
        ParagraphStyle('Merci', parent=styles['Normal'], fontSize=13,
                       textColor=DARK, alignment=TA_CENTER,
                       fontName='Helvetica-Bold', spaceAfter=4)
    ))
    elements.append(Paragraph(
        "Votre tableau est réalisé avec soin. Nous vous contacterons sur WhatsApp dès qu'il sera prêt.",
        style_footer
    ))
    elements.append(Spacer(1, 20))
    elements.append(Paragraph("Glo Vision — Photographie professionnelle", style_footer))

    doc.build(elements)
    buffer.seek(0)
    return buffer

def generer_recu_final(commande):
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=2*cm,
        leftMargin=2*cm,
        topMargin=2*cm,
        bottomMargin=2*cm
    )

    styles   = getSampleStyleSheet()
    elements = []

    style_titre_boutique = ParagraphStyle(
        'TitreBoutique',
        parent=styles['Normal'],
        fontSize=28,
        textColor=DARK,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold',
        spaceAfter=2,
    )
    style_sous_titre = ParagraphStyle(
        'SousTitre',
        parent=styles['Normal'],
        fontSize=11,
        textColor=MEDIUM_GRAY,
        alignment=TA_CENTER,
        fontName='Helvetica',
        spaceAfter=4,
    )
    style_type_recu = ParagraphStyle(
        'TypeRecu',
        parent=styles['Normal'],
        fontSize=14,
        textColor=white,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold',
    )
    style_label = ParagraphStyle(
        'Label',
        parent=styles['Normal'],
        fontSize=10,
        textColor=MEDIUM_GRAY,
        fontName='Helvetica',
    )
    style_valeur = ParagraphStyle(
        'Valeur',
        parent=styles['Normal'],
        fontSize=11,
        textColor=DARK,
        fontName='Helvetica-Bold',
    )
    style_footer = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=9,
        textColor=MEDIUM_GRAY,
        alignment=TA_CENTER,
        fontName='Helvetica',
    )
    style_code = ParagraphStyle(
        'Code',
        parent=styles['Normal'],
        fontSize=13,
        textColor=GOLD,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold',
        spaceAfter=4,
    )

    elements.append(Paragraph("GLO VISION", style_titre_boutique))
    elements.append(Paragraph("PHOTOGRAPHIE", style_sous_titre))
    elements.append(HRFlowable(width="100%", thickness=2, color=GOLD, spaceAfter=12))

    banner_data = [[Paragraph("REÇU FINAL — COMMANDE SOLDÉE", style_type_recu)]]
    banner_table = Table(banner_data, colWidths=[17*cm])
    banner_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), DARK),
        ('TOPPADDING', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
    ]))
    elements.append(banner_table)
    elements.append(Spacer(1, 16))

    elements.append(Paragraph(f"Code commande : {commande.code}", style_code))
    elements.append(Paragraph(
        f"Date : {timezone.now().strftime('%d/%m/%Y à %H:%M')}",
        ParagraphStyle('Date', parent=styles['Normal'], fontSize=10,
                       textColor=MEDIUM_GRAY, alignment=TA_CENTER, fontName='Helvetica')
    ))
    elements.append(Spacer(1, 16))

    info_data = [
        [Paragraph("CLIENT",   style_label), Paragraph(commande.nom_client,      style_valeur)],
        [Paragraph("WHATSAPP", style_label), Paragraph(commande.numero_whatsapp, style_valeur)],
        [Paragraph("TABLEAU",  style_label), Paragraph(commande.tableau.titre,    style_valeur)],
        [Paragraph("QUANTITÉ", style_label), Paragraph(str(commande.nb_unites),   style_valeur)],
    ]
    info_table = Table(info_data, colWidths=[5*cm, 12*cm])
    info_table.setStyle(TableStyle([
        ('BACKGROUND',   (0,0), (-1,-1), LIGHT_GRAY),
        ('ROWBACKGROUNDS',(0,0),(-1,-1), [LIGHT_GRAY, white]),
        ('TOPPADDING',   (0,0), (-1,-1), 8),
        ('BOTTOMPADDING',(0,0), (-1,-1), 8),
        ('LEFTPADDING',  (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
        ('LINEBELOW',    (0,0), (-1,-2), 0.5, HexColor('#E0D8CC')),
    ]))
    elements.append(info_table)
    elements.append(Spacer(1, 20))
    elements.append(HRFlowable(width="100%", thickness=0.5, color=GOLD, spaceAfter=12))

    montant_data = [
        [Paragraph("Acompte déjà payé", style_label),
         Paragraph(f"{commande.montant_avance} FCFA",
                   ParagraphStyle('Avance', parent=styles['Normal'],
                                  fontSize=11, textColor=HexColor('#2A7A2A'),
                                  fontName='Helvetica-Bold'))],
        [Paragraph("Solde payé aujourd'hui", style_label),
         Paragraph(f"{commande.montant_solde} FCFA",
                   ParagraphStyle('Solde', parent=styles['Normal'],
                                  fontSize=11, textColor=GOLD,
                                  fontName='Helvetica-Bold'))],
        [Paragraph("TOTAL PAYÉ", style_label),
         Paragraph(f"{commande.montant_total} FCFA",
                   ParagraphStyle('Total', parent=styles['Normal'],
                                  fontSize=14, textColor=DARK,
                                  fontName='Helvetica-Bold'))],
    ]
    montant_table = Table(montant_data, colWidths=[9*cm, 8*cm])
    montant_table.setStyle(TableStyle([
        ('TOPPADDING',   (0,0), (-1,-1), 8),
        ('BOTTOMPADDING',(0,0), (-1,-1), 8),
        ('LEFTPADDING',  (0,0), (-1,-1), 0),
        ('LINEBELOW',    (0,0), (-1,-2), 0.5, HexColor('#E0D8CC')),
    ]))
    elements.append(montant_table)
    elements.append(HRFlowable(width="100%", thickness=0.5, color=GOLD, spaceAfter=20))

    elements.append(Spacer(1, 12))
    elements.append(Paragraph(
        "Commande clôturée — Merci pour votre confiance !",
        ParagraphStyle('Merci', parent=styles['Normal'], fontSize=13,
                       textColor=DARK, alignment=TA_CENTER,
                       fontName='Helvetica-Bold', spaceAfter=4)
    ))
    elements.append(Paragraph(
        "Votre tableau a été réalisé avec soin. Revenez nous voir bientôt !",
        style_footer
    ))
    elements.append(Spacer(1, 20))
    elements.append(Paragraph("Glo Vision — Photographie professionnelle — Lomé, Togo", style_footer))

    doc.build(elements)
    buffer.seek(0)
    return buffer