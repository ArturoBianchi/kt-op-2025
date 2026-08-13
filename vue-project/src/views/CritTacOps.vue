<script setup>
import {computed, onMounted, ref} from "vue";
import { CritOp, TacOp } from '@/models/CardModels.js'
import CritCard from '@/components/cards/CritCard.vue'
import TacCard from '@/components/cards/TacCard.vue'
import critTacOpsData from '@/properties/crit-tac-op.json';

const critOpsObj = critTacOpsData.crit_ops.map(el => Object.assign(new CritOp(), el));
const tacOpsObj = critTacOpsData.tac_ops.map(el => Object.assign(new TacOp(), el));
const selectMultiple1 = ref([]);
const selectMultiple2 = ref([]);
const items = ref(['Backlog', 'Todo', 'In Progress', 'Done'])

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

<template>
    <div class="centered-view" style="height: 100%;">
        <h1>CRIT & TAC OPS</h1>
<!--        <div class="card-filters grid sm:grid-cols-2 md:grid-cols-3 gap-4">-->
<!--            <UFormField orientation="horizontal" name="test" label="Crit Ops">-->
<!--                <USelect v-model="selectMultiple1" multiple :items="items" placeholder="Filtra..." class="w-full" />-->
<!--            </UFormField>-->
<!--            <UFormField orientation="horizontal" name="test" label="Tac Ops">-->
<!--                <USelect v-model="selectMultiple2" multiple :items="items" placeholder="Filtra..." class="w-full" />-->
<!--            </UFormField>-->
<!--        </div>-->
        <KTCarousel carousel-id="crit-tac-ops" :carouselItems="carouselItems" :auto-height="false"/>
    </div>
</template>

<style scoped>

</style>
