import type { MaybeRef, ShallowRef } from 'vue'
import type { ConfigurableDocument } from '../_configurable'
import { tryOnMounted, tryOnScopeDispose } from '@vueuse/shared'
import { readonly, shallowRef, watch } from 'vue'
import { defaultDocument } from '../_configurable'

export interface UseStyleTagOptions extends ConfigurableDocument {
  /**
   * Media query for styles to apply
   */
  media?: string

  /**
   * Load the style immediately
   *
   * @default true
   */
  immediate?: boolean

  /**
   * Manual controls the timing of loading and unloading
   *
   * @default false
   */
  manual?: boolean

  /**
   * DOM id of the style tag
   *
   * @default auto-incremented
   */
  id?: string

  /**
   * Nonce value for CSP (Content Security Policy)
   *
   * @default undefined
   */
  nonce?: string
}

export interface UseStyleTagReturn {
  id: string
  css: ShallowRef<string>
  load: () => void
  unload: () => void
  isLoaded: Readonly<ShallowRef<boolean>>
}

let _id = 0

/**
 * Inject <style> element in head.
 *
 * Overload: Omitted id
 *
 * @see https://vueuse.org/useStyleTag
 * @param css
 * @param options
 */
export function useStyleTag(
  css: MaybeRef<string>,
  options: UseStyleTagOptions = {},
): UseStyleTagReturn {
  const isLoaded = shallowRef(false)

  const {
    document = defaultDocument,
    immediate = true,
    manual = false,
    id = `vueuse_styletag_${++_id}`,
  } = options

  const cssRef = shallowRef(css)

  let stop = () => { }
  const load = () => {
    if (!document)
      return

    const el = (document.getElementById(id) || document.createElement('style')) as HTMLStyleElement

    if (!el.isConnected) {
      el.id = id
      if (options.nonce)
        el.nonce = options.nonce
      if (options.media)
        el.media = options.media
      document.head.appendChild(el)
    }

    if (isLoaded.value)
      return

    stop = watch(
      cssRef,
      (value) => {
        el.textContent = value
      },
      { immediate: true },
    )

    isLoaded.value = true
  }

  const unload = () => {
    if (!document || !isLoaded.value)
      return
    stop()
    document.head.removeChild(document.getElementById(id) as HTMLStyleElement)
    isLoaded.value = false
  }

  if (immediate && !manual)
    tryOnMounted(load)

  if (!manual)
    tryOnScopeDispose(unload)

  return {
    id,
    css: cssRef,
    unload,
    load,
    isLoaded: readonly(isLoaded),
  }
}
