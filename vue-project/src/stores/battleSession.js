import {defineStore} from 'pinia'
import {ref} from "vue";
import {createExpiringSerializer, SIX_HOURS_MS} from "@/stores/plugins/persistExpiry.js";

// Session-scoped match data: expires 6h after the last interaction (rolling
// TTL), so an active battle never gets wiped mid-game while an abandoned
// one is cleaned up once it's clearly over.
export const useBattleSessionStore = defineStore('battleSession', () => {
        const myScore = ref(0)
        const opponentScore = ref(0)

        /**
         * Reset state
         */
        function $reset() {
            myScore.value = 0;
            opponentScore.value = 0;
        }

        return {
            myScore,
            opponentScore,
            $reset
        }
    },
    {
        persist: {
            serializer: createExpiringSerializer(SIX_HOURS_MS)
        }
    })
