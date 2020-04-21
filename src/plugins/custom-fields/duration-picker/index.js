// plugin.js
import Component from './Duration-Picker'

// This exports the plugin object.
export default {
  // The install method will be called with the Vue constructor as
  // the first argument, along with possible options
  install(Vue, options) {
    // Add or modify global methods or properties.

    // Add a component or directive to your plugin, so it will be installed globally to your project.
    Vue.component('duration-picker', Component)
    // Add `Vue.mixin()` to inject options to all components.
    Vue.mixin({
      // Add component lifecycle hooks or properties.
      created() {
      }
    })

  }
}
