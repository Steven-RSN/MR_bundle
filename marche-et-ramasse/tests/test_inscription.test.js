import { describe, beforeEach, expect, vi, test } from "vitest";
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import Inscription from "../src/views/Inscription.vue"
import { sendUserToServer } from "../src/services/api";

// Type:
// Partie 1: unitaire (validation locale)
// Partie 2: integration (soumission + navigation mockee)


describe("valideData()", () => {
    let wrapper;
    beforeEach(() => {
        wrapper = mount(Inscription, {
            global: {
                mocks: {
                    $router: { push: vi.fn() }
                }
            }
        });
    });

    describe("Affiche un message en fonction de la validité des données", () => {
        test("success -> données valides", async () => {

            // Donnee valide: pseudo + email + mot de passe conforme regex.
            let logForm = ref({
                "pseudo": 'test',
                "email": 'test@test.fr',
                "password": 'Test&1234',
                "confirmPassword": 'Test&1234',
            })

            // Action testee: validation locale sans appel API.
            const result = await wrapper.vm.valideData(logForm.value);

            // Attendu: true + aucun message d'erreur.
            // Recu: valeurs observees dans result et wrapper.vm.error.
            expect(result).toEqual(true);
            expect(wrapper.vm.error.password).toEqual("");
            expect(wrapper.vm.error.pseudo).toEqual("");
            expect(wrapper.vm.error.email).toEqual("");
        });
        
        test("error -> la confirmation du mot de passe n'est pas identique", async () => {
            // Donnee invalide: password != confirmPassword.
            let logForm = ref({
                "pseudo": 'test',
                "email": 'test@test.fr',
                "password": 'Test&1234',
                "confirmPassword": 'Test',
            })
            const result = await wrapper.vm.valideData(logForm.value);

            // Attendu: false + message d'erreur metier correspondant.
            expect(result).toEqual(false);
            expect(wrapper.vm.error.password).toEqual("* Les mots de passe ne correspondent pas.");
        });

        test("error -> le pseudo est trop court", async () => {
            // Donnee invalide: pseudo longueur < 3.
            let logForm = ref({
                "pseudo": 't',
                "email": 'test@test.fr',
                "password": 'Test&1234',
                "confirmPassword": 'Test&1234',
            })
            const result = await wrapper.vm.valideData(logForm.value);

            // Attendu -> false + message pseudo trop court
            expect(result).toEqual(false);
            expect(wrapper.vm.error.pseudo).toEqual("* Le pseudo a besoin de 3 caractères minimum.");
        });



        test("error -> le mot de passe ne contient pas un élément nécessaire", async () => {
            //mot de passe non conforme a la regex
            let logForm = ref({
                "pseudo": 'test',
                "email": 'test@test.fr',
                "password": 'Test',
                "confirmPassword": 'Test',
            })
            const result = await wrapper.vm.valideData(logForm.value);

            //Attendu -> false + message de mot de passe
            expect(result).toEqual(false);
            expect(wrapper.vm.error.password).toEqual("* Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.");
        });


        // verifie email invalide
        test("error -> email invalide", async () => {
            let logForm = ref({
                "pseudo": 'test',
                "email": 'fauxmail',
                "password": 'Test&1234',
                "confirmPassword": 'Test&1234',
            })
            const result = await wrapper.vm.valideData(logForm.value);

            // Attendu: false + message email invalide.
            expect(result).toEqual(false);
            expect(wrapper.vm.error.email).toEqual("* L'email est invalide.")
        });
    });
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////

// Mock API de creation utilisateur-> submitForm()
vi.mock("../src/services/api", () => ({
    sendUserToServer: vi.fn(),
}));

const mockPush = vi.fn();
// Mock router pour la redirection
vi.mock("vue-router", () => ({
    useRouter: () => ({ push: mockPush })
}));

describe("submitForm", () => {
    describe("Envoie ou pas les données", () => {
        let wrapper;
        beforeEach(() => {
            wrapper = mount(Inscription);
            mockPush.mockReset();
            sendUserToServer.mockReset();
        });

        test("Success -> envoie le formulaire avec les données valides et redirige", async () => {
            // Donnee valide
            wrapper.vm.pseudo = "Test";
            wrapper.vm.email = "test@test.fr";
            wrapper.vm.password = "Test&1234";
            wrapper.vm.confirmPassword = "Test&1234";

            // donnee recue simulé du backend.
            sendUserToServer.mockResolvedValue({ success: true });

            // test -> submitForm() de inscription
            await wrapper.vm.submitForm();

            // payload complet
            expect(sendUserToServer).toHaveBeenCalledWith({
                pseudo: "Test",
                email: "test@test.fr",
                password: "Test&1234",
                confirmPassword: "Test&1234",
            });

            // redirection 
            expect(mockPush).toHaveBeenCalledWith({ path: "/" });

            // message de succes
            expect(wrapper.vm.message).toEqual("Les données ont été enregistrées !");
        });

        test("Error -> ne soumet pas si erreur server", async () => {
            // Donnee valide mais backend en echec
            // le cas verifie en fait une erreur serveur.
            wrapper.vm.pseudo = "Test";
            wrapper.vm.email = "test@test.fr";
            wrapper.vm.password = "Test&1234";
            wrapper.vm.confirmPassword = "Test&1234";

            // Simulee erreur de l'api
            sendUserToServer.mockRejectedValue(new Error("Erreur serveur"));

            await wrapper.vm.submitForm();

            //message d'erreur + sans redirection
            expect(wrapper.vm.message).toEqual("Une erreur est survenue lors de l'enregistrement.");
            expect(mockPush).not.toHaveBeenCalled();
        });

        test("Error -> affiche un message d'erreur si l'API échoue", async () => {
            
            // Donnee d'entree invalide
            wrapper.vm.pseudo = "t";
            wrapper.vm.email = "fauxemail";
            wrapper.vm.password = "123";
            wrapper.vm.confirmPassword = "456";

            const result = await wrapper.vm.submitForm();

            // ValideData renvoie false.
            expect(sendUserToServer).not.toHaveBeenCalled();

            // Msg d'erreur
            expect(wrapper.vm.error.pseudo).toEqual("* Le pseudo a besoin de 3 caractères minimum.");
            expect(wrapper.vm.error.email).toEqual("* L'email est invalide.");
            expect(wrapper.vm.error.password).toEqual("* Les mots de passe ne correspondent pas.");
        });

    });
});