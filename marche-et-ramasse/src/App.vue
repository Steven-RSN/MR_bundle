<template>
  <div id="app">
    <NavbarComponent />

    <router-view></router-view>
  </div>
</template>

<script setup>
import NavbarComponent from './components/NavbarComponent.vue';
</script>
