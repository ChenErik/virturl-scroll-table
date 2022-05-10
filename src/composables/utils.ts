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
