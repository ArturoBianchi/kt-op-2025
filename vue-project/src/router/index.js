import {createRouter, createWebHashHistory} from 'vue-router'

const router = createRouter({
    history: createWebHashHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: () => import('../views/Rules.vue'),
            meta: {
                title: 'SEQUENZA DI GIOCO',
            },
        },
        {
            path: '/data',
            name: 'data',
            component: () => import('../views/Data.vue'),
            meta: {
                title: 'DATI',
            },
        },
        {
            path: '/battle',
            name: 'battle',
            component: () => import('../views/BattleBoard.vue'),
            meta: {
                title: 'SESSIONE DI GIOCO',
            },
        },
        {
            path: '/ops',
            name: 'ops',
            component: () => import('../views/CritTacOps.vue'),
            meta: {
                title: 'KILL, CRIT & TAC OPS',
            },
        },
        // Anteprima dei componenti durante lo sviluppo: esclusa dalla build di produzione
        ...(import.meta.env.DEV
            ? [{path: '/sandbox', name: 'sandbox', component: () => import('../views/Sandbox.vue')}]
            : []),
    ],
})

export default router
