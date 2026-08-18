<script setup>
import {ref} from "vue";
import {useWeaponRulesStore} from "@/stores/weaponRules.js";
import {storeToRefs} from "pinia";

const weaponRuleStore = useWeaponRulesStore();
const {rules} = storeToRefs(weaponRuleStore)
const open = ref(true)
</script>

<template>
    <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
    >
        <UAlert v-if="open"
                description="Per leggere il testo della regola, clicca sulla freccia. Per fissare la regola nella sezione di battaglia, invece, clicca sul pin."
                color="primary"
                variant="soft"
                icon="i-lucide-info"
                close
                :ui="{title: 'text-left text-base font-semibold', description: 'font-semibold text-left text-xs', close: 'text-primary'}"
                @update:open="open = false"
        />
    </Transition>
    <div class="weapon-rules-list">
        <DataCard v-for="rule in rules" :key="rule.id" :pin-data="rule">
            <WeaponDataCard :rule="rule" />
        </DataCard>
    </div>
</template>

<style scoped>
.weapon-rules-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.5rem;
}
</style>