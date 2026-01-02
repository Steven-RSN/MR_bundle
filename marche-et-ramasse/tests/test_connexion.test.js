import { describe, beforeEach, expect, vi, test } from "vitest";
import { shallowMount } from '@vue/test-utils';
import Connexion from "../src/views/Connexion.vue";
import { ref } from 'vue'

// Mock du router
vi.mock('vue-router', () => ({
  resolve: vi.fn(),
}));

describe("valideData()", () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Connexion);
    wrapper.vm.error = { email: '', password: '' };
    mockPush.mockReset();
  });

  test("Cas success : données valides", () => {
    const logForm = ref({ email: 'test@test.fr', password: 'Test&1234' });
    const result = wrapper.vm.valideData(logForm);
    expect(result).toEqual(true);
    expect(wrapper.vm.error.email).toEqual('');
    expect(wrapper.vm.error.password).toEqual('');
  });

  test("Cas error : mot de passe vide", () => {
    const logForm = { email: 'test@test.fr', password: '' };
    const result = wrapper.vm.valideData(logForm);
    expect(result).toEqual(false);
    expect(wrapper.vm.error.password).toEqual("* Entrez le mot de passe.");
  });

  test("Cas error : email invalide", () => {
    const logForm = { email: 'fauxmail', password: 'Test&1234' };
    const result = wrapper.vm.valideData(logForm);
    expect(result).toEqual(false);
    expect(wrapper.vm.error.email).toEqual("* L'email est invalide.");
  });
});
