<script setup>
import {BaseOp} from "@/models/CardModels.js";
import {computed} from "vue";

const props = defineProps({
    model: {
        type: BaseOp,
        required: true
    }
})

const title = computed(() => {
    return props.model.hasOwnProperty("number")
            ? props.model.number + ". " + props.model.title
            : props.model.title;
})

</script>

<template>
    <div class="card-grid">
        <div class="op-card" :class="model.typeClass">
            <div class="op-type" :class="model.typeClass">{{ model.typeText}}</div>
            <div class="op-title">{{title}}</div>
            <slot name="card-body" :type-class="model.typeClass"/>
        </div>
    </div>
</template>

<style scoped>
.op-card {
    background-color: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius);
    padding: 1rem;
    position: relative;
    overflow: hidden;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5);
    transition: var(--transition);
}

.op-card:hover {
    transform: translateY(-2px);
    border-color: var(--text-secondary);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
}

/* Bordo superiore colorato in base all'archetipo */
.op-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 4px;
}
.op-card.recon::before { background-color: var(--op-recon); }
.op-card.infiltration::before { background-color: var(--op-infil); }
.op-card.security::before { background-color: var(--op-sec); }
.op-card.seek::before { background-color: var(--op-seek); }
.op-card.crit::before { background-color: var(--op-crit); }
.op-card.kill::before { background-color: var(--accent-main); }

/* Archetype-specific colors for internal elements */
.op-card.recon :deep(.op-section-title) { color: var(--op-recon); }
.op-card.recon :deep(.op-action-box) { border-left-color: var(--op-recon); }
.op-card.recon :deep(.ap-cost) { background-color: var(--op-recon); color: var(--bg-surface);}

.op-card.infiltration :deep(.op-section-title) { color: var(--op-infil); }
.op-card.infiltration :deep(.op-action-box) { border-left-color: var(--op-infil); }
.op-card.infiltration :deep(.ap-cost) { background-color: var(--op-infil); }

.op-card.security :deep(.op-section-title) { color: var(--op-sec); }
.op-card.security :deep(.op-action-box) { border-left-color: var(--op-sec); }
.op-card.security :deep(.ap-cost) { background-color: var(--op-sec); color: var(--bg-surface);}

.op-card.seek :deep(.op-section-title) { color: var(--op-seek); }
.op-card.seek :deep(.op-action-box) { border-left-color: var(--op-seek); }
.op-card.seek :deep(.ap-cost) { background-color: var(--op-seek); }

.op-card.crit :deep(.op-section-title) { color: var(--op-crit); }
.op-card.crit :deep(.op-action-box) { border-left-color: var(--op-crit); }
.op-card.crit :deep(.ap-cost) { background-color: var(--op-crit);color: var(--bg-surface);}

.op-card.kill :deep(.op-section-title) { color: var(--accent-main); }
.op-card.kill :deep(.op-action-box) { border-left-color: var(--accent-main); }
.op-card.kill :deep(.ap-cost) { background-color: var(--accent-main);color: var(--text-primary);}

.op-card .op-type {
    font-size: 0.8rem;
    font-weight: 800;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.1em;
}

.op-card .op-title {
    font-size: 1.4rem;
    margin-bottom: 0.75rem;
}

:deep(.op-section-title) {
    font-size: 0.9rem;
    font-weight: 800;
    text-transform: uppercase;
    margin-top: 1.25rem;
    margin-bottom: 0.5rem;
}

:deep(.op-action-box) {
    background-color: rgba(255, 255, 255, 0.05);
    border-left: 2px solid;
    padding: 1rem;
    margin: 1rem 0;
    border-radius: 0 var(--radius) var(--radius) 0;
}

:deep(.op-action-header) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
}

:deep(.ap-cost) {
    color: #fff;
    font-family: var(--font-mono),serif;
    font-size: 0.9rem;
    padding: 0.2rem 0.5rem;
    border-radius: 3px;
}
</style>