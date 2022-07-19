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
// const scrollbarWidth = ref<number>(0)
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
  return data.value.slice(vistualObj.start, vistualObj.end > data.value.length ? data.value.length : vistualObj.end)
})
const listHeight = computed<string>(() => {
  return `${data.value.length * vistualObj.itemHeight}px`
})
const onScroll = (e: Event) => {
  const tds = document.querySelectorAll<HTMLTableCellElement>('.table-body td')
  tds.forEach((k) => {
    k.classList.remove('td-select')
  })
  const scrollTop: number = (e.target as HTMLDivElement).scrollTop
  vistualObj.start = Math.floor(scrollTop / vistualObj.itemHeight)
  vistualObj.end = vistualObj.start + vistualObj.listCount
  vistualObj.offset = scrollTop - (scrollTop % vistualObj.itemHeight)
}
/* 计算选择范围 */
interface Rect {
  x: number
  y: number
  width: number
  height: number
}
const isOverlap = (rect1: Rect, rect2: Rect): boolean => {
  const startX1 = rect1.x
  const startY1 = rect1.y
  const endX1 = startX1 + rect1.width
  const endY1 = startY1 + rect1.height

  const startX2 = rect2.x
  const startY2 = rect2.y
  const endX2 = startX2 + rect2.width
  const endY2 = startY2 + rect2.height

  return !(endY2 <= startY1 || endY1 <= startY2 || startX1 >= endX2 || startX2 >= endX1)
}
interface SelectRange{
  startX: number
  endX: number
  startY: number
  endY: number
}
let selectRange: SelectRange = {
  startX: 0,
  endX: 0,
  startY: 0,
  endY: 0,
}
let selectDivModal: HTMLDivElement
let moveFlag = false
const onTableMousedown = (event: MouseEvent) => {
  selectRange.startX = event.clientX
  selectRange.startY = event.clientY - 25.5
  selectDivModal = document.createElement('div')
  moveFlag = true
}
const onTableMousemove = (event: MouseEvent) => {
  if (moveFlag) {
    const width = event.clientX - selectRange.startX
    const height = event.clientY - selectRange.startY - 25.5
    selectDivModal.style.position = 'absolute'
    selectDivModal.style.width = `${width}px`
    selectDivModal.style.height = `${height}px`
    selectDivModal.style.backgroundColor = 'rgba(236,245,255,0.5)'
    selectDivModal.style.border = '1px solid #b3d8ff'
    selectDivModal.style.left = `${selectRange.startX}px`
    selectDivModal.style.top = `${selectRange.startY + vistualObj.offset}px`
    selectDivModal.style.pointerEvents = 'none'
    tbodyScrollRefs.value?.appendChild(selectDivModal)
  }
}
const onTableMouseup = (event: MouseEvent) => {
  if (!selectRange.startX || !selectRange.startY)
    return

  selectRange.endX = event.clientX
  selectRange.endY = event.clientY - 25.5
  const width = selectRange.endX - selectRange.startX
  const height = selectRange.endY - selectRange.startY
  const tds = document.querySelectorAll<HTMLTableCellElement>('.table-body td')
  const cusRect = { x: selectRange.startX, y: selectRange.startY, width, height }
  tds.forEach((k) => {
    k.classList.remove('td-select')
  })
  tds.forEach((k: HTMLTableCellElement, idx: number) => {
    const tdRect = { x: k.offsetLeft, y: k.offsetTop, width: k.offsetWidth, height: k.offsetHeight }
    if (isOverlap(cusRect, tdRect))
      k.classList.add('td-select')
  })
  if (selectDivModal.style.position)
    tbodyScrollRefs.value?.removeChild(selectDivModal)
  selectRange = {
    startX: 0,
    endX: 0,
    startY: 0,
    endY: 0,
  }
  moveFlag = false
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
    <table border="3" border-color-red class="my-table" display-flex flex-col select-none>
      <div class="table-head" :style="{marginRight:scrollbarWidth + 'px'}">
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
        <tbody
          class="table-wrap"
          text-center :style="{ transform: getTransform }"
          @mousedown="onTableMousedown"
          @mouseup="onTableMouseup"
          @mousemove="onTableMousemove"
        >
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

<style>
.td-select{
  background-color: #409eff;
  color: #fff;
}
</style>
