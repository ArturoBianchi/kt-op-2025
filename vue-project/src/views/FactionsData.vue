<script setup>
import {computed, ref} from "vue";
import {useFactionJsonStore} from "@/stores/factionJsonStore.js";
import {useFactionsDataStore} from "@/stores/factionsData.js";
import RuleCard from "@/components/cards/RuleCard.vue";
import PloyCard from "@/components/cards/PloyCard.vue";

const open = ref(true)
const factionJsonStore = useFactionJsonStore();
const factionsDataStore = useFactionsDataStore();
const factionItems = factionJsonStore.getFactionItems;
const selectedTeam = computed({
    get: () => factionsDataStore.getSelectedTeam,
    set: (team) => factionsDataStore.setSelectedTeam(team)
});

const selectedSection = computed({
    get: () => factionsDataStore.getSelectedSection,
    set: (value) => factionsDataStore.setSelectedSection(value)
});

const sectionDefinitions = [
    {
        label: 'Agenti',
        text: 'AGENTI',
        icon: 'i-mdi-account-group',
        value: 'agenti'
    },
    {
        label: 'Sel. Team',
        text: 'SELEZIONE DEL KILL TEAM',
        icon: 'i-mdi-format-list-numbered',
        value: 'sel-team'
    },
    {
        label: 'Reg. Fazione',
        text: 'REGOLE DI FAZIONE',
        icon: 'i-mdi-book-open-page-variant',
        value: 'reg-fazione'
    },
    {
        label: 'Es. Strat.',
        text: 'ESPEDIENTI STRATEGIA',
        icon: 'i-mdi-chess-queen',
        value: 'esp-strat'
    },
    {
        label: 'Es. Fuoco',
        text: 'ESPEDIENTI SCONTRO A FUOCO',
        icon: 'i-mdi-fire',
        value: 'esp-fuoco'
    },
    {
        label: 'Equip.',
        text: 'EQUIPAGGIAMENTO',
        icon: 'i-mdi-wrench',
        value: 'equip'
    }
];

const items = computed(() => [
    sectionDefinitions.map(item => ({
        ...item,
        active: item.value === selectedSection.value,
        onSelect: () => selectSection(item)
    }))
]);

function selectSection(item) {
    selectedSection.value = item.value;
}

const selectedItem = computed(() =>
    sectionDefinitions.find(item => item.value === selectedSection.value) ?? null
);

const factionAgents = computed(() =>
    factionJsonStore.getFactionByName(selectedTeam.value)?.agents ?? []
);

const factionDeployRules = computed(() =>
    factionJsonStore.getFactionByName(selectedTeam.value)?.agents_deploy_rules ?? []
);

const factionStratPloysItems = computed(() => {
    let stratPloy = factionJsonStore.getFactionByName(selectedTeam.value)?.strategy_ploy ?? [];
    return stratPloy.map(ploy => ({
        id: 'ploy-id-' + ploy.name.toLowerCase().replace(" ", "-"),
        component: PloyCard,
        props: {ployData: ploy},
    }));
});

const factionFirePloysItems = computed(() => {
    let stratPloy = factionJsonStore.getFactionByName(selectedTeam.value)?.fire_ploy ?? [];
    return stratPloy.map(ploy => ({
        id: 'fire-ploy-id-' + ploy.name.toLowerCase().replace(" ", "-"),
        component: PloyCard,
        props: {ployData: ploy},
    }));
});

const factionEquipItems = computed(() => {
    let stratPloy = factionJsonStore.getFactionByName(selectedTeam.value)?.faction_equiment ?? [];
    return stratPloy.map(ploy => ({
        id: 'equip-ploy-id-' + ploy.name.toLowerCase().replace(" ", "-"),
        component: PloyCard,
        props: {ployData: ploy},
    }));
});

const factionRulesItems = computed(() => {
    let stratPloy = factionJsonStore.getFactionByName(selectedTeam.value)?.faction_rules ?? [];
    return stratPloy.map(ploy => ({
        id: 'rule-ploy-id-' + ploy.name.toLowerCase().replace(" ", "-"),
        component: PloyCard,
        props: {ployData: ploy},
    }));
});


</script>

<template>
    <div class="factions-header">
        <Transition
                enter-active-class="transition duration-200 ease-out"
                enter-from-class="opacity-0"
                enter-to-class="opacity-100"
                leave-active-class="transition duration-200 ease-in"
                leave-from-class="opacity-100"
                leave-to-class="opacity-0"
        >
            <UAlert v-if="open"
                    description="Per visualizzare i dati di una fazione selezionala prima dal menu a tendina qua sotto"
                    color="primary"
                    variant="soft"
                    icon="i-lucide-info"
                    close
                    :ui="{title: 'text-left text-base font-semibold', description: 'font-semibold text-left text-xs', close: 'text-primary'}"
                    @update:open="open = false"
            />
        </Transition>
        <div class="grid grid-cols-1 p-1">
            <div class="col-span-auto" style="margin-top: 1rem">
                <UFormField size="sm" name="test" class="w-70">
                    <USelect v-model="selectedTeam" :items="factionItems" :content="{side: 'bottom'}" placeholder="Seleziona fazione..." class="w-full text-left" />
                </UFormField>
            </div>
            <div class="col-span-auto" style="margin: 0.5rem 0;">
                <UNavigationMenu :items="items" :ui="{root: 'py-1 [&>div]:w-full', list: 'w-full', item: 'py-0 flex-1 min-w-0',link: 'flex-col gap-1 px-1 justify-center', linkLeadingIcon: 'size-4',linkLabel: 'w-full text-center truncate text-[0.6rem]/3 font-normal'}" class="w-full"/>
            </div>
        </div>
        <h3 v-if="selectedItem" class="factions-section-title">{{ selectedItem.text }}</h3>
    </div>
    <div class="factions-panel p-1">
        <div class="factions-content">
            <!-- Next implementation: render real content here based on selectedItem -->
            <ul v-if="selectedSection === 'agenti'" class="factions-item-list">
                <li v-for="agent in factionAgents" :key="agent.name">
                    <DataCard :pin-data="agent">
                        <AgentDataCard :agent="agent" />
                    </DataCard>
                </li>
            </ul>
            <ul v-if="selectedSection === 'sel-team'" class="factions-item-list">
                <DeployRuleViewer :rules="factionDeployRules" />
            </ul>
            <ul v-if="selectedSection === 'reg-fazione'" class="factions-item-list">
                <KTCarousel carousel-id="faction-strat-ploy-carousel" :carouselItems="factionRulesItems" />
            </ul>
            <ul v-if="selectedSection === 'esp-strat'" class="factions-item-list">
                <KTCarousel carousel-id="faction-strat-ploy-carousel" :carouselItems="factionStratPloysItems" />
            </ul>
            <ul v-if="selectedSection === 'esp-fuoco'" class="factions-item-list">
                <KTCarousel carousel-id="faction-strat-ploy-carousel" :carouselItems="factionFirePloysItems" />
            </ul>
            <ul v-if="selectedSection === 'equip'" class="factions-item-list">
                <KTCarousel carousel-id="faction-strat-ploy-carousel" :carouselItems="factionEquipItems" />
            </ul>
        </div>
    </div>
</template>

<style scoped>
.factions-header {
    padding-bottom: 0.25rem;
}

.factions-section-title {
    text-align: center;
}

.factions-panel {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
}

.factions-content {
    flex: 1;
    min-width: 0;
    min-height: 70vh;
    border-radius: var(--radius);
   
}

.factions-content-placeholder {
    text-align: center;
    font-weight: 900;
    color: var(--text-primary);
}

.factions-item-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    list-style: none;
    padding: 0;
    margin: 0;
}

.factions-item {
    background-color: var(--bg-app);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius);
    padding: 0.6rem 0.75rem;
    color: var(--text-primary);
    font-size: 0.85rem;
    text-align: left;
}
</style>