import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    loading: [],
    bookingFormEditor: {
      company: {},
      form: {},
      formValidation: {},
      services: [],
      frequencies: [],
      availableSlots: [],
      extrasSelection: {},
      pricing: {},
      categoryServices: [],
      pricingVariableSelection: {},
      hourlySelection: {},
    }
  },
  mutations: {

  },
  actions: {

  }
})
