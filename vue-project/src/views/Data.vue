<script setup>
import {ref} from "vue";
import FactionsData from "@/components/FactionsData.vue";
import {useDataViewStore} from "@/stores/dataViewStore.js";
import {storeToRefs} from "pinia";

const dataViewStore = useDataViewStore();

const {
    active
} = storeToRefs(dataViewStore);

const tabsUi = {
    list: 'w-full',
    trigger: 'grow font-mono uppercase text-xs tracking-wide',
    content: 'mt-4',
};
const tabs = ref([
    {
        label: 'Armi',
        icon: 'i-lucide-sword',
        slot: 'weapons'
    },
    {
        label: 'Fazioni',
        icon: 'i-lucide-users-round',
        slot: 'factions'
    }
])
</script>

<template>
    <div class="centered-view" style="height: 100%;">
        <UTabs v-model="active" :items="tabs" color="primary" variant="pill" size="sm" :ui="tabsUi" class="w-full">
            <template #weapons>
                <WeaponRules />
            </template>
            <template #factions>
                <FactionsData />
            </template>
        </UTabs>
    </div>
</template>
