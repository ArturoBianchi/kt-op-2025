import {weaponRules} from "@/properties/rules/weapon_rules.json";
import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {WeaponRule} from "@/models/WeaponRule.js";

export const useWeaponRulesStore = defineStore('weaponRules', () => {
    const rules = ref(weaponRules.map(el => new WeaponRule(el)));
    const pinned = ref([]);

    const getRules = computed(() => rules.value);
    const getPinned = computed(() => pinned.value);

    return {
        getRules,
        getPinned,
        rules,
        pinned
    };
})