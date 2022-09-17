<script lang="ts" setup>
import { h, reactive, ref, resolveComponent } from 'vue'
import UnequalHeightVscroll from './components/UnequalHeightVscroll.vue'
import VirtualTable from './components/table/VirtualTable.vue'
const arr1 = ref<number[]>([])
for (let i = 0; i < 1000; i++)
  arr1.value.push(i)
interface TableData {
  title: string
  logTypeName: string
  logContent: string
  creatorName: string
  createTime: string
}
const tableData: TableData[] = (() => {
  const arr = []
  for (let index = 1; index < 20000; index++) {
    arr.push({
      title: `列表项${index}`,
      logTypeName: `报警类型${index}`,
      logContent: `报警消息很多啊${index}`,
      creatorName: `创建人${index}`,
      createTime: new Date().toLocaleDateString(),
    })
  }
  return arr
})()
const cols = reactive([
  {
    prop: 'logTypeName',
    label: '日志类型',
    render: (row: TableData) => {
      return h('div', { style: { 'display': 'flex', 'align-items': 'center' } }, [
        h('div', {}, '🤣'),
        h('div', { style: 'color:red;' }, row.logTypeName),
      ])
    },
  },
  {
    prop: 'logContent',
    label: '日志内容',
    render: (row: TableData) => {
      return h('div', { class: 'hmi-tag' }, row.logContent)
    },
  },
  { prop: 'creatorName', label: '创建人' },
  { prop: 'createTime', label: '创建时间', propFormat: 'date:YYYY-MM-DD hh:mm:ss' },
])
</script>

<template>
  <div style="display: flex;flex-direction: column;height: 100%;gap: 20px;">
    <div style="height:500px;">
      <UnequalHeightVscroll :data-list="arr1" :node-num="40">
        <template #default="slotProps">
          <div :style="`height:${Math.random() * 500}px;border-bottom: 2px solid black;`">
            {{ slotProps.row }}
          </div>
        </template>
      </UnequalHeightVscroll>
    </div>
    <div style="height:500px">
      <VirtualTable :table-data="tableData" :cols="cols" :index="true" :selection="true" />
    </div>
  </div>
</template>

<style>
*{
  margin: 0;
  padding: 0;
}
#app{
  width: calc(100vw - 40px);
  height: calc(100vh - 40px);
  padding: 20px;
}
.hmi-tag{
  background: rgb(103, 194, 58);
  color: rgb(255, 255, 255);
  height: 20px;
  line-height: 20px;
  padding: 5px;
  border-radius: 5px;
}
</style>
