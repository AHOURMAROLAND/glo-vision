const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const express = require('express')
const qrcode  = require('qrcode-terminal')
const pino    = require('pino')
const fs      = require('fs')
const path    = require('path')

const QRCode = require('qrcode')

const app  = express()
const PORT = process.env.BOT_PORT || 3001

app.use(express.json({ limit: '50mb' }))

let sock = null
let isConnected = false
let qrGenerated = false

async function connectWhatsApp() {
  console.log('\n[START] Demarrage connexion WhatsApp...')
  
  const { state, saveCreds } = await useMultiFileAuthState('auth_info')

  sock = makeWASocket({
    auth:   state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
  })

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update
    
    if (qr && !qrGenerated) {
      qrGenerated = true
      console.log('\n[QR] QR CODE RECU - GENERATION IMAGE...')
      try {
        await QRCode.toFile('whatsapp-qr.png', qr, {
          width: 500,
          margin: 3,
          color: {
            dark: '#1A1A2E',
            light: '#F5F0E8'
          }
        })
        console.log('[OK] QR Code sauvegarde: whatsapp-qr.png')
        console.log('[INFO] Ouvrez ce fichier et scannez-le avec WhatsApp')
        console.log('   WhatsApp > Menu ⋮ > Appareils connectés > Connecter un appareil')
        console.log('\n[WAIT] En attente de connexion...')
      } catch (err) {
        console.error('[ERR] Erreur generation QR:', err)
      }
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut
      console.log(`Connexion fermée (code: ${statusCode}) - Reconnexion: ${shouldReconnect}`)
      isConnected = false
      qrGenerated = false
      if (shouldReconnect) {
        setTimeout(connectWhatsApp, 3000)
      }
    }

    if (connection === 'open') {
      console.log('\n[OK] [OK] [OK] BOT WHATSAPP CONNECTE ! [OK] [OK] [OK]')
      console.log('[INFO] Le bot peut maintenant envoyer des messages')
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
    const formatted = formatNumero(numero)
    const [result] = await sock.onWhatsApp(formatted)
    if (result) {
      res.json({ valide: true, exists: true, jid: result.jid })
    } else {
      res.json({ valide: false, exists: false })
    }
  } catch (err) {
    console.error('[ERR] Erreur verification:', err)
    res.status(500).json({ error: err.message })
  }
})

// ENDPOINT : statut bot
app.get('/statut', (req, res) => {
  res.json({ connecte: isConnected })
})

app.listen(PORT, () => {
  console.log(`\n[OK] Bot WhatsApp API demarre sur port ${PORT}`)
  console.log('[WAIT] Connexion a WhatsApp en cours...')
  connectWhatsApp()
})
