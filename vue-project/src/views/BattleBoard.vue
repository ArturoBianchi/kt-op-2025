<template>
    <div class="centered-view" style="height: 100%;">
        <div class="grid grid-cols-4 gap-4 board-scoreboard">
            <div class="col-span-1 col-start-1 score-player ally">
                <div class="score-name">PC</div>
                <div class="score-value">{{ myScore }}</div>
                <div class="score-controls">
                    <button class="btn btn-icon" type="button">-</button>
                    <button class="btn btn-icon" type="button">+</button>
                </div>
            </div>
            <div class="col-span-1 score-player">
                <div class="score-name">PF</div>
                <div class="score-value">{{ opponentScore }}</div>
                <div class="score-controls">
                    <button class="btn btn-icon" type="button">-</button>
                    <button class="btn btn-icon" type="button">+</button>
                </div>
            </div>
            <div class="col-span-2">
                <div class="ops-scoreboard">
                    <div class="ops-row">
                        <span class="ops-label">Crit:</span>
                        <span class="ops-value">{{ opsSummary.critOp }}</span>
                    </div>
                    <div class="ops-row">
                        <span class="ops-label">Tac:</span>
                        <span class="ops-value">{{ opsSummary.tacOp }}</span>
                    </div>
                    <div class="ops-row">
                        <span class="ops-label">P.Op:</span>
                        <span class="ops-value ops-dots">{{ opsSummary.primaryOp }}</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="board-tabs">
            <div class="score-name">PUNTI DI SVOLTA</div>
            <UTabs :items="operativeTabs" color="primary" variant="pill" size="sm" :ui="tabsUi" class="w-full">
                <template #content="{ item }">
                    <div class="points-card">
<!--                        <div class="operative-header">-->
<!--                            <span class="operative-name">{{ item.name }}</span>-->
<!--                            <span class="order-badge" :class="`order-${item.order.toLowerCase()}`">{{ item.order }}</span>-->
<!--                        </div>-->

                        <div class="wounds-section">
                            <div class="wounds-label-row">
                                <span class="wounds-label" >PUNTI CRIT OP</span>
                                <button class="btn btn-icon" type="button">-</button>
                                <button class="btn btn-icon" type="button">+</button>
                                <span class="wounds-value">{{ item.wounds }} / {{ item.maxWounds }}</span>
                            </div>
                            <UProgress
                                    :model-value="item.wounds"
                                    :max="item.maxWounds"
                                    :color="item.wounds === 0 ? 'error' : 'primary'"
                                    size="sm"
                            />
                            <div class="wounds-label-row">
                                <span class="wounds-label">PUNTI TAC OP</span>
                                <button class="btn btn-icon" type="button">-</button>
                                <button class="btn btn-icon" type="button">+</button>
                                <span class="wounds-value">{{ item.wounds }} / {{ item.maxWounds }}</span>
                            </div>
                            <UProgress
                                    :model-value="item.wounds"
                                    :max="item.maxWounds"
                                    :color="item.wounds === 0 ? 'error' : 'primary'"
                                    size="sm"
                            />
                            <div class="wounds-label-row">
                                <span class="wounds-label">PUNTI KILL OP</span>
                                <button class="btn btn-icon" type="button">-</button>
                                <button class="btn btn-icon" type="button">+</button>
                                <span class="wounds-value">{{ item.wounds }} / {{ item.maxWounds }}</span>
                            </div>
                            <UProgress
                                    :model-value="item.wounds"
                                    :max="item.maxWounds"
                                    :color="item.wounds === 0 ? 'error' : 'primary'"
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
                    <span id="reroll" class="nav-icon" :class="isInitiativeCardActive('reroll') ? 'color-icon' : ''">
                        <svg class="reroll-icon" viewBox="0 0 35 35" aria-hidden="true" focusable="false">
                            <use href="/icons/reroll.svg#reroll" />
                        </svg>
                    </span>
                    <span id="plus1" class="nav-icon" :class="isInitiativeCardActive('plus1') ? 'color-icon' : ''">+/- 1</span>
                    <span id="plus2" class="nav-icon" :class="isInitiativeCardActive('plus2') ? 'color-icon' : ''">+/- 2</span>
                    <span id="plus3" class="nav-icon" :class="isInitiativeCardActive('plus3') ? 'color-icon' : ''">+/- 3</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
// Mockup statico per testare lo stile della battle board: dati d'esempio,
// nessuna interazione reale collegata allo store (vedi task di styling).
const myScore = 21;
const opponentScore = 18;
const initiativeCardsStatus = [
    {id: 'reroll', value: true},
    {id: 'plus1', value: false},
    {id: 'plus2', value: true},
    {id: 'plus3', value: false},
]
const opsSummary = {
    critOp: 'Op Crit 1',
    tacOp: 'Op Tac 5',
    primaryOp: '* * * ',
};

const operatives = [
    {name: 'Operative Alpha', order: 'Engage', wounds: 2, maxWounds: 12, apl: 2, status: null, statusColor: null},
    {name: 'Operative Bravo', order: 'Conceal', wounds: 6, maxWounds: 11, apl: 2, status: 'Ferito', statusColor: 'warning'},
    {name: 'Operative Charlie', order: 'Engage', wounds: 9, maxWounds: 9, apl: 1, status: null, statusColor: null},
    {name: 'Operative Delta', order: 'Conceal', wounds: 0, maxWounds: 10, apl: 0, status: 'Abbattuto', statusColor: 'error'},
];

const operativeTabs = operatives.map((op, index) => ({
    label: String(index + 1),
    ...op,
}));

const tabsUi = {
    list: 'w-full',
    trigger: 'grow font-mono uppercase text-xs tracking-wide',
    content: 'mt-4',
};

function isInitiativeCardActive(id) {
    return initiativeCardsStatus.find(card => card.id === id).value === true;
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
    padding: 0.6rem 0.8rem;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.2rem;
}

.ops-row {
    display: flex;
    align-items: baseline;
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
}

.ops-dots {
    letter-spacing: 0.2em;
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

.nav-icon.color-icon {
    color: var(--accent-main);
}
</style>
