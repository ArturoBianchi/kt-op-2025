import {createRouter, createWebHashHistory} from 'vue-router'
import Rules from '../views/Rules.vue'
import BattleBoard from '../views/BattleBoard.vue'
import CritTacOps from '../views/CritTacOps.vue'

const router = createRouter({
    history: createWebHashHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: Rules,
            meta: {
                title: 'SEQUENZA DI GIOCO',
            },
        },
        {
            path: '/battle',
            name: 'battle',
            component: BattleBoard,
            meta: {
                title: '',
            },
        },
        {
            path: '/ops',
            name: 'ops',
            component: CritTacOps,
            meta: {
                title: 'CRIT & TAC OPS',
            },
        },
        // Anteprima dei componenti durante lo sviluppo: esclusa dalla build di produzione
        ...(import.meta.env.DEV
            ? [{path: '/sandbox', name: 'sandbox', component: () => import('../views/Sandbox.vue')}]
            : []),
    ],
})

export default router
