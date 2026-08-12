<template>
    <div class="centered-view">
        <h1>CRIT & TAC OPS</h1>
        <keep-alive>
            <KTCarousel :carouselItems="carouselItems" :auto-height="true"/>
        </keep-alive>
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
