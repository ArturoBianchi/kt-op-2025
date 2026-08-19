import {defineStore} from "pinia";
import {computed, ref} from "vue";

export const useDataViewStore = defineStore('dataViewStore', () => {
    const active = ref('weapons')
    const getActive = computed(() => active.value)

    function setActive(tab) {
        active.value = tab
    }

    return {
        active,
        getActive,
        setActive
    }
}, {persist: true}
)