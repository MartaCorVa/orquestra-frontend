import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from 'vue-router'

import {
  getAccessToken,
  getMustChangeCredentials,
  getRole,
} from '../utils/storage'

const LoginView = () => import('../views/auth/LoginView.vue')
const ChangePasswordView = () => import('../views/auth/ChangePasswordView.vue')
const DashboardView = () => import('../views/dashboard/DashboardView.vue')
const EmployeeEditView = () => import('../views/employees/EmployeeEditView.vue')
const EmployeesListView = () => import('../views/employees/EmployeesListView.vue')
const EmployeeOnboardingView = () => import('../views/employees/EmployeeOnboardingView.vue')
const ShiftCreateView = () => import('../views/shifts/ShiftCreateView.vue')
const ShiftEditView = () => import('../views/shifts/ShiftEditView.vue')
const ShiftsListView = () => import('../views/shifts/ShiftsListView.vue')
const ScheduleCreateView = () => import('../views/schedules/ScheduleCreateView.vue')
const ScheduleDetailView = () => import('../views/schedules/ScheduleDetailView.vue')
const SchedulesListView = () => import('../views/schedules/SchedulesListView.vue')
const MetricsView = () => import('../views/metrics/EquityAnalysisView.vue')
const NotFoundView = () => import('../views/errors/NotFoundView.vue')
const UnauthorizedView = () => import('../views/errors/UnauthorizedView.vue')

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: {
      public: true,
      title: 'Login',
    },
  },
  {
    path: '/change-password',
    name: 'change-password',
    component: ChangePasswordView,
    meta: {
      requiresAuth: true,
      title: 'Change Password',
    },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: {
      requiresAuth: true,
      title: 'Dashboard',
    },
  },
  {
    path: '/employees',
    name: 'employees',
    component: EmployeesListView,
    meta: {
      requiresAuth: true,
      title: 'Employees',
      roles: ['admin'],
    },
  },
  {
    path: '/employees/new',
    name: 'employee-create',
    component: EmployeeOnboardingView,
    meta: {
      requiresAuth: true,
      title: 'Create Employee',
      roles: ['admin'],
    },
  },
  {
    path: '/employees/:id/edit',
    name: 'employee-edit',
    component: EmployeeEditView,
    meta: {
      requiresAuth: true,
      title: 'Edit Employee',
      roles: ['admin'],
    },
  },
  {
    path: '/shifts',
    name: 'shifts',
    component: ShiftsListView,
    meta: {
      requiresAuth: true,
      title: 'Shifts',
    },
  },
  {
    path: '/shifts/new',
    name: 'shift-create',
    component: ShiftCreateView,
    meta: {
      requiresAuth: true,
      title: 'Create Shift',
      roles: ['admin'],
    },
  },
  {
    path: '/shifts/:id/edit',
    name: 'shift-edit',
    component: ShiftEditView,
    meta: {
      requiresAuth: true,
      title: 'Edit Shift',
      roles: ['admin'],
    },
  },
  {
    path: '/schedules',
    name: 'schedules',
    component: SchedulesListView,
    meta: {
      requiresAuth: true,
      title: 'Schedules',
    },
  },
  {
    path: '/schedules/new',
    name: 'schedule-create',
    component: ScheduleCreateView,
    meta: {
      requiresAuth: true,
      title: 'Create Schedule',
      roles: ['admin'],
    },
  },
  {
    path: '/schedules/:id',
    name: 'schedule-detail',
    component: ScheduleDetailView,
    meta: {
      requiresAuth: true,
      title: 'Schedule Detail',
    },
  },
  {
    path: '/metrics',
    name: 'metrics',
    component: MetricsView,
    meta: {
      requiresAuth: true,
      title: 'Equity analysis',
      roles: ['admin'],
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView,
    meta: {
      public: true,
      title: 'Not Found',
    },
  },
  {
    path: '/unauthorized',
    name: 'unauthorized',
    component: UnauthorizedView,
    meta: {
      requiresAuth: true,
      title: 'Unauthorized',
    },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to) => {
  const token = getAccessToken()
  const mustChangeCredentials = getMustChangeCredentials()
  const role = getRole()

  const isAuthenticated = Boolean(token)
  const requiresAuth = to.meta.requiresAuth === true
  const isPublicRoute = to.meta.public === true
  const isLoginRoute = to.name === 'login'
  const isChangePasswordRoute = to.name === 'change-password'
  const allowedRoles = to.meta.roles as string[] | undefined

  if (!isAuthenticated && requiresAuth) {
    return { name: 'login' }
  }

  if (isAuthenticated && mustChangeCredentials && !isChangePasswordRoute) {
    return { name: 'change-password' }
  }

  if (isAuthenticated && isLoginRoute) {
    return mustChangeCredentials
      ? { name: 'change-password' }
      : { name: 'dashboard' }
  }

  if (isAuthenticated && !mustChangeCredentials && isChangePasswordRoute) {
    return { name: 'dashboard' }
  }

  if (
    isAuthenticated &&
    !mustChangeCredentials &&
    allowedRoles &&
    !allowedRoles.includes(role)
  ) {
    return { name: 'unauthorized' }
  }

  if (!isAuthenticated && !isPublicRoute && !requiresAuth) {
    return { name: 'login' }
  }

  return true
})

export default router