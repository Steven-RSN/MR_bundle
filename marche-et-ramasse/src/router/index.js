import { createRouter, createWebHistory } from 'vue-router'


//init router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Accueil',
      component: () => import('../views/Accueil.vue')
    },

    // route pour chaque déchet (serveur):
    {
      path: '/ficheDechet/:id',
      name: 'FicheDechet',
      component: () => import('../views/ficheDechet.vue'),
      props: true
    },

    // route pour la fiche d'un déchet local (IndexedDB, avant synchronisation):
    {
      path: '/fiche-locale/:id',
      name: 'FicheDechetLocale',
      component: () => import('../views/ficheDechetLocale.vue'),
      props: true
    },
    {
      path: '/formulaire',
      name: 'Formulaire',
      component: () => import('../views/Formulaire.vue')
    },
    {
      path: '/historique',
      component: () => import('../views/Historique.vue')
    },
    {
      path: '/inscription',
      component: () => import('../views/Inscription.vue')
    },
    {
      path: '/connexion',
      component: () => import('../views/Connexion.vue')
    },
    {
      path: '/profil',
      component: () => import('../views/profil.vue')
    },
    {
      path: '/cgu',
      component: () => import('../views/cgu.vue')
    },
    {
      path: '/local-dechets',
      component:()=>import('../views/LocalDechets.vue'),
      meta: { requiresAuth: true } 
    },
  ]
})

export default router