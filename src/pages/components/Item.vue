<script lang="ts" setup>
// import { ref } from 'vue'
interface Item {
  id?: number
  value?: string
}
interface Props {
  item: Item
}
const props = withDefaults(defineProps<Props>(), {
  item: () => ({}),
})
</script>

<template>
  <p>
    <span color-red>{{ props.item.id }}</span>
    {{ props.item.value }}
  </p>
</template>
