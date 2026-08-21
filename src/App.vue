<script setup>
import { useContentGuard } from './composables/useContentGuard.js'

useContentGuard()
</script>

<template>
  <router-view />
</template>
