<template>
  <footer class="bg-customGreen mt-18 shadow-inner">
    <div class="mx-auto py-2.5 flex flex-col items-center gap-3 text-gray-900">

      <router-link to="/" class="flex items-center">
        <img src="/icons/logo/M&R.svg" alt="Logo M&R" class="w-16" />
      </router-link>

      <router-link
        to="/cgu"
        class="text-sm hover:underline"
      >
        Conditions Générales d’Utilisation
      </router-link>

      <!-- Copyright ! -->
      <p class="text-xs text-gray-700 text-center">
        © {{ year }} M&R — Tous droits réservés
      </p>

    </div>
  </footer>
</template>

<script setup>
const year = new Date().getFullYear()
</script>
