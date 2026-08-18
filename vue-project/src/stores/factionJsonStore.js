import {defineStore} from "pinia";
import {computed, ref} from "vue";

// Eagerly load every faction JSON bundled under properties/factions at
// build time. The glob is resolved once when this module is evaluated
// (a relative path is used because import.meta.glob doesn't resolve the
// "@" alias), so file names/count can change freely without ever touching
// this store.
const factionModules = import.meta.glob('../properties/factions/*.json', {eager: true});

// Organize the raw catalog by the "faction" field found inside each JSON,
// rather than by file name (which is arbitrary and can change).
function buildFactionsByName() {
    const factionsByName = {};
    Object.values(factionModules).forEach(module => {
        const data = module.default ?? module;
        if (data?.faction) {
            factionsByName[data.faction] = data;
        }
    });
    return factionsByName;
}

// Read-only faction catalog, built once when this store is first accessed
// and cached for the app's lifetime (Pinia stores are singletons). Not
// persisted: it's derived from bundled build-time JSON, not user data.
export const useFactionJsonStore = defineStore('factionJsonStore', () => {
    const factions = ref(buildFactionsByName());

    const getFactions = computed(() => factions.value);
    const getFactionNames = computed(() => Object.keys(factions.value));
    const getFactionItems = computed(() =>
        Object.keys(factions.value).map(name => ({label: name, value: name}))
    );
    const getFactionByName = computed(() => (name) => factions.value[name]);

    return {
        factions,
        getFactions,
        getFactionNames,
        getFactionItems,
        getFactionByName
    }
})
