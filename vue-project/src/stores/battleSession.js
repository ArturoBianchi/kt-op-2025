import {defineStore} from 'pinia'
import {computed, ref} from "vue";
import {createExpiringSerializer, NINE_HOURS_MS} from "@/stores/plugins/persistExpiry.js";
import {TurningPointsModel} from "@/models/TurningPointsModel.js";
import critTacOpsData from "@/properties/crit-tac-kill-op.json";

// TODO: the start/end-battle wizard will let the players pick their own
// Crit Op, Tac Op and Primary Op for the session. Until it exists, default
// the ops summary to a mocked selection so the board has something to show.
function getMockedOpsSummary() {
    const mockCritOp = critTacOpsData.crit_ops[0];
    const mockTacOp = critTacOpsData.tac_ops[0];
    return {
        critOp: {id: mockCritOp.id, desc: mockCritOp.title},
        tacOp: {id: mockTacOp.id, desc: mockTacOp.title},
        primaryOp: {id: 'crit', desc: mockCritOp.title},
    };
}

function getDefaultTurningPointsScores() {
    return [
        {turningPointNumber: 1, turningPoint: new TurningPointsModel()},
        {turningPointNumber: 2, turningPoint: new TurningPointsModel()},
        {turningPointNumber: 3, turningPoint: new TurningPointsModel()},
        {turningPointNumber: 4, turningPoint: new TurningPointsModel()}
    ];
}

// Session-scoped match data: expires 9h after the last interaction (rolling
// TTL), so an active battle never gets wiped mid-game while an abandoned
// one is cleaned up once it's clearly over.
export const useBattleSessionStore = defineStore(
    'battleSession', () => {
        const battleStarted = ref(false)
        const commandPoints = ref(0)
        const factionPoints = ref(0)
        const opsSummary = ref(getMockedOpsSummary())
        const maxScorePerMission = 6
        const initiativeCardsStatus = ref([
            {id: 'reroll', value: false},
            {id: 'plus1', value: false},
            {id: 'plus2', value: false},
            {id: 'plus3', value: false},
        ])
        const turningPointsScores = ref(getDefaultTurningPointsScores())

        const getBattleStarted = computed(() => battleStarted.value)
        const getCommandPoints = computed(() => commandPoints.value)
        const getFactionPoints = computed(() => factionPoints.value)
        const getOpsSummary = computed(() => opsSummary.value)
        const getInitiativeCardsStatus = computed(() => initiativeCardsStatus.value)
        const getTurningPointsScores = computed(() => turningPointsScores.value)
        const getMaxScorePerMission = computed(() => maxScorePerMission)
        const getCountOfAllCritOps = computed(() =>{
            let toRet = 0;
            for(const turn of turningPointsScores.value)
                toRet += turn.turningPoint.crit;

            return toRet;
        })
        const getCountOfAllTacOps = computed(() =>{
            let toRet = 0;
            for(const turn of turningPointsScores.value)
                toRet += turn.turningPoint.tac;

            return toRet;
        })

        const getPrimaryOpsBonus = computed(() => {
            return (primaryOpType) => {
                let sum = 0;
                for(const turn of turningPointsScores.value)
                    sum += turn.turningPoint[primaryOpType];

                return Math.ceil(sum/2);
            }
        })

        function startBattle() {
            battleStarted.value = true;
        }

        function endBattle() {
            battleStarted.value = false;
        }

        function increaseCommandPoints() {
            commandPoints.value++;
        }

        function decreaseCommandPoints() {
            commandPoints.value--;
        }

        function increaseFactionPoints() {
            factionPoints.value++;
        }

        function decreaseFactionPoints() {
            factionPoints.value--;
        }

        function setCritOp(id, desc) {
            opsSummary.value.critOp = {id: id, desc: desc};
        }

        function setTacOp(id, desc) {
            opsSummary.value.tacOp = {id: id, desc: desc};
        }

        function setPrimaryOp(id, desc) {
            opsSummary.value.primaryOp = {id: id, desc: desc};
        }

        function updateInitiativeCardsStatus(id, status) {
            initiativeCardsStatus.value.find(card => card.id === id).value = status;
        }

        function addOpPoint(turnNumber, opType){
            let turn = turningPointsScores.value
                .find(turningPoint => turningPoint.turningPointNumber === turnNumber);

            if(turn.turningPoint[opType] < maxScorePerMission && getCountOfOpByType(opType) < maxScorePerMission){
                turn.turningPoint[opType]++;
            }
        }

        function removeOpPoint(turnNumber, opType){
            let turn = turningPointsScores.value
                .find(turningPoint => turningPoint.turningPointNumber === turnNumber);

            if(turn.turningPoint[opType] > 0){
                turn.turningPoint[opType]--;
            }
        }

        function getCountOfOpByType(opType){
            let count = 0;
            turningPointsScores.value.forEach(turn => {
                count += turn.turningPoint[opType];
            });

            return count;
        }

        /**
         * Reset state
         */
        function $reset() {
            battleStarted.value = false;
            commandPoints.value = 0;
            factionPoints.value = 0;
            opsSummary.value = getMockedOpsSummary();
            initiativeCardsStatus.value = [
                {id: 'reroll', value: false},
                {id: 'plus1', value: false},
                {id: 'plus2', value: false},
                {id: 'plus3', value: false},
            ];
            turningPointsScores.value = getDefaultTurningPointsScores();
        }

        return {
            battleStarted,
            getBattleStarted,
            startBattle,
            endBattle,
            commandPoints,
            getCommandPoints,
            factionPoints,
            getFactionPoints,
            opsSummary,
            getOpsSummary,
            initiativeCardsStatus,
            getInitiativeCardsStatus,
            turningPointsScores,
            getTurningPointsScores,
            getMaxScorePerMission,
            getCountOfAllCritOps,
            getCountOfAllTacOps,
            getPrimaryOpsBonus,
            increaseCommandPoints,
            decreaseCommandPoints,
            increaseFactionPoints,
            decreaseFactionPoints,
            setCritOp,
            setTacOp,
            setPrimaryOp,
            updateInitiativeCardsStatus,
            addOpPoint,
            removeOpPoint,
            $reset
        }
    },
    {
        persist: {
            serializer: createExpiringSerializer(NINE_HOURS_MS)
        }
    })
