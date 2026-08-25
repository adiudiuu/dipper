<script setup>
import AppFooter from './components/AppFooter.vue'
import { useContentGuard } from './composables/useContentGuard.js'

useContentGuard()
</script>

<template>
  <router-view />
  <AppFooter />
</template>
