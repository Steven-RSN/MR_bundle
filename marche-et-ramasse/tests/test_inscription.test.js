import { describe, beforeEach, expect, vi, test } from "vitest";
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import Inscription from "../src/views/Inscription.vue"
import { sendUserToServer } from "../src/services/api";


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

    describe("Affiche un message en fonction de la validité ou non des données", () => {
        test("Cas success : données valides", async () => {

            let logForm = ref({
                "pseudo": 'test',
                "email": 'test@test.fr',
                "password": 'Test&1234',
                "confirmPassword": 'Test&1234',
            })
            const result = await wrapper.vm.valideData(logForm.value);
            expect(result).toEqual(true);
            expect(wrapper.vm.error.password).toEqual("");
            expect(wrapper.vm.error.pseudo).toEqual("");
            expect(wrapper.vm.error.email).toEqual("");
        });

        test("Cas error : le mot de passe ne contient pas un élément nécessaire", async () => {
            let logForm = ref({
                "pseudo": 'test',
                "email": 'test@test.fr',
                "password": 'Test',
                "confirmPassword": 'Test',
            })
            const result = await wrapper.vm.valideData(logForm.value);
            expect(result).toEqual(false);
            expect(wrapper.vm.error.password).toEqual("* Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.");
        });

        test("Cas error : la confirmation du mot de passe n'est pas identique", async () => {
            let logForm = ref({
                "pseudo": 'test',
                "email": 'test@test.fr',
                "password": 'Test&1234',
                "confirmPassword": 'Test',
            })
            const result = await wrapper.vm.valideData(logForm.value);
            expect(result).toEqual(false);
            expect(wrapper.vm.error.password).toEqual("* Les mots de passe ne correspondent pas.");
        });

        test("Cas error : le pseudo est trop court", async () => {
            let logForm = ref({
                "pseudo": 't',
                "email": 'test@test.fr',
                "password": 'Test&1234',
                "confirmPassword": 'Test&1234',
            })
            const result = await wrapper.vm.valideData(logForm.value);
            expect(result).toEqual(false);
            expect(wrapper.vm.error.pseudo).toEqual("* Le pseudo a besoin de 3 caractères minimum.");
        });

        test("Cas error : le pseudo est trop court", async () => {
            let logForm = ref({
                "pseudo": 'test',
                "email": 'fauxmail',
                "password": 'Test&1234',
                "confirmPassword": 'Test&1234',
            })
            const result = await wrapper.vm.valideData(logForm.value);
            expect(result).toEqual(false);
            expect(wrapper.vm.error.email).toEqual("* L'email est invalide.")
        });
    });
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////
vi.mock("../src/services/api", () => ({
    sendUserToServer: vi.fn(),
}));

const mockPush = vi.fn();
vi.mock("vue-router", () => ({
    useRouter: () => ({ push: mockPush })
}));

describe("submitForm", () => {
    describe("Envoie ou non les données", () => {
        let wrapper;

        beforeEach(() => {
            wrapper = mount(Inscription);
            mockPush.mockReset();
            sendUserToServer.mockReset();
        });

        test("Cas success : envoie le formulaire avec des données valides et redirige", async () => {
            // Remplir les refs du composant
            wrapper.vm.pseudo = "Test";
            wrapper.vm.email = "test@test.fr";
            wrapper.vm.password = "Test&1234";
            wrapper.vm.confirmPassword = "Test&1234";

            // Mock API répond avec succès
            sendUserToServer.mockResolvedValue({ success: true });

            await wrapper.vm.submitForm();

            // Vérifier l'appel API
            expect(sendUserToServer).toHaveBeenCalledWith({
                pseudo: "Test",
                email: "test@test.fr",
                password: "Test&1234",
                confirmPassword: "Test&1234",
            });

            // Vérifier redirection
            expect(mockPush).toHaveBeenCalledWith({ path: "/" });

            // Vérifier le message affiché
            expect(wrapper.vm.message).toEqual("Les données ont été enregistrées !");
        });

        test("Cas error : ne soumet pas si les données sont invalides", async () => {
            wrapper.vm.pseudo = "Test";
            wrapper.vm.email = "test@test.fr";
            wrapper.vm.password = "Test&1234";
            wrapper.vm.confirmPassword = "Test&1234";

            // Mock API rejette la promesse
            sendUserToServer.mockRejectedValue(new Error("Erreur serveur"));

            await wrapper.vm.submitForm();

            expect(wrapper.vm.message).toEqual("Une erreur est survenue lors de l'enregistrement.");
            expect(mockPush).not.toHaveBeenCalled();
        });

        test("Cas error : affiche un message d'erreur si l'API échoue", async () => {
            wrapper.vm.pseudo = "t";
            wrapper.vm.email = "fauxemail";
            wrapper.vm.password = "123";
            wrapper.vm.confirmPassword = "456";

            const result = await wrapper.vm.submitForm();

            // L'API ne doit pas être appelée
            expect(sendUserToServer).not.toHaveBeenCalled();

            // Vérifier que result contient les erreurs
            expect(wrapper.vm.error.pseudo).toEqual("* Le pseudo a besoin de 3 caractères minimum.");
            expect(wrapper.vm.error.email).toEqual("* L'email est invalide.");
            expect(wrapper.vm.error.password).toEqual("* Les mots de passe ne correspondent pas.");
        });

    });
});