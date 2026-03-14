import api from './api'

export const creerCommande    = (formData) =>
  api.post('/commandes/', formData, { headers: { 'Content-Type': 'multipart/form-data' } })

export const getCommande      = (code) => api.get(`/commandes/${code}/`)
export const initierPaiement  = (code) => api.post(`/paiements/${code}/initier/`)
export const verifierNumero   = (numero) => api.post('/whatsapp/verifier-numero/', { numero })

export const getCommandesAdmin = (statut = '') =>
  api.get(`/commandes/admin/list/${statut ? `?statut=${statut}` : ''}`)

export const updateStatut = (code, statut) =>
  api.patch(`/commandes/admin/${code}/statut/`, { statut })

export const genererQR  = (code)  => api.post(`/qrcodes/generer/${code}/`)
export const validerQR  = (token) => api.post('/qrcodes/valider/', { token })