<script setup lang="ts">
import { nextTick, onMounted, reactive, ref, watch } from 'vue'
interface Props {
  dataList: any[]
  nodeNum: number
}
const props = withDefaults(defineProps<Props>(), {
  dataList: () => [],
  nodeNum: 20,
})
let defaultIndex = 1
const currentArr = ref(props.dataList.slice(0, 2 * props.nodeNum))

function throttle(fn: (...arg: any[]) => void, wait: number) {
  let timeout: number
  return function (this: any, ...rest: any[]) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const ctx = this
    const args = rest
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      fn.apply(ctx, args)
    }, wait)
  }
}
interface Config {
  isRequesting: boolean
  paddingTopArr: number[] // paddingTop数据栈
  paddingBottomArr: number[] // paddingBottom数据栈
  preScrollTop: number
  syncStart: number
  setting: boolean
}
const start = ref(0)
const end = ref(props.nodeNum)
const paddingTop = ref(0)
const paddingBottom = ref(0)
const observer = ref<ResizeObserver | null>(null)
/* 123213 */
const $bottomElement = ref()
const $topElement = ref()
const $upAnchor = ref<any>()
const $downAnchor = ref<any>()
const $wrap = ref<any>()
const $tableContainer = ref<HTMLDivElement>()
const config = ref<Config>({
  isRequesting: false,
  paddingTopArr: [], // paddingTop数据栈
  paddingBottomArr: [], // paddingBottom数据栈
  preScrollTop: 0,
  syncStart: 0,
  setting: false,
})
const getReference = (index: number) => {
  switch (index) {
    case 0:
      return $topElement
    case 5:
      return $upAnchor
    case 10:
      return $downAnchor
    case (props.nodeNum - 1):
      return $bottomElement
    default:
      return 'other'
  }
}
const resetObservation = async () => {
  if ($bottomElement.value)
    observer.value && observer.value.unobserve($bottomElement.value[0])

  if ($topElement.value)
    observer.value && observer.value.unobserve($topElement.value[0])
}
const updateState = (newStart: number, newEnd: number, isDown: boolean) => {
  if (config.value.setting)
    return
  config.value.syncStart = newStart
  if (start.value !== newStart || end.value !== newEnd) {
    config.value.setting = true
    start.value = newStart
    end.value = newEnd
    const page = (newStart / 10) - 1
    if (isDown) { // 向下
      newStart !== 0 && !config.value.paddingTopArr[page] && (config.value.paddingTopArr[page] = $downAnchor.value[0].offsetTop)
      paddingTop.value = config.value.paddingTopArr[page]
      paddingBottom.value = config.value.paddingBottomArr[page] || 0
    }
    else { // 向上
      const newPaddingBottom = $wrap.value.scrollHeight - $downAnchor.value[0].offsetTop
      newStart !== 0 && (config.value.paddingBottomArr[page] = newPaddingBottom)
      paddingTop.value = config.value.paddingTopArr[page] || 0
      paddingBottom.value = config.value.paddingBottomArr[page]
    }
    config.value.setting = false
    // setTimeout(() => {  }, 0)
  }
}
const callback = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
  entries.forEach((entry, index: number) => {
    const listLength = currentArr.value.length
    // 向下滚动
    if (entry.isIntersecting && entry.target.id === 'bottom') {
      const maxStartIndex = listLength - 1 - props.nodeNum
      const maxEndIndex = listLength - 1
      const newStart = (end.value - (props.nodeNum / 2)) <= maxStartIndex ? end.value - (props.nodeNum / 2) : maxStartIndex
      const newEnd = (end.value + (props.nodeNum / 2)) <= maxEndIndex ? end.value + (props.nodeNum / 2) : maxEndIndex
      if (newEnd + (props.nodeNum / 2) >= maxEndIndex && !config.value.isRequesting) {
        currentArr.value.push(...props.dataList.slice(defaultIndex * 40, (defaultIndex + 1) * 40))
        defaultIndex++
      }
      if (end.value + (props.nodeNum / 2) > maxEndIndex)
        return
      updateState(newStart, newEnd, true)
    }
    // 向上滚动
    if (entry.isIntersecting && entry.target.id === 'top') {
      const newEnd = end.value === props.nodeNum ? props.nodeNum : (end.value - (props.nodeNum / 2) > props.nodeNum ? end.value - (props.nodeNum / 2) : props.nodeNum)
      const newStart = start.value === 0 ? 0 : (start.value - (props.nodeNum / 2) > 0 ? start.value - (props.nodeNum / 2) : 0)
      updateState(newStart, newEnd, false)
    }
  })
}
const intiateScrollObserver = async () => {
  const options = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1,
  }
  const Observer = new IntersectionObserver(callback, options)

  await nextTick()
  if ($topElement.value)
    Observer.observe($topElement.value[0])

  if ($bottomElement.value && $bottomElement.value[0].getBoundingClientRect().top > document.body.clientHeight)
    Observer.observe($bottomElement.value[0])

  observer.value = Observer
}
const scrollEventListner = throttle((event) => {
  const scrollTop = $tableContainer.value!.scrollTop
  let index = config.value.paddingTopArr.findIndex(e => e > scrollTop)
  index = index <= 0 ? 0 : index
  const len = config.value.paddingTopArr.length
  len && (config.value.paddingTopArr[len - 1] < scrollTop) && (index = len)
  const newStart = index * 10
  const newEnd = index * 10 + props.nodeNum
  if (newStart === config.value.syncStart) {
    config.value.preScrollTop = scrollTop
    return
  }
  updateState(newStart, newEnd, scrollTop > config.value.preScrollTop)// true为往下滚动 false为往上滚动
  config.value.preScrollTop = scrollTop
}, 200)
const containerHeight = ref(0)
onMounted(() => {
  const { height } = getComputedStyle($tableContainer.value!)
  containerHeight.value = parseInt(height) - 60
  $tableContainer.value?.addEventListener('scroll', scrollEventListner)
  resetObservation()
  intiateScrollObserver()
})

watch([end, currentArr], () => {
  resetObservation()
  intiateScrollObserver()
})
/* 测试数据 */
const cols = reactive([
  { prop: 'logTypeName', label: '日志类型' },
  { prop: 'logContent', label: '日志内容' },
  { prop: 'creatorName', label: '创建人' },
  { prop: 'createTime', label: '创建时间' },
])
</script>

<template>
  <div class="hmi-table">
    <div class="hmi-table_header">
      <div v-for="item of cols" :key="item.prop" class="hmi-table_header_item">
        {{ item.label }}
      </div>
    </div>
    <div ref="$tableContainer" class="hmi-table_container" :style="{ height: containerHeight === 0 ? '100%' : `${containerHeight}px` }">
      <div
        v-if="containerHeight > 0"
        ref="$wrap"
        :style="{ paddingTop: `${paddingTop}px`, paddingBottom: `${paddingBottom}px`, position: 'relative' }"
      >
        <div
          v-for="(item, index) in currentArr.slice(start, end)"
          :id="index === 0 ? 'top' : (index === (nodeNum - 1) ? 'bottom' : '')" :key="item" :ref="getReference(index)"
        >
          <slot :row="item" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hmi-table{
  /* width: 100%; */
  height:100%;
  display: flex;
  flex-direction: column;
  border: 1px solid;
}
.hmi-table_header{
  width: 100%;
  height: 30px;
  line-height: 30px;
  display: grid;
  grid-template-columns: repeat(auto-fit,minmax(50px,1fr));
  grid-template-rows: 30px;
  border: 1px solid #ebeef5;
  background: #2c3556;
  color: #fff;
}
.hmi-table_header_item{
  text-align: center;
}
.hmi-table_container {
  width: 100%;
  flex-shrink: 0;
  flex-grow: 1;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
}
</style>
