import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from 'vue-router'

const LoginView = () => import('../views/auth/LoginView.vue')
const DashboardView = () => import('../views/dashboard/dashboardView.vue')
const NotFoundView = () => import('../views/errors/NotFoundView.vue')

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/login',
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
  const token = localStorage.getItem('access_token')
  const isAuthenticated = Boolean(token)
  const requiresAuth = to.meta.requiresAuth === true
  const isPublic = to.meta.public === true

  if (requiresAuth && !isAuthenticated) {
    next({ name: 'login' })
    return
  }

  if (to.name === 'login' && isAuthenticated) {
    next({ name: 'dashboard' })
    return
  }

  if (isPublic || isAuthenticated) {
    next()
    return
  }

  next({ name: 'login' })
})

export default router