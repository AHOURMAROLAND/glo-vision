const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const express = require('express')
const qrcode  = require('qrcode-terminal')
const pino    = require('pino')
const fs      = require('fs')
const path    = require('path')

const app  = express()
const PORT = process.env.BOT_PORT || 3001

app.use(express.json({ limit: '50mb' }))

let sock = null
let isConnected = false

async function connectWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info')

  sock = makeWASocket({
    auth:   state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: true,
  })

  sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      console.log('\n=== SCANNEZ CE QR CODE AVEC WHATSAPP ===')
      qrcode.generate(qr, { small: true })
      console.log('=========================================\n')
    }

    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
      console.log('Connexion fermée — reconnexion:', shouldReconnect)
      isConnected = false
      if (shouldReconnect) connectWhatsApp()
    }

    if (connection === 'open') {
      console.log('✓ Bot WhatsApp connecté !')
      isConnected = true
    }
  })

  sock.ev.on('creds.update', saveCreds)
}

// Formater numéro
function formatNumero(numero) {
  const n = numero.replace(/\D/g, '')
  return n.includes('@') ? n : `${n}@s.whatsapp.net` 
}

// ENDPOINT : envoyer message texte
app.post('/envoyer-message', async (req, res) => {
  const { numero, message } = req.body
  if (!numero || !message) return res.status(400).json({ error: 'numero et message requis' })
  if (!isConnected)        return res.status(503).json({ error: 'Bot non connecté' })

  try {
    await sock.sendMessage(formatNumero(numero), { text: message })
    res.json({ success: true })
  } catch (err) {
    console.error('Erreur envoi message:', err)
    res.status(500).json({ error: err.message })
  }
})

// ENDPOINT : envoyer PDF
app.post('/envoyer-pdf', async (req, res) => {
  const { numero, pdf_base64, nom_fichier, caption } = req.body
  if (!numero || !pdf_base64) return res.status(400).json({ error: 'numero et pdf_base64 requis' })
  if (!isConnected)           return res.status(503).json({ error: 'Bot non connecté' })

  try {
    const buffer = Buffer.from(pdf_base64, 'base64')
    await sock.sendMessage(formatNumero(numero), {
      document: buffer,
      mimetype: 'application/pdf',
      fileName: nom_fichier || 'recu.pdf',
      caption:  caption || '',
    })
    res.json({ success: true })
  } catch (err) {
    console.error('Erreur envoi PDF:', err)
    res.status(500).json({ error: err.message })
  }
})

// ENDPOINT : envoyer image
app.post('/envoyer-image', async (req, res) => {
  const { numero, url_image, caption } = req.body
  if (!numero || !url_image) return res.status(400).json({ error: 'numero et url_image requis' })
  if (!isConnected)          return res.status(503).json({ error: 'Bot non connecté' })

  try {
    await sock.sendMessage(formatNumero(numero), {
      image:   { url: url_image },
      caption: caption || '',
    })
    res.json({ success: true })
  } catch (err) {
    console.error('Erreur envoi image:', err)
    res.status(500).json({ error: err.message })
  }
})

// ENDPOINT : vérifier numéro
app.post('/verifier-numero', async (req, res) => {
  const { numero } = req.body
  if (!numero)      return res.status(400).json({ error: 'numero requis' })
  if (!isConnected) return res.status(503).json({ error: 'Bot non connecté' })

  try {
    const [result] = await sock.onWhatsApp(numero.replace(/\D/g, ''))
    if (result?.exists) {
      const info = await sock.fetchStatus(result.jid).catch(() => null)
      res.json({
        valide: true,
        jid:    result.jid,
        numero: numero,
        pseudo: info?.status || numero,
      })
    } else {
      res.json({ valide: false, numero })
    }
  } catch (err) {
    console.error('Erreur vérification:', err)
    res.status(500).json({ error: err.message })
  }
})

// ENDPOINT : statut bot
app.get('/statut', (req, res) => {
  res.json({ connecte: isConnected })
})

app.listen(PORT, () => {
  console.log(`\n🤖 Bot WhatsApp API démarré sur port ${PORT}`)
  connectWhatsApp()
})
