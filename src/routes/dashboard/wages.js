export const wages =
  {
    path: '/dashboard/wages',
    name: 'dashboard_wages',
    component: require('@/views/dashboard/wages/Wages.vue').default,
    meta: {
      permission: 'manage_wages',
      breadcrumbs: [
        {
          name: 'Dashboard',
          link: 'dashboard'
        },
        {
          name: 'Wages',
          link: 'dashboard_wages'
        }
      ]
    }
  }


export const team_wages = {
  path: '/dashboard/wages/:id',
  name: 'dashboard_wages_team',
  component: require('@/views/dashboard/wages/TeamWages.vue').default,
  meta: {
    permission: 'manage_wages',
    breadcrumbs: [
      {
        name: 'Dashboard',
        link: 'dashboard'
      },
      {
        name: 'Wages',
        link: 'dashboard_wages'
      },
      {
        name: 'Team Wage',
        link: ''
      }
    ]
  }
}
