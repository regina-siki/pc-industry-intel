<template>
  <div>
    <!-- 公众号文章抓取入库入口 -->
    <WeChatIngest />

    <div class="panel">
      <div class="head">
        <h2 class="section-title" style="margin: 0">公众号追踪清单</h2>
        <span class="muted small">
          共 {{ list.length }} 个 · 在上面粘贴公众号文章链接可自动抓取入库
        </span>
      </div>

    <!-- 新增账号 -->
    <div class="add-row">
      <el-input
        v-model="form.name"
        placeholder="公众号名称"
        style="width: 180px"
      />
      <el-select
        v-model="form.category"
        placeholder="分类"
        style="width: 140px"
      >
        <el-option
          v-for="c in categoryOptions"
          :key="c"
          :label="c"
          :value="c"
        />
      </el-select>
      <el-input
        v-model="form.focus"
        placeholder="覆盖话题（关注的内容方向）"
        style="flex: 1; min-width: 220px"
      />
      <el-select v-model="form.priority" style="width: 110px">
        <el-option label="重点关注" value="high" />
        <el-option label="常规关注" value="mid" />
        <el-option label="备选" value="low" />
      </el-select>
      <el-button type="primary" @click="onAdd">添加</el-button>
    </div>

    <el-table :data="list" stripe>
      <el-table-column prop="name" label="公众号" width="180" />
      <el-table-column prop="category" label="分类" width="120" />
      <el-table-column prop="focus" label="覆盖话题" min-width="280" show-overflow-tooltip />
      <el-table-column label="标签" width="220">
        <template #default="{ row }">
          <el-tag
            v-for="t in row.tags"
            :key="t"
            size="small"
            style="margin-right: 4px"
          >{{ t }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="优先级" width="110">
        <template #default="{ row }">
          <el-tag :type="priorityType(row.priority)" size="small">
            {{ priorityLabel(row.priority) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="备注" min-width="180">
        <template #default="{ row }">
          <el-input
            v-model="row.note"
            size="small"
            placeholder="—"
            @blur="onNoteBlur(row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="90">
        <template #default="{ row }">
          <el-button text type="danger" size="small" @click="onDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  fetchWeChatAccounts,
  createWeChatAccount,
  updateWeChatAccount,
  deleteWeChatAccount,
} from '@/api'
import { useBus } from '@/stores/bus'
import WeChatIngest from '@/components/WeChatIngest.vue'

const bus = useBus()

const list = ref([])
const form = reactive({
  name: '',
  category: '半导体',
  focus: '',
  priority: 'mid',
})

const categoryOptions = [
  '半导体', '算力', '服务器/存储', '运营商', 'AI', '互联网/云',
  'PC/笔记本', 'AI PC', 'DIY', '显卡/主板', '显示器', '外设', '游戏/电竞',
  '券商研报', '大厂官方',
]

function priorityLabel(p) {
  return { high: '重点关注', mid: '常规关注', low: '备选' }[p] || p
}
function priorityType(p) {
  return { high: 'danger', mid: 'warning', low: 'info' }[p] || 'info'
}

async function reload() {
  list.value = await fetchWeChatAccounts()
}

async function onAdd() {
  if (!form.name.trim()) {
    ElMessage.warning('请填写公众号名称')
    return
  }
  try {
    await createWeChatAccount({ ...form, name: form.name.trim(), tags: [] })
    ElMessage.success('已添加')
    form.name = ''
    form.focus = ''
    await reload()
  } catch (e) {
    const msg = e?.response?.data?.error || e?.message || '添加失败'
    ElMessage.error(msg === 'duplicate name' ? '已存在同名公众号' : msg)
  }
}

async function onNoteBlur(row) {
  try {
    await updateWeChatAccount(row.name, { note: row.note })
  } catch {
    ElMessage.error('保存失败')
  }
}

async function onDelete(row) {
  try {
    await ElMessageBox.confirm(`确认删除「${row.name}」？`, '确认', {
      type: 'warning',
    })
    await deleteWeChatAccount(row.name)
    await reload()
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('删除失败')
  }
}

onMounted(reload)

// 公众号入库时会自动收录新公众号，追踪清单需刷新
watch(() => bus.ingestVersion, reload)
</script>

<style scoped lang="scss">
.head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 16px;
}

.small {
  font-size: 13px;
}

.add-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(47, 84, 235, 0.04);
  border-radius: 6px;
}
</style>
