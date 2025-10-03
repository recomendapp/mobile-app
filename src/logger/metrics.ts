export type MetricEvents = {
  // App events
  init: {
    initMs: number
  }
  'account:loggedIn': {
    logContext:
      | 'LoginForm'
    withPassword: boolean
  }
  'account:loggedOut': {
    logContext:
      | 'Settings'
      | 'Drawer'
  }
}
