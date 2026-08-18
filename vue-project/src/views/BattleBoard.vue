<template>
    <div class="centered-view" style="height: 100%;">
        <div class="grid grid-cols-4 gap-4 board-scoreboard">
            <div class="col-span-1 col-start-1 score-player ally">
                <div class="score-name">PC</div>
                <div class="score-value">{{ commandPoints }}</div>
                <div class="score-controls">
                    <button class="btn btn-icon" type="button" @click="battleSessionStore.decreaseCommandPoints()">-</button>
                    <button class="btn btn-icon" type="button" @click="battleSessionStore.increaseCommandPoints()">+</button>
                </div>
                <UButton size="sm" style="margin-top: 1rem" icon="i-mdi-delete-outline" class="btn-dark font-bold rounded-full " @click="commandPoints = 0"></UButton>
            </div>
            <div class="col-span-1 score-player">
                <div class="score-name">PF</div>
                <div class="score-value">{{ factionPoints }}</div>
                <div class="score-controls">
                    <button class="btn btn-icon" type="button" @click="battleSessionStore.decreaseFactionPoints()">-</button>
                    <button class="btn btn-icon" type="button" @click="battleSessionStore.increaseFactionPoints()">+</button>
                </div>
                <UButton size="sm" style="margin-top: 1rem" icon="i-mdi-delete-outline" class="btn-dark font-bold rounded-full " @click="factionPoints = 0"></UButton>
            </div>
            <div class="col-span-2">
                <div class="ops-scoreboard">
                    <div class="ops-row">
                        <span class="ops-label">Crit:</span>
                        <span class="ops-value">{{ opsSummary.critOp.desc }}</span>
                    </div>
                    <div class="ops-row">
                        <span class="ops-label">Tac:</span>
                        <span class="ops-value">{{ opsSummary.tacOp.desc }}</span>
                        <UButton size="xs" style="" icon="i-mdi-eye-outline" class="btn-dark font-bold rounded-full " @click="factionPoints = 0"></UButton>
                    </div>
                    <div class="ops-row">
                        <span class="ops-label">P.Op:</span>
                        <span class="ops-value ops-dots">{{ opsSummary.primaryOp.desc }}</span>
                        <UButton size="xs"  icon="i-mdi-eye-outline" class="btn-dark font-bold rounded-full " @click="factionPoints = 0"></UButton>
                    
                    </div>
                </div>
            </div>
        </div>

        <div class="board-tabs">
            <div class="score-name">PUNTI DI SVOLTA</div>
            <UTabs :items="tabs" color="primary" variant="pill" size="sm" :ui="tabsUi" class="w-full">
                <template #content="{ item }">
                    <div class="points-card">
                        <div class="wounds-section">
                            <div class="wounds-label-row">
                                <span class="wounds-label" >PUNTI CRIT OP</span>
                                <button class="btn btn-icon" type="button" @click="removePoint(item.turningPointNumber, 'crit')">-</button>
                                <button class="btn btn-icon" type="button" @click="addPoint(item.turningPointNumber, 'crit')">+</button>
                                <span class="wounds-value">{{ item.turningPoint.crit }} / {{ maxScorePerMission }}</span>
                            </div>
                            <UProgress
                                    :model-value="item.turningPoint.crit"
                                    :max="maxScorePerMission"
                                    :color="item.turningPoint.crit === maxScorePerMission ? 'success' : 'primary'"
                                    size="sm"
                            />
                            <div class="wounds-label-row">
                                <span class="wounds-label">PUNTI TAC OP</span>
                                <button class="btn btn-icon" type="button" @click="removePoint(item.turningPointNumber, 'tac')">-</button>
                                <button class="btn btn-icon" type="button" @click="addPoint(item.turningPointNumber, 'tac')">+</button>
                                <span class="wounds-value">{{ item.turningPoint.tac }} / {{ maxScorePerMission }}</span>
                            </div>
                            <UProgress
                                    :model-value="item.turningPoint.tac"
                                    :max="maxScorePerMission"
                                    :color="item.turningPoint.tac === maxScorePerMission ? 'success' : 'primary'"
                                    size="sm"
                            />
                            <div class="wounds-label-row">
                                <span class="wounds-label">PUNTI KILL OP</span>
                                <button class="btn btn-icon" type="button" @click="removePoint(item.turningPointNumber, 'kills')">-</button>
                                <button class="btn btn-icon" type="button" @click="addPoint(item.turningPointNumber, 'kills')">+</button>
                                <span class="wounds-value">{{ item.turningPoint.kills }} / {{ maxScorePerMission }}</span>
                            </div>
                            <UProgress
                                    :model-value="item.turningPoint.kills"
                                    :max="maxScorePerMission"
                                    :color="item.turningPoint.kills === maxScorePerMission ? 'success' : 'primary'"
                                    size="sm"
                            />
                        </div>

<!--                        <div class="operative-footer">-->
<!--                            <span class="apl-badge">PA {{ item.apl }}</span>-->
<!--                            <span v-if="item.status" class="status-badge" :class="`status-${item.statusColor}`">{{ item.status }}</span>-->
<!--                        </div>-->
                    </div>
                </template>
            </UTabs>
        </div>
        <div class="board-tabs">
            <div class="initiative-card">
                <div class="cards-row">
                    <span id="reroll" class="nav-icon" :class="isInitiativeCardActive('reroll') ? 'color-icon' : ''" @click="toggleInitiativeCard('reroll')">
                        <svg class="reroll-icon" viewBox="0 0 35 35" aria-hidden="true" focusable="false">
                            <use href="/icons/reroll.svg#reroll" />
                        </svg>
                    </span>
                    <span id="plus1" class="nav-icon" :class="isInitiativeCardActive('plus1') ? 'color-icon' : ''" @click="toggleInitiativeCard('plus1')">+/- 1</span>
                    <span id="plus2" class="nav-icon" :class="isInitiativeCardActive('plus2') ? 'color-icon' : ''" @click="toggleInitiativeCard('plus2')">+/- 2</span>
                    <span id="plus3" class="nav-icon" :class="isInitiativeCardActive('plus3') ? 'color-icon' : ''" @click="toggleInitiativeCard('plus3')">+/- 3</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useBattleSessionStore } from '../stores/battleSession';

const battleSessionStore = useBattleSessionStore();

const {
    commandPoints,
    factionPoints,
    initiativeCardsStatus,
    opsSummary,
    turningPointsScores,
} = storeToRefs(battleSessionStore);

const maxScorePerMission = battleSessionStore.getMaxScorePerMission;

const tabs = computed(() =>
    turningPointsScores.value.map((op, index) => ({
        label: String(index + 1),
        ...op,
    }))
);

const tabsUi = {
    list: 'w-full',
    trigger: 'grow font-mono uppercase text-xs tracking-wide',
    content: 'mt-4',
};

function isInitiativeCardActive(id) {
    return initiativeCardsStatus.value.find(card => card.id === id).value === true;
}

function toggleInitiativeCard(id) {
    battleSessionStore.updateInitiativeCardsStatus(id, !isInitiativeCardActive(id));
}

function addPoint(turnNumber, opType) {
    battleSessionStore.addOpPoint(turnNumber, opType);
}

function removePoint(turnNumber, opType) {
    battleSessionStore.removeOpPoint(turnNumber, opType);
}

</script>

<style scoped>
.board-scoreboard {
    margin-bottom: 1rem;
}

.score-value {
    font-size: 1.8rem;
}

.ops-scoreboard {
    background-color: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius);
    padding: 0 0.6rem;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.2rem;
}

.ops-row {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.75rem;
}

.ops-label {
    color: var(--text-secondary);
    text-transform: uppercase;
    font-weight: 700;
    flex-shrink: 0;
    width: 3.2rem;
    text-align: left;
}

.ops-value {
    color: var(--text-primary);
    font-family: var(--font-mono), serif;
    text-align: left;
    flex: 1;
    font-size: 0.5rem;
}

.ops-dots {
    letter-spacing: 0;
}

.ops-cycle {
    color: var(--text-disabled);
    font-size: 0.65rem;
    text-transform: uppercase;
    flex-shrink: 0;
}

.board-tabs {
    margin-top: 1.5rem;
}

.points-card {
    background-color: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius);
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    min-height: 10rem;
    text-align: left;
}

.initiative-card {
    background-color: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius);
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    min-height: 3rem;
    text-align: left;
}

.cards-row {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
}

.reroll-icon {
    width: 1.4rem;
    height: 1.4rem;
    display: block;
    fill: currentColor;
}

.operative-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.operative-name {
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-primary);
}

.order-badge {
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 0.2rem 0.6rem;
    border-radius: 999px;
    border: 1px solid currentColor;
    flex-shrink: 0;
}

.order-badge.order-engage {
    color: var(--op-infil);
}

.order-badge.order-conceal {
    color: var(--op-recon);
}

.wounds-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.wounds-label-row {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    font-weight: 700;
}

.wounds-label {
    width: 6rem;
}

.wounds-value {
    font-family: var(--font-mono), serif;
    color: var(--text-primary);
    font-variant-numeric: tabular-nums;
}

.operative-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: auto;
}

.apl-badge {
    font-family: var(--font-mono), serif;
    font-size: 0.75rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: var(--bg-app);
    background-color: var(--accent-main);
    padding: 0.2rem 0.6rem;
    border-radius: var(--radius);
}

.status-badge {
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 0.2rem 0.6rem;
    border-radius: var(--radius);
}

.status-badge.status-warning {
    color: var(--op-seek);
    background-color: rgba(255, 171, 145, 0.12);
}

.status-badge.status-error {
    color: var(--op-infil);
    background-color: rgba(204, 87, 108, 0.12);
}

.cards-row .nav-icon {
    cursor: pointer;
}

.nav-icon.color-icon {
    color: var(--accent-main);
}
</style>
