<template>
  <div id="app">
    <NavbarComponent />

    <router-view></router-view>
  </div>

  <Footer></Footer>

</template>

<script setup>
import Footer from './components/Footer.vue';
import NavbarComponent from './components/NavbarComponent.vue';
</script>
