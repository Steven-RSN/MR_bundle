import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
    state: () => ({
        id: null,
        pseudo: null,
        email: null,
        token: null,
        toClean: [],
    }),
    getters: {
        isToClean: (state) => (dechetId) => state.toClean.includes(dechetId),//temp ?

        dechetsSaved: (state) => state.toClean
    },

    actions: {
        setUser({ id, pseudo, email, token }) {
            this.id = id || null
            this.pseudo = pseudo || null
            this.email = email || null
            this.token = token || null
        },
        toggleClean(dechetId) {
            const index = this.toClean.indexOf(dechetId)
            if (index === -1) {
                this.toClean.push(dechetId) // ajouter
            } else {
                this.toClean.splice(index, 1) // retirer
            }
        },

        setClean(toCleanId) {
            if (!this.toClean.includes(toCleanId)) {
                this.toClean.push(toCleanId)
            }
        },
        logout() {
            this.id = null
            this.pseudo = null
            this.email = null
            this.token = null
            this.toClean = []
        }
    },
    persist: true,
})
