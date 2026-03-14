import api from './api'

export const getTableaux = () => api.get('/catalogue/')
export const getTableau  = (id) => api.get(`/catalogue/${id}/`)