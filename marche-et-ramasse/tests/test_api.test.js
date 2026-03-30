import { beforeEach, describe, it, expect, vi, test } from "vitest";
import { sendDechetToServer } from "../src/services/api.js";
import { setActivePinia, createPinia } from 'pinia'
import axios from 'axios';
//  l'endpoint 

// -----------------------------------------------------------------------------
// verifier la coherence entre le test et la fonction reelle du service API.
// fonction cible: src/services/api.js -> sendDechetToServer()
// Type de test: unitaire (service) avec mock de dependance externe (axios)
// Ce que ce test NE couvre PAS: le vrai backend, la vraie URL reseau, la latence.
// -----------------------------------------------------------------------------

// Initialisation d'un store Pinia avant chaque test.
// Pourquoi: sendDechetToServer lit useUserStore().token dans le service.


// initialisation du store Pinia
beforeEach(() => {
  setActivePinia(createPinia())
})

// Mock generale de axios pour controler la rep
vi.mock('axios')

// force un retour de succes
axios.post.mockResolvedValue({
  data: { success: true }
})
const API_URL = 'https://192.168.1.63:5173/api'; //backend


describe("sendDechetToServer()", () => {
    test("Retourne la réponse du serveur lors de l'envoi de la requête pour enregistrer un déchet ", async () => {
      
      // represente le payload attendu par registerDechet()
      const dechet_test = {
        idUser: 1,
        images: "uploads/1/img_0.webp",
        type_dechet: "Plastique",
        volume_litres: 1.5,
        poids_kg: 0.5,
        lieu: "Toulouse",
        commentaire: "Un tas de bouteilles en plastique trouvé au milieu du trottoir.",
        latitude: 43.599998,
        longitude: 1.43333,
        date: new Date().toISOString()
      }

      //la fonction appelle sendDechetToServer() puis renvoi response.data
      const result = await sendDechetToServer(dechet_test);

      // Verification de la donnée attendue vs reçue: 
      // Attendu : retourne { success: true }
      expect(result.success).toEqual(true);
    });

    test('')
});

// Attendu: success === true


// TODO de projet: test non implemente.
// A completer avec des cas importants:
// 1) verification de l'appel axios.post avec URL + payload + Authorization
// 2) cas erreur 401 (token absent/invalide)
// 3) cas erreur reseau (throw)