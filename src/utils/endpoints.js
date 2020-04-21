'use strict'
const BASE_API_URL = process.env.VUE_APP_API_HOST + '/'

export default {
  BASE_API_URL: BASE_API_URL,
  PEOPLE: BASE_API_URL + 'people',
  USER: BASE_API_URL + 'accounts',
  USER_LOGIN: BASE_API_URL + 'accounts/login',
  USER_LOGOUT: BASE_API_URL + 'accounts/logout',
  COMPANIES: BASE_API_URL + 'companies',
  SERVICES: BASE_API_URL + 'services',
  IMG_UPLOAD: BASE_API_URL + 'imgs/local-img/upload',
  IMG_DOWNLOAD: BASE_API_URL + 'imgs/local-img/download',
  IMG_DELETE: BASE_API_URL + 'imgs/local-img/files/',
  OPENING_TIME: BASE_API_URL + 'opening-times',
  INVITATION: BASE_API_URL + 'invitations',
  ONBOARDING: BASE_API_URL + 'onboardings',
  LOCATIONS: BASE_API_URL + 'locations',
  ZIPCODES: BASE_API_URL + 'zipcodes',
  FREQUENCIES: BASE_API_URL + 'frequencies',
  SERVICE_CATEGORIES: BASE_API_URL + 'service-categories',
  CHECKLIST: BASE_API_URL + 'checklists',
  REMOVE_TASK_IMAGE: BASE_API_URL + 'checklists/remove-task-image',
  FULLSTEAMPAY: BASE_API_URL + 'FullSteamPay'
}
