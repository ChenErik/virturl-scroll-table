<script setup lang="ts">
import { getScrollBarWidth } from '~/composables/utils'

interface Data {
  userName: string
  realName: string
  email: string
  id: number
  address: string
}
interface VirtaulObj {
  start: number
  end: number
  itemHeight: number
  listCount: number
  offset: number
}
const dd: Data[] = []
for (let i = 0; i < 2000; i++)
  dd.push({ id: i, userName: `userName${i}`, realName: `realName${i}`, email: `email${i}@${i}.com`, address: `江苏丹阳${Math.random() * 100}` })

const data = ref<Data[]>([])
const scrollbarWidth = ref<number>(getScrollBarWidth())
const tbodyScrollRefs = ref<HTMLTableElement|null>(null)
const vistualObj = reactive<VirtaulObj>({
  start: 0,
  end: 0,
  itemHeight: 27,
  listCount: 0,
  offset: 0,
})
const viewportHeight = ref(0)
const getTransform = computed<string>(() => {
  return `translate3d(0,${vistualObj.offset}px,0)`
})
const showList = computed<Data[]>(() => {
  return data.value.slice(vistualObj.start, vistualObj.end)
})
const listHeight = computed<string>(() => {
  return `${data.value.length * vistualObj.itemHeight}px`
})
const onScroll = (e: Event) => {
  const scrollTop: number = (e.target as HTMLInputElement).scrollTop
  vistualObj.start = Math.ceil(scrollTop / vistualObj.itemHeight)
  vistualObj.end = vistualObj.start + vistualObj.listCount
  if (scrollTop === (parseInt(listHeight.value) - viewportHeight.value))
    vistualObj.offset = scrollTop - (scrollTop % vistualObj.itemHeight) + 27
  else
    vistualObj.offset = scrollTop - (scrollTop % vistualObj.itemHeight)
}
onMounted(() => {
  data.value = dd
  const { height } = tbodyScrollRefs.value?.getBoundingClientRect() as DOMRect
  viewportHeight.value = height
  vistualObj.listCount = Math.ceil(height / vistualObj.itemHeight)
  vistualObj.end = Math.ceil(height / vistualObj.itemHeight)
})
</script>

<template>
  <div display-flex w-full h-full>
    <table border="3" border-color-red class="my-table" display-flex flex-col>
      <div class="table-head" :style="{marginRight:scrollbarWidth+'px'}">
        <thead class="table-wrap">
          <tr>
            <th>序号</th>
            <th>用户名</th>
            <th>真实姓名</th>
            <th>邮箱</th>
            <th>地址</th>
          </tr>
        </thead>
      </div>
      <div ref="tbodyScrollRefs" class="table-body" flex-grow overflow-auto position-relative @scroll="onScroll($event)">
        <div :style="{height: listHeight,position:'absolute',zIndex:-1,left:0,right:0,top:0}" />
        <tbody class="table-wrap" text-center :style="{ transform: getTransform }">
          <tr v-for="(item,index) in showList" :key="index" h-25px>
            <td>
              <div h-25px>
                {{ item.id }}
              </div>
            </td>
            <td>
              <div h-25px>
                {{ item.userName }}
              </div>
            </td>
            <td>
              <div h-25px>
                {{ item.realName }}
              </div>
            </td>
            <td>
              <div h-25px>
                {{ item.email }}
              </div>
            </td>
            <td>
              <div h-25px>
                {{ item.address }}
              </div>
            </td>
          </tr>
        </tbody>
      </div>
    </table>
  </div>
</template>
