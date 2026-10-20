<script setup lang="ts">
const stats = [
  { title: '用户总数', value: '1,204', color: '#3b82f6' },
  { title: '今日访问', value: '342', color: '#10b981' },
  { title: '订单数量', value: '86', color: '#f59e0b' },
  { title: '待处理', value: '12', color: '#ef4444' },
]
</script>

<template>
  <div class="dashboard">
    <h1>仪表盘</h1>
    <div class="stats">
      <div v-for="item in stats" :key="item.title" class="card stat-card">
        <div class="stat-title">{{ item.title }}</div>
        <div class="stat-value" :style="{ color: item.color }">{{ item.value }}</div>
      </div>
    </div>

    <div class="card">
      <h2>最近动态</h2>
      <ul class="activity">
        <li>系统初始化完成</li>
        <li>新增用户 12 人</li>
        <li>订单状态更新</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.dashboard h1 {
  margin-bottom: 1.25rem;
  font-size: 1.5rem;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.card {
  background: #fff;
  border-radius: 8px;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.stat-title {
  color: #6b7280;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: bold;
}

.activity {
  list-style: disc;
  padding-left: 1.25rem;
  color: #4b5563;
  line-height: 1.8;
}
</style>
