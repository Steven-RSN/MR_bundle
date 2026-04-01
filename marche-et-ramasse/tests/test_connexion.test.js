import { mount } from '@vue/test-utils'
import { vi, describe, test, expect, beforeEach } from 'vitest'
import Connexion from "../src/views/Connexion.vue";
import * as api from '../src/services/api.js'
import { createPinia, setActivePinia } from 'pinia'
import { useUserStore } from '../src/stores/user'

// -----------------------------------------------------------------------------
// Fichier: test_connexion.test.js
// Cible metier: src/views/Connexion.vue -> submitForm()
// Fonctions reliees: src/services/api.js -> login(), src/stores/user.js -> setUser()
// Type: test de composant / integration legere (Vue + Pinia + Router mocke)
// -----------------------------------------------------------------------------

const mockPush = vi.fn()
// Mock router -> verifier la navigation
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush
  })
}))

describe('Connexion - submitForm()', () => {
  let wrapper
  let userStore

  beforeEach(() => {
    setActivePinia(createPinia())
    wrapper = mount(Connexion)
    userStore = useUserStore()
    mockPush.mockClear()
  })

  test("success -> login reussi stocke l'utilisateur et navigue !", async () => {
    // Donnee recue simulee depuis l'API / login()
    const fakeUser = { id: 1, pseudo: 'test', email: 'test@test.fr', token: 'abc123' }
    vi.spyOn(api, 'login').mockResolvedValue({ success: true, user: fakeUser })

    // Donnee du test 
    wrapper.vm.email = 'test@test.fr'
    wrapper.vm.password = '123456'

    // test: submitForm() de la connexion.
    // 1 validation
    // 2 appel login()
    // 3 setUser() dans Pinia
    // 4 router.push vers Accueil
    await wrapper.vm.submitForm()

    expect(userStore.id).toBe(fakeUser.id)
    expect(userStore.pseudo).toBe(fakeUser.pseudo)
    expect(userStore.token).toBe(fakeUser.token)
    
    //navigation vers accueil
    expect(mockPush).toHaveBeenCalledWith({ name: 'Accueil', params: '' })
  })
})
