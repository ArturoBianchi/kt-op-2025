import {defineStore} from 'pinia'
import {computed, ref} from "vue";

// Tracks only the user's operation filter selection (which Crit/Tac Op ids
// are being filtered by). Catalog data lives separately in critTacOps.js —
// this store intentionally excludes it to keep a single responsibility.
export const useFilterOperationStore = defineStore('filterOperations', () => {
        const filteredOperations = ref([])

        const getFilteredOperations = computed(() => filteredOperations.value)
        const isFiltering = computed(() => filteredOperations.value.length > 0)
        const isOperationPresent = computed(() => {
            return (opId) => filteredOperations.value.includes(opId)
        })

        function addOperationFilter(opId) {
            !filteredOperations.value.includes(opId)
                ? filteredOperations.value.push(opId)
                : console.log("Operation already exists");
        }

        function removeOperationFilter(opId) {
            let index = filteredOperations.value.indexOf(opId);
            if (index !== -1) {
                filteredOperations.value.splice(index, 1);
            } else {
                console.log("Operation not exists");
            }
        }

        /**
         * Reset state
         */
        function $reset() {
            filteredOperations.value = [];
        }

        return {
            filteredOperations,
            getFilteredOperations,
            isOperationPresent,
            isFiltering,
            addOperationFilter,
            removeOperationFilter,
            $reset
        }
    },
    {
        persist: true
    })