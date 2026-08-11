<script setup>
import OpCard from "@/components/cards/OpCard.vue";
import { TacOp } from "@/models/CardModels.js";

defineProps({
    model: {
        type: TacOp,
        required: true
    }
})
</script>

<template>
    <OpCard :model="model">
        <template #card-body>
            <div class="op-section-title" :class="model.typeClass">Rivela</div>
            <p v-html="model.reveal"></p>

            <div v-if="model.rule">
                <div class="op-section-title" :class="model.typeClass">Regole</div>
                <p v-html="model.rule"></p>
            </div>
            
            <div v-if="model.mission_actions.length > 0" class="op-section-title" :class="model.typeClass">Azioni della missione</div>
            <div v-for="action in model.mission_actions" :key="action.name">
                <div class="op-action-box">
                    <div class="op-action-header">
                        <strong>{{ action.name }}</strong>
                        <span class="ap-cost">{{ action.ap }}</span>
                    </div>
                    <p v-html="action.text"></p>
                </div>
            </div>

            <div class="op-section-title" :class="model.typeClass">Punti Vittoria</div>
            <p v-html="model.victory_points"></p>
        </template>
    </OpCard>
</template>

<style scoped>
</style>