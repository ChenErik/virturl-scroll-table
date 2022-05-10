<script lang="ts" setup>
// import { ref } from 'vue'
interface Props {
  listData?: any[]
  estimatedItemSize: number
  height?: string
}
const props = withDefaults(defineProps<Props>(), {
  listData: () => [],
  height: '100%',
})
const screenHeight = ref(0)
const start = ref(0)
const end = ref(0)

const initPositions = () => {
  screenHeight.value = window.innerHeight
}

const _listData = computed(() => {
  return props.listData.map((item, index) => {
    return {
      _index: `_${index}`,
      item,
    }
  })
})
const visibleCount = computed(() => {
  return Math.ceil(screenHeight.value / props.estimatedItemSize)
})
const visibleData = computed(() => {
  return _listData.value.slice(start.value, end.value)
})
</script>

<template>
  <div ref="virtualList" :style="{height:props.height}">
    123123
  </div>
</template>
