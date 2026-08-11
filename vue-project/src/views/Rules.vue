<template>
    <div class="centered-view">
        <h1>SEQUENZA DI GIOCO</h1>
        <div v-show="swipeCount === 0">
            <h3>PREPARARE LA BATTAGLIA</h3>
            <p >Ogni giocatore seleziona un Kill Team per la battaglia.</p>
            <p>Determina la killzone e posiziona gli elementi di terreno. Assicurati che i tipi
                di terreno siano specificati.</p>
            <p>Determina una crit op condivisa e posiziona i segnalini obiettivo. Tranne
                che in Killzone: Bheta-Decima, tutti i segnalini obiettivo devono essere
                posizionati sul pavimento della killzone.</p>
            <p>Spareggio: il vincitore decide chi ha l'iniziativa.</p>
            <p>Il giocatore con l'iniziativa seleziona una zona di lancio (drop zone). Il suo
                avversario prende l'altra zona di lancio e ottiene la carta iniziativa Ritiro
                (Re-roll).</p>
        </div>
        <div v-show="swipeCount === 1">
            <h3>SELEZIONARE GLI AGENTI</h3>
            <p>Ogni giocatore seleziona segretamente i propri agenti per la battaglia,
                aderendo ai requisiti di selezione nelle regole del proprio Kill Team.
                Successivamente, rivelano le loro selezioni simultaneamente.</p>
            <p>Ogni giocatore seleziona segretamente fino a quattro opzioni di
                equipaggiamento. Ciascuna opzione non può essere selezionata più di una
                volta per giocatore. Successivamente, rivelano le loro selezioni
                simultaneamente</p>
            <p>Determina una crit op condivisa e posiziona i segnalini obiettivo. Tranne
                che in Killzone: Bheta-Decima, tutti i segnalini obiettivo devono essere
                posizionati sul pavimento della killzone.</p>
            <p>Ogni giocatore inizia con 2CP.</p>
            <p>Ogni giocatore seleziona segretamente una tac op da uno degli archetipi
                del proprio Kill Team (Infiltrazione, Ricognizione, Sicurezza o Ricerca &
                Distruzione), come specificato nelle regole del proprio Kill Team.</p>
        </div>
        <div v-show="swipeCount === 2">
            <h3>SCHIERAMENTO</h3>
            <p>Ogni giocatore si alterna nello schierare un elemento di equipaggiamento
                che viene schierato prima della battaglia (scale, ecc.), partendo dal
                giocatore con l'iniziativa. Nota che è elemento per elemento, non opzione
                per opzione</p>
            <p>Ogni giocatore si alterna nello schierare un terzo del proprio Kill Team
                (arrotondando per eccesso), partendo dal giocatore con l'iniziativa. Quando
                un giocatore schiera un agente, questo deve essere interamente
                all'interno della propria zona di lancio e deve ricevere un ordine di
                Occultamento (Conceal).</p>
        </div>
        <div v-show="swipeCount === 3 || swipeCount === 4">
            <h3>GIOCARE LA BATTAGLIA</h3>
            <div v-if="swipeCount === 3">
                <h3 style="text-align: center; color: var(--text-secondary)">(pt. 1)</h3>
                <p>Per determinare l'iniziativa durante ogni punto di svolta (incluso il primo), i
                    giocatori effettuano un lancio di dado (ma non ritirano i pareggi). Partendo
                    dal chi ha perso il lancio, ogni giocatore si alterna scegliendo se utilizzare una
                    carta iniziativa per alterare il risultato del proprio lancio o passando, finché
                    entrambi non passano in successione.</p>
                <p>Se uno o più giocatori dovessero usare le regole del proprio kill team per
                    influenzare il lancio del dado, devono farlo prima di giocare le carte iniziativa,
                    partendo dal giocatore che sta perdendo il lancio di dado.</p>
                <p> Determina una crit op condivisa e posiziona i segnalini obiettivo. Tranne
                    che in Killzone: Bheta-Decima, tutti i segnalini obiettivo devono essere
                    posizionati sul pavimento della killzone.</p>
                <p> Spareggio: il vincitore decide chi ha l'iniziativa.</p>
                <p class="no-bullet">N.B: La carta iniziativa Ritiro (Re-roll) permette al giocatore di ritirare il proprio
                    lancio di iniziativa. Le restanti carte iniziativa modificano il risultato del
                    lancio in alto o in basso (questo può portarlo sopra il 6 o sotto l'1). Ad
                    esempio, se un giocatore lancia un 5 e gioca la carta iniziativa +2/-2, può
                    modificare il risultato in 3 o 7. Se un giocatore usa la carta iniziativa Ritiro
                    dopo aver modificato il risultato del lancio, il nuovo risultato sostituisce le
                    modifiche utilizzate finora.</p>
            </div>
            <div v-else>
                <h3 style="text-align: center; color: var(--text-secondary)">(pt. 2)</h3>
                <p>Il vincitore del lancio decide chi ha l'iniziativa. Escluso il 4° punto di
                    svolta, il perdente ottiene una carta iniziativa pari al numero del
                    turno in corso (es. nel turno 2 prende +2/-2). In caso di pareggio,
                    vince chi NON ha l'iniziativa (ma il perdente ottiene comunque la
                    carta).</p>
                <p>Come <b style="color: var(--accent-important)">Azzardo Strategico</b> nel 1° punto di svolta, ogni giocatore
                    seleziona in segreto una delle sue 3 op (Crit, Kill o Tac) come <b style="color: var(--accent-important)">OP. PRIMARIA</b></p>
                <p>Ogni giocatore può ottenere un max di 6 PV da ogni op.</p>
            </div>
        </div>
        <div v-show="swipeCount === 5">
            <h3>FINE DELLA BATTAGLIA</h3>
            <p>La partita finisce dopo 4 punti di svolta. Se un giocatore resta
            senza operativi, l'altro gioca i turni rimanenti.</p>
            <p>Alla fine, i giocatori rivelano simultaneamente le op primarie.
            Ottengono PV aggiuntivi pari alla metà (arrotondata per eccesso)
            dei PV ottenuti da quella op durante la partita.</p>
            <p>Il giocatore con più PV vince. Altrimenti è un pareggio.</p>
        </div>
    </div>
</template>

<script setup>
//----IMPORTS
import {ref} from "vue";
const swipeCount = ref(0)

function swipeLeft(){
    if(swipeCount.value !== 5){
        swipeCount.value++
    }
}

function swipeRight(){
    if(swipeCount.value !== 0){
        swipeCount.value--
    }
}

defineExpose({
    swipeLeft,
    swipeRight
})
</script>

<style scoped>
.centered-view {
    text-align: center;
}

p {
    text-align: left;
    margin: 1.2em 0;
    line-height: 1.4;
}

p:not(.no-bullet) {
    position: relative;
    padding-left: 1.5rem;
}

p:not(.no-bullet)::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0.4em;
    width: 0.6rem;
    height: 0.6rem;
    background-color: var(--accent-main);
    border-radius: 50%;
    box-shadow: 0 0 8px var(--accent-main-dim);
}
</style>
