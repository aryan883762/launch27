'use strict'

export const login = {
  path: '/login',
  name : 'login',
  meta: {
    auth: {
      roles: false, 
      redirect: {}
    }

  },
  component: require('@/views/auth/Login.vue').default
}

export const reset = {
  path: '/reset',
  name : 'reset',
  meta: {
    auth: false
  },
  component: require('@/views/auth/Reset.vue').default
}

export const reset_password = {
  path: '/reset-password',
  name: 'reset_password',
  meta: {
    auth: false
  },
  component: require('@/views/auth/ResetPassword.vue').default
}

export const signup = {
  path: '/signup',
  name : 'signup',
  meta: {
    auth: false
  },
  component: require('@/views/auth/Signup.vue').default
}

export const missing = {
  path: '*',
  name: 'error-404',
  component: require('@/views/auth/404.vue').default
}

export const forbidden = {
  path: '/403',
  name: 'error-403',
  component: require('@/views/auth/403.vue').default
}

export const critical = {
  path: '/500',
  name: 'error-500',
  component: require('@/views/auth/500.vue').default
}

export const plan_error = {
  path: '/plan-error',
  name: 'plan_error',
  component: require('@/views/auth/PlanError.vue').default
}
