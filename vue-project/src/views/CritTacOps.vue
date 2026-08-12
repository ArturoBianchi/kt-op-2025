<template>
    <div class="centered-view" style="height: 100%;">
        <h1>CRIT & TAC OPS</h1>
        <!-- La view è già in cache nel <KeepAlive> di App.vue: un keep-alive
             qui sarebbe inutile (il figlio non viene mai rimosso). -->
        <KTCarousel :carouselItems="carouselItems" :auto-height="false"/>
    </div>
</template>

<script setup>
import {computed, onMounted} from "vue";
import { CritOp, TacOp } from '@/models/CardModels.js'
import CritCard from '@/components/cards/CritCard.vue'
import TacCard from '@/components/cards/TacCard.vue'
import critTacOpsData from '@/properties/crit-tac-op.json';

const critOpsObj = critTacOpsData.crit_ops.map(el => Object.assign(new CritOp(), el));
const tacOpsObj = critTacOpsData.tac_ops.map(el => Object.assign(new TacOp(), el));

const carouselItems = computed(() => {
        let items = [];
        
        critOpsObj.forEach((el, index) => {
            items.push(getCritCardCarouselItem(index, el));
        });
        tacOpsObj.forEach((el, index) => {
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

onMounted(() => {
    console.log('critTacOpsData: ', critTacOpsData);
    console.log('critOpsObj: ', critOpsObj);
    console.log('tacOpsObj: ', tacOpsObj);
});
</script>

<style scoped>

</style>
