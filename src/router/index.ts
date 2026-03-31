import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from 'vue-router'

import { getAccessToken } from '../utils/storage'

const LoginView = () => import('../views/auth/LoginView.vue')
const DashboardView = () => import('../views/dashboard/DashboardView.vue')
const UsersListView = () => import('../views/users/UsersListView.vue')
const EmployeesListView = () => import('../views/employees/EmployeesListView.vue')
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
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: {
      requiresAuth: true,
      title: 'Dashboard',
    },
  },
  {
    path: '/users',
    name: 'users',
    component: UsersListView,
    meta: {
      requiresAuth: true,
      title: 'Users',
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
      title: 'Metrics',
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

router.beforeEach((to, _from, next) => {
  const token = getAccessToken()
  const isAuthenticated = Boolean(token)
  const requiresAuth = to.meta.requiresAuth === true

  if (requiresAuth && !isAuthenticated) {
    next({ name: 'login' })
    return
  }

  if (to.name === 'login' && isAuthenticated) {
    next({ name: 'dashboard' })
    return
  }

  next()
})

export default router