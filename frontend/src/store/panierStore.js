import { create } from 'zustand'

const usePanierStore = create((set, get) => ({
  items: [],

  ajouterItem: (tableau, nbUnites, photos) => {
    const items = get().items
    const existe = items.find(i => i.tableau.id === tableau.id)
    if (existe) {
      set({ items: items.map(i =>
        i.tableau.id === tableau.id ? { ...i, nbUnites, photos } : i
      )})
    } else {
      set({ items: [...items, { tableau, nbUnites, photos }] })
    }
  },

  supprimerItem: (tableauId) =>
    set({ items: get().items.filter(i => i.tableau.id !== tableauId) }),

  viderPanier: () => set({ items: [] }),

  totalPanier: () =>
    get().items.reduce((acc, i) => acc + Number(i.tableau.prix_unitaire) * i.nbUnites, 0),
}))

export default usePanierStore