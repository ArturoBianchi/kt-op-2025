<script setup>
import {computed, ref} from "vue";
import {useWeaponRulesStore} from "@/stores/weaponRules.js";
import {storeToRefs} from "pinia";

const weaponRuleStore = useWeaponRulesStore();
const {
    rules,
    pinned
} = storeToRefs(weaponRuleStore)
const getRulesItems = computed(() =>
        rules.value.map(
                rule => ({label: rule.name, content: rule.text})
        )
);
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
                color="info"
                variant="soft"
                icon="i-lucide-info"
                close
                :ui="{title: 'text-left text-base font-semibold', description: 'font-semibold text-left text-xs'}"
                @update:open="open = false"
        />
    </Transition>
    <UAccordion type="multiple" :items="getRulesItems"
                :ui="{item: 'border-primary', body: 'text-left text-secondary',trigger: 'font-bold justify-between'}">
        <template #trailing="{ item, index }">
            <div class="flex items-center gap-3.5 ms-auto">
                <UButton
                        icon="i-lucide-pin"
                        color="neutral"
                        variant="ghost"
                        size="xs"
                        @click.stop="console.log(item)"
                />
                <UIcon
                        name="i-lucide-chevron-down"
                        class="size-5 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
                />
            </div>
        </template>
    </UAccordion>
</template>

<style scoped>

</style>