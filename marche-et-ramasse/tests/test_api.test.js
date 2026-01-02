import { beforeEach, describe, it, expect, vi, test } from "vitest";
import { sendDechetToServer } from "../src/services/api.js";
import { setActivePinia, createPinia } from 'pinia'
import axios from 'axios';

//** Initialisation des tests */
beforeEach(() => {
  setActivePinia(createPinia())
})

vi.mock('axios')

axios.post.mockResolvedValue({
  data: { success: true }
})
const API_URL = 'https://192.168.1.63:5173/api'; //backend


describe("sendDechetToServer()", () => {
    test("Retourne la réponse du serveur lors de l'envoi de la requête pour enregistrer un déchet", async () => {

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
        const result = await sendDechetToServer(dechet_test);
        expect(result.success).toEqual(true);
    });

    test('')
});