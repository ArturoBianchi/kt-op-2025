<script setup>
import OpCard from "@/components/cards/OpCard.vue";
import {CritOp, KillOp} from "@/models/CardModels.js";
import {onMounted} from "vue";

const props = defineProps({
    model: {
        type: KillOp,
        required: true
    }
})

const columns = [
    {
        accessorKey: 'startingAgents',
        header: '#',
        meta: {
            class: {
                td: 'text-primary'
            }
        }
    },
    {
        accessorKey: 'grade1',
        header: '1°'
    },
    {
        accessorKey: 'grade2',
        header: '2°'
    },
    {
        accessorKey: 'grade3',
        header: '3°'
    },
    {
        accessorKey: 'grade4',
        header: '4°'
    },
    {
        accessorKey: 'grade5',
        header: '5°'
    },
]

onMounted(() => {
    console.log(props.model)
})

</script>

<template>
    <OpCard :model="model">
        <template #card-body>
            <div v-if="model.rule" style="margin-bottom: 1rem;">
                <div class="op-section-title" :class="model.typeClass">Come ottenere punti</div>
                <p v-html="model.rule"></p>
            </div>
            <UTable :data="model.tableData"
                    :columns="columns" class="flex-1"
                    :ui="{
                        root: 'max-h-50',
                        th: 'px-2 py-2 text-xs text-primary',
                        td: 'px-2 py-2 text-xs'
                    }" />
        </template>
    </OpCard>
</template>

<style scoped>

</style>