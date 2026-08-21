<script setup>
import {computed} from "vue";

const props = defineProps({
    agent: {
        type: Object,
        required: true
    }
});

// Carica in eager tutte le immagini degli agenti al momento della build, cosi'
// il percorso relativo salvato nei JSON delle fazioni (es.
// "assets/pics/nemesis_claw/night_lord_visionario.png") puo' essere risolto
// nell'URL effettivo dell'asset gestito da Vite.
const agentImages = import.meta.glob('../../assets/pics/**/*.png', {eager: true, import: 'default'});

const resolvedImgPath = computed(() => {
    if (!props.agent.img_path) return undefined;
    const match = Object.entries(agentImages).find(([path]) => path.endsWith(props.agent.img_path));
    return match?.[1];
});

const columns = [
    {
        accessorKey: 'name',
        header: 'Arma'
    },
    {
        accessorKey: 'ATT',
        header: 'ATT'
    },
    {
        accessorKey: 'COLP',
        header: 'COLP'
    },
    {
        accessorKey: 'DNN',
        header: 'DNN'
    },
    {
        accessorKey: 'RdA',
        header: 'RdA',
        cell: ({getValue}) => {
            const value = getValue();
            if (value === '' || value === null || value === undefined) return '\u00A0';
            return Array.isArray(value) ? value.join(', ') : String(value);
        }
    }
];
</script>

<template>
<UCollapsible>
    <div class="grid grid-cols-8 cursor-pointer">
        <div class="col-span-4">
            <UUser :avatar="{src: resolvedImgPath, loading: 'lazy', icon: 'i-lucide-image',}">
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
        <div class="content-section">
            <div style="margin-top: 0.5rem; color: var(--text-primary); font-weight: 300; letter-spacing: 0.04rem">
                <UTable sticky :data="agent.weapons || []"
                        :columns="columns" class="w-full"
                        :ui="{
                        root: 'max-h-60',
                        thead: 'bg-transparent',
                        th: 'px-2 py-2 text-xs text-primary',
                        td: 'px-2 py-1.5 text-[0.8rem] text-neutral'
                    }" />
            </div>
            <div v-for="trait in agent.traits">
                <p class="trait-section contrast-text" v-html="'<b style=\'color: var(--accent-important);\'> ' + trait.name + ': </b>' + trait.description"></p>
            </div>
            <div v-for="ability in agent.abilities" :key="ability.name">
                <div class="ability-section">
                    <div class="ability-section-name">
                        <p class="contrast-text">{{ ability.name }}</p>
                    </div>
                    <p class="contrast-text" v-html="ability.description"></p>
                </div>
            </div>
        </div>
    </template>
</UCollapsible>
</template>

<style scoped>
.agent-name{
    font-size: 0.8rem;
    color: var(--text-primary);
}

.agent-desc {
    font-size: 0.6rem;
    color: var(--text-secondary);
}

.agent-stat-label {
    font-size: 0.8rem;
    color: var(--accent-main);
}

.agent-stat {
    font-size: 0.8rem;
    color: var(--text-primary);
}

.content-section {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: left;
}

.trait-section {
    margin-top: 0.5rem;
    font-size: 0.80rem;
}

.trait-section b {
    color: var(--accent-important);
}

.ability-section {
    background-color: rgba(255, 255, 255, 0.05);
    border-left: 2px solid;
    border-left-color: var(--accent-important);
    padding: 1rem;
    margin: 1rem 0;
    border-radius: 0 var(--radius) var(--radius) 0;
}

.ability-section-name {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.60rem;
    font-weight: 900;
}

.contrast-text {
    font-size: 0.8rem; color: var(--text-primary); font-weight: 300; letter-spacing: 0.05rem;
}
</style>