'use strict'

import Vue from 'vue'

import axios from 'axios'
import VueAxios from 'vue-axios'

import {root_app} from "../main";


Vue.use(VueAxios, axios)

/* Integrating Axios */

axios.defaults.baseURL = process.env.VUE_APP_API_HOST + '/api/'
// Add a request interceptor

let loadingInstance = null

axios.interceptors.request.use(function (config) {
  // Do something before request is sent
  // start loading service

  /*  loadingInstance = Loading.service({
      lock: true,
      text: 'Loading',
      spinner: 'el-icon-loading',
      background: 'rgba(255, 255, 255, 0.7)'
    }) */

  if (config.url === 'https://maps.googleapis.com/maps/api/geocode/json') {
    //if google don't process
    config.headers = []
    return config
  }

  // config.baseURL = 'http://' + window.location.hostname + ':3001/api'
  if (window.localStorage.getItem('active-company'))
    config.headers['x-company'] = window.localStorage.getItem('active-company')

  if (window.localStorage.getItem('masquerade-id'))
    config.headers['masquerade-id'] = window.localStorage.getItem('masquerade-id')

  //TODO: THIS IS A TEMPORAL WAY OF ADDING  companyId to all requests so long as its a post or put
  if ((config.method === 'post' || config.method === 'put') && root_app.$auth.user().company) {
    //only do this if there's a data object on config
    if (config.data){
        // if super admin then we don't change it
        if (!(Vue.prototype.$ability.can('manage', 'role_super_admin') && config.data.companyId)) {
            config.data.companyId = root_app.$auth.user().company.id
        }
    }
  }

  return config
}, function (error) {
  // Do something with request error
  // loadingInstance.close()
  return Promise.reject(error)
})

// Add a response interceptor
axios.interceptors.response.use(function (response) {
  // Do something with response data
//  loadingInstance.close()
  if (response.config.method === 'post' || response.config.method === 'put' || response.config.method === 'patch') {
    //root_app.$helpers.successHandle('Update successful', root_app)
  }
  return response
}, function (error) {
  // Do something with response error
  // loadingInstance.close()
  //root_app.$helpers.errorHandle(error, root_app)
  return Promise.reject(error)
})
