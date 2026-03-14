import { create } from 'zustand'
import api from '../services/api'

const useAuthStore = create((set) => ({
  user: null,
  isAdmin: false,

  login: async (username, password) => {
    const res = await api.post('/auth/login/', { username, password })
    set({ user: res.data, isAdmin: true })
    return res.data
  },

  logout: async () => {
    await api.post('/auth/logout/')
    set({ user: null, isAdmin: false })
  },
}))

export default useAuthStore