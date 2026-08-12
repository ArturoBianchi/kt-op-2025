<template>
        <div class="centered-view" style="height: 100%; align-content: center;">
            <h1>WORK</h1>
            <h1>IN</h1>
            <h1>PROGRESS</h1>
<!--            <div class="scoreboard">-->
<!--                <div class="score-player ally">-->
<!--                    <div class="score-name">You</div>-->
<!--                    <div class="score-value">{{myScore}}</div>-->
<!--                    <div class="score-controls">-->
<!--                        <button class="btn btn-icon" @click="myScore&#45;&#45;">-</button>-->
<!--                        <button class="btn btn-icon" @click="myScore++">+</button>-->
<!--                    </div>-->
<!--                </div>-->
<!--                <div class="score-player">-->
<!--                    <div class="score-name">Opponent</div>-->
<!--                    <div class="score-value">{{ opponentScore }}</div>-->
<!--                    <div class="score-controls">-->
<!--                        <button class="btn btn-icon" @click="opponentScore&#45;&#45;">-</button>-->
<!--                        <button class="btn btn-icon" @click="opponentScore++">+</button>-->
<!--                    </div>-->
<!--                </div>-->
<!--            </div>-->
        </div>
</template>

<script setup>
import {onMounted, ref} from "vue";

const props = defineProps({});
const myScore = ref(0);
const opponentScore = ref(0);

onMounted(() => {
    console.log("Mounted");
    console.log("Actual scores: ", myScore.value, opponentScore.value);
});


</script>

<style scoped>

</style>
