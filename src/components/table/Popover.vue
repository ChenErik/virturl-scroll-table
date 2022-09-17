<script lang="ts">
import { defineComponent, nextTick, onBeforeUnmount, onMounted, ref, unref } from 'vue'

export default defineComponent({
  name: 'HmiPopover',
  props: {
    position: {
      type: String,
      default: 'top',
      validator: (type: string) => ['top', 'bottom', 'left', 'right'].includes(type),
    },
    trigger: {
      type: String,
      default: 'click',
      validator: (type: string) => ['click', 'hover'].includes(type),
    },
  },
  setup(props) {
    const visible = ref(false)
    const popover = ref<HTMLDivElement>()
    const popoverWrapper = ref<HTMLDivElement>()
    const triggerWrapper = ref<HTMLDivElement>()

    const eventHandler = (e: Event) => {
      if (unref(popover) && (unref(popover) === e.target || unref(popover)?.contains(e.target as Node)))
        return

      if (unref(popoverWrapper) && (unref(popoverWrapper) === e.target || unref(popoverWrapper)?.contains(e.target as Node)))
        return

      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      close()
    }
    const close = () => {
      visible.value = false
      document.removeEventListener('click', eventHandler, true)
    }
    const positionContent = () => {
      document.body.appendChild(popoverWrapper.value!)
      const { width, height, top, left } = triggerWrapper.value!.getBoundingClientRect()
      const { height: height2 } = popoverWrapper.value!.getBoundingClientRect()
      const positions = {
        top: {
          top: top + window.pageYOffset,
          left: left + window.pageXOffset,
        },
        bottom: {
          top: top + height + window.pageYOffset,
          left: left + window.pageXOffset,
        },
        left: {
          top: top + (height - height2) / 2 + window.pageYOffset,
          left: left + window.pageXOffset,
        },
        right: {
          top: top + (height - height2) / 2 + window.pageYOffset,
          left: left + width + window.pageXOffset,
        },
      }
      popoverWrapper.value!.style.left = `${positions[props.position as keyof typeof positions].left}px`
      popoverWrapper.value!.style.top = `${positions[props.position as keyof typeof positions].top}px`
    }
    const onShow = async () => {
      visible.value = true
      await nextTick()
      positionContent()
      document.addEventListener('click', eventHandler, true)
    }
    const handleClick = (event: MouseEvent) => {
      if (unref(triggerWrapper)?.contains(event.target as Node)) {
        if (visible.value)
          close()

        else
          onShow()
      }
      else {
        close()
      }
    }
    onMounted(() => {
      if (props.trigger === 'click') {
        popover.value!.addEventListener('click', handleClick)
      }
      else {
        popover.value!.addEventListener('mouseenter', onShow)
        popover.value!.addEventListener('mouseleave', close)
      }
    })
    onBeforeUnmount(() => {
      if (props.trigger === 'click') {
        popover.value!.removeEventListener('click', handleClick)
      }
      else {
        popover.value!.removeEventListener('mouseenter', onShow)
        popover.value!.removeEventListener('mouseleave', close)
      }
      if (popoverWrapper.value)
        popoverWrapper.value?.remove()
    })
    return {
      popover,
      popoverWrapper,
      triggerWrapper,
      visible,
    }
  },
})
</script>

<template>
  <div
    ref="popover"
    class="acp-popover"
  >
    <div
      v-if="visible"
      ref="popoverWrapper"
      class="popover-wrapper"
      :class="{ [`position-${position}`]: true }"
    >
      <slot name="content" />
    </div>
    <span
      ref="triggerWrapper"
      class="trigger-wrapper"
      style="display: inline-block; width: 100%;"
    >
      <slot />
    </span>
  </div>
</template>

<style lang="scss" scoped>
.acp-popover {
  display: inline-block;
  position: relative;
}

.popover-wrapper {
  position: absolute;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
  z-index: 9999;
  padding: 12px;
  box-shadow: 0 0 3px rgba(0, 0, 0, 0.5);
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
  background: #fff;
  word-break: break-all;

  &:before,
  &:after {
    content: '';
    width: 0;
    height: 0;
    border: 10px solid transparent;
    position: absolute;
  }

  &.position-top {
    transform: translateY(-100%);
    margin-top: -10px;

    &:before,
    &:after {
      left: 10px;
    }

    &:before {
      border-top-color: #e4e7ed;
      top: 100%;
    }

    &:after {
      border-top-color: white;
      top: calc(100% - 1px);
    }
  }

  &.position-bottom {
    margin-top: 10px;

    &:before,
    &:after {
      left: 10px;
    }

    &:before {
      border-bottom-color: #e4e7ed;
      bottom: 100%;
    }

    &:after {
      border-bottom-color: white;
      bottom: calc(100% - 1px);
    }
  }

  &.position-left {
    transform: translateX(-100%);
    margin-left: -10px;

    &:before,
    &:after {
      top: 50%;
      transform: translateY(-50%);
    }

    &:before {
      border-left-color: #e4e7ed;
      left: 100%;
    }

    &:after {
      border-left-color: white;
      left: calc(100% - 1px);
    }
  }

  &.position-right {
    margin-left: 10px;

    &:before,
    &:after {
      top: 50%;
      transform: translateY(-50%);
    }

    &:before {
      border-right-color: #e4e7ed;
      right: 100%;
    }

    &:after {
      border-right-color: white;
      right: calc(100% - 1px);
    }
  }
}
</style>
