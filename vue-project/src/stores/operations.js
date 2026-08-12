import { defineStore } from 'pinia'
import {computed, ref} from "vue";

export const useOperationStore = defineStore('operations', () => {
    const operations = ref([])

    const getAllOperations = computed(() => operations.value)
    const isOperationPresent = computed(() => {
        return (opId) => operations.value.includes(opId)
    })

    function addOperation(opId) {
        !operations.value.includes(opId)
            ? operations.value.push(opId)
            : console.log("Operation already exists");
    }

    function removeOperation(opId) {
        let index = operations.value.indexOf(opId);
        if(index !== -1){
            operations.value.splice(index, 1);
        } else {
            console.log("Operation not exists");
        }
    }

    /**
     * Reset state
     */
    function $reset() {
        operations.value = [];
    }

    return {
        operations,
        getAllOperations,
        isOperationPresent,
        addOperation,
        removeOperation,
        $reset }
})