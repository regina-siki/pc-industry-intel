<template>
  <div class="panel">
    <h2 class="section-title">公司 / 产品库</h2>
    <div class="filter">
      <el-radio-group v-model="category" @change="reload">
        <el-radio-button label="">全部</el-radio-button>
        <el-radio-button
          v-for="c in categories"
          :key="c"
          :label="c"
        >{{ c }}</el-radio-button>
      </el-radio-group>
    </div>

    <div class="grid">
      <div class="card" v-for="c in companies" :key="c.name">
        <div class="card-head">
          <div class="logo">{{ c.name.slice(0, 1) }}</div>
          <div>
            <div class="name">{{ c.name }}</div>
            <div class="muted" style="font-size: 12px">
              {{ c.category }} · {{ c.country }}
            </div>
          </div>
        </div>
        <div class="tags">
          <el-tag v-for="t in c.tags" :key="t" size="small">{{ t }}</el-tag>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { fetchCompanies } from '@/api'

const companies = ref([])
const category = ref('')
const categories = ['CPU', 'GPU', 'CPU/GPU', '存储', 'OEM', 'ODM', '散热', '电源']

async function reload() {
  companies.value = await fetchCompanies({ category: category.value })
}

onMounted(reload)
</script>

<style scoped lang="scss">
.filter { margin-bottom: 16px; }

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.card {
  background: #fff;
  border: 1px solid var(--c-border);
  border-radius: var(--radius);
  padding: 16px;
  transition: box-shadow 0.2s, transform 0.2s;

  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-1px);
  }
}

.card-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.logo {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--c-primary), var(--c-accent));
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 700;
}

.name { font-weight: 600; }

.tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
</style>
