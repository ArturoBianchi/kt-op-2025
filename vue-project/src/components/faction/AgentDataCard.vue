<script setup>
defineProps({
    agent: {
        type: Object,
        required: true
    }
});
</script>

<template>
<UCollapsible>
    <div class="grid grid-cols-8 cursor-pointer">
        <div class="col-span-4">
            <UUser :avatar="{src: 'https://i.pravatar.cc/150?u=john-doe', loading: 'lazy',icon: 'i-lucide-image',}">
                <template #name>
                    <p class="agent-name">{{ agent.name }}</p>
                </template>
                <template #description>
                    <p class="agent-desc">{{ (agent.keywords || []).join(', ') }}</p>
                </template>
            </UUser>
        </div>
        <div class="col-span-1 text-center">
            <p class="agent-stat-label">LPA</p>
            <div class="agent-stat">{{ agent.stats?.LPA }}</div>
        </div>
        <div class="col-span-1 text-center">
            <p class="agent-stat-label">MOV</p>
            <div class="agent-stat">{{ agent.stats?.MOV }}</div>
        </div>
        <div class="col-span-1 text-center">
            <p class="agent-stat-label">SALV</p>
            <div class="agent-stat">{{ agent.stats?.SALV }}</div>
        </div>
        <div class="col-span-1 text-center">
            <p class="agent-stat-label">FER</p>
            <div class="agent-stat">{{ agent.stats?.FER }}</div>
        </div>
    </div>
    <template #content>
        <p class="testing">testing 1</p>
        <p class="testing">testing 2</p>
        <p class="testing">testing 3</p>
        <p class="testing">testing 4</p>
        <p class="testing">testing 5</p>
    </template>
</UCollapsible>
</template>

<style scoped>
.agent-name{
    font-size: 0.7rem;
    color: var(--text-primary);
}

.agent-desc {
    font-size: 0.5rem;
    color: var(--text-secondary);
}

.agent-stat-label {
    font-size: 0.5rem;
    color: var(--text-secondary);
}

.agent-stat {
    font-size: 0.7rem;
    color: var(--text-primary);
}
.testing{
    margin-bottom: 0.5rem;
}
</style>