<script setup lang="ts">
import dayjs from 'dayjs'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import VirtualScroll from '../EqualHeightVscroll.vue'
import CusPopover from './Popover.vue'
interface Cols {
  prop: string
  label: string
  [key: string]: any
}
const props = defineProps<{
  index?: boolean
  selection?: boolean
  tableData: any[]
  cols: Cols[]
}>()
const emits = defineEmits(['select', 'selectAll'])
const tableList = ref<any[]>([])
const hmiTableRef = ref(null)
const tableHeight = ref(0)
const select = (event: Event, row: any, index: number) => {
  emits('select', tableList.value.filter(e => e.checked))
}
const selectAll = (event: Event) => {
  tableList.value = tableList.value.map(e => ({ ...e, checked: (event.target as HTMLInputElement).checked }))
  emits('selectAll', (event.target as HTMLInputElement).checked ? props.tableData : [])
}
const formatter = (row: any, col: any) => {
  if (col.propFormat) {
    const t = col.propFormat.slice(col.propFormat.indexOf(':') + 1)
    if (col.propFormat.startsWith('date'))
      return row[col.prop] ? dayjs(row[col.prop]).format(t || 'YYYY-MM-DD hh:mm:ss') : ''

    if (col.propFormat.startsWith('fixed'))
      return Object.prototype.toString.call(row[col.prop]) === '[object Number]' ? row[col.prop].toFixed(t || 1) : Number(row[col.prop])?.toFixed(t || 1)
  }
  else {
    return row[col.prop]
  }
}
const cellRender = (row: any, col: any, index: number) => {
  return col.render(row, col, index)
}
const rowStyle = computed(() => {
  let is = ''
  let ss = ''
  if (props.index)
    is = '70px'

  if (props.selection)
    ss = '70px'
  return {
    gridTemplateColumns: `${ss} ${is} repeat(auto-fit, minmax(50px, 1fr))`,
  }
})
watch(() => props.tableData, (n) => {
  tableList.value = n
  /* for design rerender reset selections */
  emits('select', [])
  /* for design rerender reset selections */
}, { immediate: true })
onMounted(async () => {
  await nextTick()
  const { height } = getComputedStyle(hmiTableRef.value!)
  tableHeight.value = parseInt(height) ?? 0
})
</script>

<script lang="ts">
export default {
  name: 'HmiTable',
}
</script>

<template>
  <div ref="hmiTableRef" class="hmi-table">
    <div class="hmi-table_header" :style="rowStyle">
      <div v-if="selection" class="hmi-table_header_th selection">
        <label class="label--checkbox">
          <input type="checkbox" class="checkbox" @change="selectAll($event)">
        </label>
      </div>
      <div v-if="index" class="hmi-table_header_th index">
        序号
      </div>
      <div v-for="item of cols" :key="item.prop" class="hmi-table_header_th">
        {{ item.label }}
      </div>
    </div>
    <VirtualScroll v-if="tableHeight > 0" class="hmi-table_body virtual-scroll" :item-height="55" :items="tableList" :height="tableHeight" width="100%">
      <template #default="{ index: i, item }">
        <div class="hmi-table_body_row" :style="rowStyle">
          <div v-if="selection" class="hmi-table_body_row_cell selection">
            <label class="label--checkbox">
              <input v-model="item.checked" type="checkbox" class="checkbox" @change="select($event, item, i)">
            </label>
          </div>
          <div v-if="index" class="hmi-table_body_row_cell index">
            {{ i + 1 }}
          </div>
          <div v-for="col of cols" :key="col.prop" class="hmi-table_body_row_cell">
            <template v-if="col.render">
              <component :is="cellRender(item, col, i)" />
            </template>
            <CusPopover
              v-else
              style="width: 100%; text-align: center;"
              trigger="click"
              position="top"
            >
              <template #content>
                {{ formatter(item, col) }}
              </template>
              <template #default>
                <div class="tf" v-text="formatter(item, col)" />
              </template>
            </CusPopover>
          </div>
        </div>
      </template>
    </VirtualScroll>
  </div>
</template>

<style lang="scss" scoped>
.hmi-table {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;

  &_header {
    width: calc(100% - 8px);
    height: 55px;
    line-height: 55px;
    display: grid;
    grid-template-rows: 55px;
    border: 1px solid #ebeef5;
    background: #2c3556;
    padding-right: 8px;

    &_th {
      color: #fff;
      text-align: center;
      border-right: 1px solid #fff;

      &:last-child {
        border-right: none;
      }
    }

    .selection,
    .index {
      width: 70px;
    }
  }

  &_body {
    border: 1px solid #ebeef5;
    border-top: none;

    &_row {
      display: grid;
      grid-template-rows: 55px;
      border-bottom: 1px solid #ebeef5;

      &_cell {
        display: flex;
        justify-content: center;
        align-items: center;
        border-right: 1px solid #ebeef5;
      }

      .tf {
        position: relative;
        overflow: hidden;
        text-overflow: ellipsis; //文本溢出显示省略号
        white-space: nowrap; //文本不会换行
      }

      .selection,
      .index {
        width: 70px;
      }
    }
  }
  $baseFontSize: 16;

  $green: #009688;

  @function rem($val) {
    @return #{$val / $baseFontSize}rem;
  }

  .label--checkbox {
    position: relative;
    // margin: .5rem;

    // line-height: 135%;

    cursor: pointer;
  }

  .checkbox {
    position: relative;
    top: rem(-6);

    // margin: 0 1rem 0 0 ;

    cursor: pointer;

    &:before {
      transition: all 0.3s ease-in-out;
      content: "";
      position: absolute;
      left: 0;
      z-index: 1;
      width: 15px;
      height: 15px;
      border: 2px solid #2c3556;
    }

    &:checked {
      &:before {
        transform: rotate(-45deg);
        height: 0.5rem;
        border-color: $green;
        border-top-style: none;
        border-right-style: none;
      }
    }

    &:after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 17px;
      height: 17px;
      background: #fff;
      cursor: pointer;
    }
  }
}
</style>
