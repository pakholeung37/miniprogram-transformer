import { ComponentOptions } from "vue"

type VueCompOptions = ComponentOptions<Vue>
type WxCompOptions = WechatMiniprogram.Component.Options<{}, {}, {}>
/**
 * wxComponent to vueComponent runtime Adapter
 *
 */
interface OptionsApater {
  (key: string, vueTarget: VueCompOptions, wxTarget: WxCompOptions)
}

const keyMap = {
  behaviors: "mixins",
}
function simpleMapping() {
  return (keyOfWx, vueTarget, wxTarget) => {
    const keyOfVue = keyMap[keyOfWx]
    vueTarget[keyOfVue] = wxTarget[keyOfWx]
  }
}

const lifetimesMap: Record<string, string> = {
  created: "created",
  attched: "beforeMount",
  ready: "mounted",
  moved: "updated",
  detached: "beforeDestroy",
  error: "error",
}

const optionsAdapters: { [key: string]: OptionsApater } = {
  data: (_, vueTarget, wxTarget) => {
    const data = wxTarget.data
    vueTarget.data = function () {
      return data
    }
  },
  properties: (_, vueTarget, wxTarget) => {
    const properties = wxTarget.properties
    vueTarget.props = {}
    for (const key in properties) {
      if (
        [
          String,
          Number,
          Boolean,
          Array,
          Object,
          Date,
          Function,
          Symbol,
        ].indexOf(properties[key]) !== -1
      ) {
        vueTarget.props[key] = properties[key]
      } else {
        vueTarget.props[key] = {}
        vueTarget.props[key] = {
          type: properties[key].type,
          default: properties[key].value,
        }
        if ("observer" in properties[key]) {
          vueTarget.watch = {
            ...vueTarget.watch,
            [key]: properties[key].observer,
          }
        }
      }
    }
  },
  behaviors: simpleMapping(),
  lifetimes: (_, vueTarget, wxTarget) => {
    const lifetimes = wxTarget.lifetimes
    for (const state in lifetimes) {
      vueTarget[lifetimesMap[state]] = lifetimes[state]
    }
  },
  __default: (key, vueTarget, wxTarget) => {
    vueTarget[key] = wxTarget[key]
  },
}
const adapter = (wxComponent: WxCompOptions): VueCompOptions => {
  const result: VueCompOptions = {}
  for (const key in wxComponent) {
    if (key in optionsAdapters) {
      optionsAdapters[key](key, result, wxComponent)
    } else {
      console.log(`key: ${key}没有指定的转换器, 将使用默认转换器`)
      optionsAdapters.__default(key, result, wxComponent)
    }
  }
  return result
}

export default adapter
