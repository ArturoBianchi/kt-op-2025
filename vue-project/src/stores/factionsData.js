import {defineStore} from "pinia";
import {computed, ref} from "vue";

// View-scoped UI state for the FactionsData view. It tracks which
// team/faction the user has selected in the picker, and which navigation
// menu section is currently active; the faction catalog itself lives in
// factionJsonStore.js.
export const useFactionsDataStore = defineStore('factionsData', () => {
        const selectedTeam = ref('');
        const selectedSection = ref('');

        const getSelectedTeam = computed(() => selectedTeam.value);
        const getSelectedSection = computed(() => selectedSection.value);

        function setSelectedTeam(team) {
            selectedTeam.value = team;
        }

        function setSelectedSection(section) {
            selectedSection.value = section;
        }

        /**
         * Reset state
         */
        function $reset() {
            selectedTeam.value = '';
            selectedSection.value = '';
        }

        return {
            selectedTeam,
            selectedSection,
            getSelectedTeam,
            getSelectedSection,
            setSelectedTeam,
            setSelectedSection,
            $reset
        }
    },
    {
        persist: true
    })