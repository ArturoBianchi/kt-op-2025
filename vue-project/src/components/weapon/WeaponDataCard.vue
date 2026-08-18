<script setup>
defineProps({
    rule: {
        type: Object,
        required: true
    }
});
</script>

<template>
    <UCollapsible>
        <p class="rule-name cursor-pointer">{{ rule.name }}</p>
        <template #content>
            <p class="rule-text">{{ rule.text }}</p>
        </template>
    </UCollapsible>
</template>

<style scoped>
.rule-name {
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--text-primary);
}

.rule-text {
    color: var(--text-secondary);
    margin-top: 0.5rem;
}
</style>
