import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from 'vue-router'

import {
  getAccessToken,
  getMustChangePassword,
} from '../utils/storage'

const LoginView = () => import('../views/auth/LoginView.vue')
const ChangePasswordView = () => import('../views/auth/ChangePasswordView.vue')
const DashboardView = () => import('../views/dashboard/DashboardView.vue')
const EmployeesListView = () => import('../views/employees/EmployeesListView.vue')
const EmployeeOnboardingView = () => import('../views/employees/EmployeeOnboardingView.vue')
const ShiftsListView = () => import('../views/shifts/ShiftsListView.vue')
const SchedulesListView = () => import('../views/schedules/SchedulesListView.vue')
const MetricsView = () => import('../views/metrics/EquityAnalysisView.vue')
const NotFoundView = () => import('../views/errors/NotFoundView.vue')

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
    },
  },
  {
    path: '/employees/new',
    name: 'employee-create',
    component: EmployeeOnboardingView,
    meta: {
      requiresAuth: true,
      title: 'Create Employee',
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
    path: '/schedules',
    name: 'schedules',
    component: SchedulesListView,
    meta: {
      requiresAuth: true,
      title: 'Schedules',
    },
  },
  {
    path: '/metrics',
    name: 'metrics',
    component: MetricsView,
    meta: {
      requiresAuth: true,
      title: 'Equity analysis',
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
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const token = getAccessToken()
  const mustChangePassword = getMustChangePassword()
  const isAuthenticated = Boolean(token)
  const requiresAuth = to.meta.requiresAuth === true
  const isLoginRoute = to.name === 'login'
  const isChangePasswordRoute = to.name === 'change-password'

  if (!isAuthenticated && requiresAuth) {
    return { name: 'login' }
  }

  if (isAuthenticated && mustChangePassword && !isChangePasswordRoute) {
    return { name: 'change-password' }
  }

  if (isAuthenticated && isLoginRoute) {
    return mustChangePassword
      ? { name: 'change-password' }
      : { name: 'dashboard' }
  }

  if (isAuthenticated && !mustChangePassword && isChangePasswordRoute) {
    return { name: 'dashboard' }
  }

  return true
})

export default router