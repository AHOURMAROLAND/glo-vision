import api from './api'

export const getTableaux      = () => api.get('/catalogue/')
export const getTableau       = (id) => api.get(`/catalogue/${id}/`)
export const getTableauxAdmin = () => api.get('/catalogue/admin/list/')

export const creerTableau = (formData) =>
  api.post('/catalogue/admin/creer/', formData)

export const updateTableau = (id, formData) =>
  api.patch(`/catalogue/admin/${id}/`, formData)

export const supprimerTableau = (id) =>
  api.delete(`/catalogue/admin/${id}/`)

export const ajouterRealisation = (tableauId, formData) =>
  api.post(`/catalogue/admin/${tableauId}/realisations/`, formData)

export const supprimerRealisation = (photoId) =>
  api.delete(`/catalogue/admin/realisations/${photoId}/`)