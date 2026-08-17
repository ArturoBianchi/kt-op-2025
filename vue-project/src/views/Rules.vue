<template>
    <div class="centered-view">
<!--        <h1>SEQUENZA DI GIOCO</h1>-->
        <KTCarousel carousel-id="rules" :carouselItems="carouselItems" :auto-height="false"/>
    </div>
</template>

<script setup>
import rulesData from '@/properties/rules/game.json'
import RuleCard from '@/components/cards/RuleCard.vue'

const carouselItems = rulesData.sections.map(section => ({
    id: section.id,
    component: RuleCard,
    props: section,
}))

</script>

<style scoped>

</style>
