<script setup lang="ts">
import { ref } from 'vue'

const siteName = ref('YaoWeb 管理系统')
const enableRegister = ref(true)

function save() {
  alert('设置已保存（演示）')
}
</script>

<template>
  <div class="settings">
    <h1>系统设置</h1>

    <div class="card">
      <div class="field">
        <label>站点名称</label>
        <input v-model="siteName" type="text" />
      </div>

      <div class="field inline">
        <label>开放注册</label>
        <input v-model="enableRegister" type="checkbox" />
      </div>

      <button class="btn-primary" @click="save">保存设置</button>
    </div>
  </div>
</template>

<style scoped>
.settings h1 {
  margin-bottom: 1.25rem;
  font-size: 1.5rem;
}

.card {
  background: #fff;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  max-width: 480px;
}

.field {
  margin-bottom: 1.25rem;
}

.field label {
  display: block;
  margin-bottom: 0.5rem;
  color: #374151;
  font-weight: 500;
}

.field.inline {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.field.inline label {
  margin-bottom: 0;
}

.field input[type='text'] {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
}

.btn-primary {
  padding: 0.5rem 1rem;
  background: #42b883;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
