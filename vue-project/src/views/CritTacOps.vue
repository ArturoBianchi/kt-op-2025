<template>
    <div class="centered-view">
        <h1>CRIT & TAC OPS</h1>
        <CritCard v-for="critOp in critOpsObj" :key="critOp.id" :model="critOp" />
        <TacCard v-for="tacOp in tacOpsObj" :key="tacOp.id" :model="tacOp" />
    </div>
</template>

<script setup>
import {onMounted} from "vue";
import { CritOp, TacOp } from '@/models/CardModels.js'
import TacCard from '@/components/cards/TacCard.vue';
import CritCard from '@/components/cards/CritCard.vue';
import critTacOpsData from '@/properties/crit-tac-op.json';


const critOpsObj = critTacOpsData.crit_ops.map(el => Object.assign(new CritOp(), el));
const tacOpsObj = critTacOpsData.tac_ops.map(el => Object.assign(new TacOp(), el));

onMounted(() => {
    console.log('critTacOpsData: ', critTacOpsData);
    console.log('critOpsObj: ', critOpsObj);
    console.log('tacOpsObj: ', tacOpsObj);
});
</script>

<style scoped>
.centered-view {
    text-align: center;
}
</style>
