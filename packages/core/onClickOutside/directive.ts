import type { ObjectDirective } from 'vue'
import type { OnClickOutsideHandler, OnClickOutsideOptions } from './index'
import { onClickOutside } from './index'

export const vOnClickOutside: ObjectDirective<
  HTMLElement,
  OnClickOutsideHandler | [(evt: any) => void, Omit<OnClickOutsideOptions, 'controls'>]
> = {
  mounted(el, binding) {
    const capture = !binding.modifiers.bubble
    if (typeof binding.value === 'function') {
      (el as any).__onClickOutside_stop = onClickOutside(el, binding.value, { capture })
    }
    else {
      const [handler, options] = binding.value
      ;(el as any).__onClickOutside_stop = onClickOutside(el, handler, Object.assign({ capture }, options))
    }
  },
  unmounted(el) {
    (el as any).__onClickOutside_stop()
  },
}

// alias
export { vOnClickOutside as VOnClickOutside }
