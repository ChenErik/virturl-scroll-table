import type { Slots } from 'vue'

export function isFunction(val: unknown): val is Function {
  return typeof val === 'function'
}
/**
 * @description:  Get slot to prevent empty error
 */
export function getSlot(slots: Slots, slot = 'default', data?: any) {
  if (!slots || !Reflect.has(slots, slot))
    return null

  if (!isFunction(slots[slot])) {
    console.error(`${slot} is not a function!`)
    return null
  }
  const slotFn = slots[slot]
  if (!slotFn)
    return null
  return slotFn(data)
}

export const getScrollBarWidth = () => {
  const outer = document.createElement('div')
  outer.style.overflow = 'scroll'
  outer.style.height = '200px'
  outer.style.width = '100px'
  document.body.appendChild(outer)
  const widthNoScroll = outer.offsetWidth

  const inner = document.createElement('div')
  inner.style.width = '100%'
  outer.appendChild(inner)

  const widthWithScroll = inner.offsetWidth

  const scrollBarWidth = widthNoScroll - widthWithScroll
  outer.remove()
  return scrollBarWidth
}
