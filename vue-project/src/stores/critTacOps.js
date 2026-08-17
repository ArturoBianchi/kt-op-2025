import {defineStore} from "pinia";
import critTacOpsData from '@/properties/op/crit-tac-kill-op.json';
import {CritOp, KillOp, TacOp} from "@/models/CardModels.js";
import {computed, ref} from "vue";

// Read-only Crit/Tac Ops catalog, built once when this store is first
// accessed and cached for the app's lifetime (Pinia stores are singletons).
// Not persisted: it's derived from bundled build-time JSON, not user data.
export const useCritTacOpsStore = defineStore('critTacOps', () => {
    const critOps = ref(critTacOpsData.crit_ops.map(el => new CritOp(el)));
    const tacOps = ref(critTacOpsData.tac_ops.map(el => new TacOp(el)));
    const killOp = ref(new KillOp(critTacOpsData.kill_op));

    const getCritOps = computed(() => critOps.value);
    const getTacOps = computed(() => tacOps.value);
    const getAllOps = computed(() => [...critOps.value, ...tacOps.value]);
    const getKillOp = computed(() => killOp.value);

    const getCritOpsFilterItems = computed(() =>
        critOps.value.map(op => ({label: op.title, value: op.id}))
    );

    const getTacOpsFilterItems = computed(() =>
        tacOps.value.map(op => ({label: op.title, value: op.id}))
    );

    return {
        critOps,
        tacOps,
        killOp,
        getCritOps,
        getTacOps,
        getAllOps,
        getKillOp,
        getCritOpsFilterItems,
        getTacOpsFilterItems
    }
})