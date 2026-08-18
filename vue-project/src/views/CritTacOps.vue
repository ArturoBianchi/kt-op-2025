<script setup>
import {computed, ref} from "vue";
import CritCard from '@/components/cards/CritCard.vue'
import TacCard from '@/components/cards/TacCard.vue'
import { useCritTacOpsStore } from '@/stores/critTacOps.js';
import {useFilterOperationStore} from "@/stores/filterOperations.js";
import KillCard from "@/components/cards/KillCard.vue";

const critTacOpsStore = useCritTacOpsStore();
const filterOpStore = useFilterOperationStore();
const critFilterItems = critTacOpsStore.getCritOpsFilterItems;
const tacFilterItems = critTacOpsStore.getTacOpsFilterItems;

function applyFilterSelection(newIds, currentIds, addFn, removeFn) {
    const previousIds = [...currentIds];
    newIds.filter(id => !previousIds.includes(id)).forEach(id => addFn(id));
    previousIds.filter(id => !newIds.includes(id)).forEach(id => removeFn(id));
}

const critOpsFilter = computed({
    get: () => filterOpStore.getFilteredCritOps,
    set: (newIds) => applyFilterSelection(
        newIds,
        filterOpStore.getFilteredCritOps,
        filterOpStore.addCritOperationFilter,
        filterOpStore.removeCritOperationFilter
    )
});

const tacOpsFilter = computed({
    get: () => filterOpStore.getFilteredTacOps,
    set: (newIds) => applyFilterSelection(
        newIds,
        filterOpStore.getFilteredTacOps,
        filterOpStore.addTacOperationFilter,
        filterOpStore.removeTacOperationFilter
    )
});

const activeFilterCount = computed(() => filterOpStore.getFilteredCritOps.length + filterOpStore.getFilteredTacOps.length);

const showFilterSection = ref(false);

const carouselItems = computed(() => {
        let items = [];
        let critOpsObj = critTacOpsStore.getCritOps;
        let tacOpsObj = critTacOpsStore.getTacOps;
        let killOpObj = critTacOpsStore.getKillOp;
        
        items.push(getKillCardCarouselItem(0, killOpObj));
        critOpsObj.forEach((el, index) => {
            if(!filterOpStore.isFilteringCrit || filterOpStore.isCritOperationPresent(el.id))
                items.push(getCritCardCarouselItem(index, el));
        });
        tacOpsObj.forEach((el, index) => {
            if(!filterOpStore.isFilteringTac || filterOpStore.isTacOperationPresent(el.id))
                items.push(getTacCardCarouselItem(index, el));
        });

        return items;
});

function getCritCardCarouselItem(id, model){
    return {
        id: `crit-${id}`,
        component: CritCard,
        props: {
            model: model,
        }
    }
}

function getTacCardCarouselItem(id, model){
    return {
        id: `tac-${id}`,
        component: TacCard,
        props: {
            model: model,
        }
    }
}

function getKillCardCarouselItem(id, model){
    return {
        id: `kill-${id}`,
        component: KillCard,
        props: {
            model: model,
        }
    }
}

</script>

<template>
    <div class="centered-view" style="height: 100%;">
<!--        <h1>CRIT & TAC OPS</h1>-->
        <div style="padding: 0.4rem">
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div class="col-span-1 form-button">
                    <UButton size="sm" icon="i-mdi-filter-outline" class="btn-dark font-bold rounded-full" @click="showFilterSection = !showFilterSection">Filtri ( {{ activeFilterCount }} )</UButton>
                    <UButton size="sm" style="margin-left: 1rem" icon="i-mdi-delete-outline" class="btn-dark font-bold rounded-full " @click="filterOpStore.$reset()"></UButton>
                </div>
            </div>
            <div v-show="showFilterSection" class="card-filters grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div class="col-span-1">
                    <UFormField orientation=""  size="sm" name="test" label="Crit Ops">
                        <USelect v-model="critOpsFilter" multiple :items="critFilterItems" placeholder="Filtra..." class="w-full" />
                    </UFormField>
                </div>
                <div class="col-span-1">
                    <UFormField orientation="" size="sm" name="test" label="Tac Ops">
                        <USelect v-model="tacOpsFilter" multiple :items="tacFilterItems" placeholder="Filtra..." class="w-full" />
                    </UFormField>
                </div>
            </div>
        </div>
        <KTCarousel carousel-id="crit-tac-ops" :carouselItems="carouselItems" :auto-height="false"/>
    </div>
</template>

<style scoped>
.form-button {
    align-content: flex-end;
    justify-self: left;
}
.card-filters {
    margin-top: 1rem;
}
</style>
