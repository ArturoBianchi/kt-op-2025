import {defineStore} from 'pinia'
import {reactive} from "vue";

// Durable UI preference (no TTL): remembers, per carousel instance, the id
// of the last-viewed item. An item id is used instead of a raw slide index
// because a future CritTacOps search/filter feature can shrink/reorder the
// underlying carouselItems list — a stable id still resolves correctly (or
// safely falls back) even after the list changes shape.
export const useCarouselStore = defineStore('carousels', () => {
        const positions = reactive({})

        function getPosition(carouselId) {
            return positions[carouselId]
        }

        function setPosition(carouselId, itemId) {
            if (itemId === undefined) return
            positions[carouselId] = itemId
        }

        /**
         * Reset state
         */
        function $reset() {
            Object.keys(positions).forEach(key => delete positions[key])
        }

        return {
            positions,
            getPosition,
            setPosition,
            $reset
        }
    },
    {
        persist: true
    })
