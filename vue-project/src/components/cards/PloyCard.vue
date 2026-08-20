<script setup>
const props = defineProps({
    ployData: {
        type: Object,
        required: true
    }
})
</script>

<template>
    <div class="card-grid">
        <div class="ploy-card">
            <div class="ploy-title">{{ployData.name}}</div>
            <p style="white-space: pre-line;" class="ploy-body" v-html="ployData.description"></p>
        </div>
    </div>
</template>

<style scoped>
.ploy-card {
    background: var(--bg-surface);
    border-radius: var(--radius);
    padding: 1rem;
    position: relative;
    overflow: hidden;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5);
    transition: var(--transition);
}

.ploy-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
}

/* Bordo superiore colorato in base all'archetipo */
.ploy-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 4px;
    background-color: var(--accent-important);
}

.ploy-card .ploy-title {
    font-size: 1.4rem;
    font-weight: 800;
    margin-bottom: 0.75rem;
}

p {
    color: var(--text-secondary);
    font-size: 0.8rem;
}
</style>