import {defineStore} from 'pinia'
import {computed, ref} from "vue";

// Tracks only the user's operation filter selection (which Crit/Tac Op ids
// are being filtered by). Catalog data lives separately in critTacOps.js —
// this store intentionally excludes it to keep a single responsibility.
export const useFilterOperationStore = defineStore('filterOperations', () => {
        const filteredCritOps = ref([])
        const filteredTacOps = ref([])

        const getFilteredCritOps = computed(() => filteredCritOps.value)
        const getFilteredTacOps = computed(() => filteredTacOps.value)

        const isFilteringCrit = computed(() => filteredCritOps.value.length > 0)
        const isFilteringTac = computed(() => filteredTacOps.value.length > 0)

        const isCritOperationPresent = computed(() => {
            return (opId) => filteredCritOps.value.includes(opId)
        })
        const isTacOperationPresent = computed(() => {
            return (opId) => filteredTacOps.value.includes(opId)
        })

        function addCritOperationFilter(opId) {
            !filteredCritOps.value.includes(opId)
                ? filteredCritOps.value.push(opId)
                : console.log("Operation already exists");
        }

        function removeCritOperationFilter(opId) {
            let index = filteredCritOps.value.indexOf(opId);
            if (index !== -1) {
                filteredCritOps.value.splice(index, 1);
            } else {
                console.log("Operation not exists");
            }
        }

        function addTacOperationFilter(opId) {
            !filteredTacOps.value.includes(opId)
                ? filteredTacOps.value.push(opId)
                : console.log("Operation already exists");
        }

        function removeTacOperationFilter(opId) {
            let index = filteredTacOps.value.indexOf(opId);
            if (index !== -1) {
                filteredTacOps.value.splice(index, 1);
            } else {
                console.log("Operation not exists");
            }
        }

        /**
         * Reset state
         */
        function $reset() {
            filteredCritOps.value = [];
            filteredTacOps.value = [];
        }

        return {
            filteredCritOps,
            filteredTacOps,
            getFilteredCritOps,
            getFilteredTacOps,
            isFilteringCrit,
            isFilteringTac,
            isCritOperationPresent,
            isTacOperationPresent,
            addCritOperationFilter,
            removeCritOperationFilter,
            addTacOperationFilter,
            removeTacOperationFilter,
            $reset
        }
    },
    {
        persist: true
    })
