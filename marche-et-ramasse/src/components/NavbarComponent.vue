<template>
  <nav class="bg-customGreen px-3 py-1.5 shadow-md">
    <div class="max-w-6xl mx-auto flex flex-wrap items-center justify-between ">
      <!-- Logo ou titre -->
      <router-link to="/" class=" items-center text-lg font-semibold text-gray-900">
        <img src="/icons/logo/M&R.svg" class="w-12 mx-auto " alt="">
      </router-link>

      <!-- Bouton menu (mobile) -->
      <button @click="open = !open" class="md:hidden text-gray-900 focus:outline-none">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>

      <div class="justify-center">

        <!-- Liens de navigation -->
        <div :class="{ 'block': open, 'hidden': !open }"
          class="w-full md:flex md:w-auto md:justify-between mt-2 md:mt-0">
          <router-link to="/"
            class="block md:inline-block text-gray-900 hover:underline px-2 py-1">Accueil</router-link>
          <router-link to="/formulaire"
            class="block md:inline-block text-gray-900 hover:underline px-2 py-1">Formulaire</router-link>
          <router-link to="/cgu" class="block md:inline-block text-gray-900 hover:underline px-2 py-1">CGU</router-link>

          <template v-if="isLogged">
            <router-link to="/profil"
              class="block md:inline-block text-gray-900 hover:underline px-2 py-1">Profil</router-link>
            <span class="text-gray-900 font-semibold px-2 py-1">
              Yo {{ userStore.pseudo }}
            </span>
            <button @click="logout"
              class="bg-green-500  block md:inline-block  px-3 py-1 rounded-lg transition">Déco</button>

          </template>
          

          <!-- -(non connecté)- -->
          <template v-else>
            <router-link to="/inscription"
              class="block md:inline-block text-gray-900 hover:underline px-2 py-1">Inscription</router-link>
            <router-link to="/connexion"
              class="block md:inline-block text-gray-900 hover:underline px-2 py-1">Connexion</router-link>
          </template>

        </div>
      </div>

    </div>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';

const userStore = useUserStore()
const router = useRouter()

const isLogged = computed(() => Boolean(userStore.email)) //pas sécur ? 
console.log(userStore)
const open = ref(false)
function logout() {
  userStore.logout()
  router.push({ name: 'Accueil' })
}
</script>


<script setup>

</script>

<style scoped>
.navbar {
  display: flex;
  gap: 20px;
  padding: 10px;
}

.nav-link {

  text-decoration: none;
  font-weight: bold;
}

.nav-link.router-link-exact-active {
  text-decoration: underline;
}
</style>
