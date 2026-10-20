<script setup lang="ts">
import { useCounterStore } from '../stores/counter'

const counter = useCounterStore()
</script>

<template>
  <div class="about">
    <h1>关于页面</h1>
    <p>这是一个基于 Vue 3 + Vite + TypeScript 的基础脚手架。</p>
    <p>计数：{{ counter.count }}</p>
    <p>双倍：{{ counter.doubleCount }}</p>
    <button @click="counter.increment">+1</button>
  </div>
</template>

<style scoped>
.about {
  text-align: center;
  padding: 2rem;
}

button {
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
}
</style>
