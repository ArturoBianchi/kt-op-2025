<script setup>
import {computed} from "vue";

const props = defineProps({
    rules: {
        type: String,
        required: true
    }
});

// Eagerly load every deploy-rule HTML snippet bundled under
// properties/factions at build time, as raw HTML strings, keyed by
// file name (the "rules" prop carries a path whose file name is the
// only stable identifier across builds).
const deployRuleModules = import.meta.glob('../properties/factions/*.html', {
    eager: true,
    query: '?raw',
    import: 'default'
});

const deployRulesByFileName = Object.fromEntries(
    Object.entries(deployRuleModules).map(([path, html]) => [path.split('/').pop(), html])
);

const ruleHtml = computed(() => {
    if (typeof props.rules !== 'string' || !props.rules) {
        return '';
    }
    const fileName = props.rules.split('/').pop();
    return deployRulesByFileName[fileName] ?? '';
});
</script>

<template>
    <DataCard :pinDisabled="true">
        <div class="rules" v-html="ruleHtml"></div>
    </DataCard>
</template>

<style scoped>
.rules {
    font-size: 0.8rem;
    text-align: left;
    color: var(--text-primary);
}
</style>