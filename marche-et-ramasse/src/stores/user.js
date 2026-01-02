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
        isToClean: function (state) {
            return function (dechetId) {
                return state.toClean.includes(dechetId)
            }
        }
    },

    actions: {
        setUser({ id, pseudo, email, token }) {
            this.id = id || null
            this.pseudo = pseudo || null
            this.email = email || null
            this.token = token || null
        },
        setClean(toCleanId) {

            if (!this.toClean.includes(toCleanId)) {
                this.toClean.push(toCleanId)
            }
        }
        ,
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
