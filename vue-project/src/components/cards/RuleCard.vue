<script setup>
const props = defineProps({
    id: String,
    title: {
        type: String,
        default: 'NO TITLE'
    },
    subTitle: {
        type: String,
        default: null
    },
    paragraphs: {
        type: Array,
        default: []
    },
    notes: {
        type: Array,
        default: []
    }
})
</script>

<template>
    <h3>{{ title }}</h3>
    <h3 v-if="subTitle" class="rule-subtitle">{{ subTitle }}</h3>
    <p v-for="par in paragraphs" :key="par" v-html="par"></p>
    <p v-for="note in notes" class="no-bullet" v-html="note"></p>
</template>

<style scoped>
p {
    text-align: left;
    margin: 1.2em 0;
    line-height: 1.4;
}

p:not(.no-bullet) {
    position: relative;
    padding-left: 1.5rem;
}

p:not(.no-bullet)::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0.4em;
    width: 0.6rem;
    height: 0.6rem;
    background-color: var(--accent-main);
    border-radius: 50%;
    box-shadow: 0 0 8px var(--accent-main-dim);
}

.rule-subtitle {
    text-align: center;
    color: var(--text-secondary)
}
</style>