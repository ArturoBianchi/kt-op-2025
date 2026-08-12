<script setup>
import {computed, onActivated, ref, useTemplateRef} from "vue";

const props = defineProps({
    carouselItems: {
        type: Array,
        required: true,
        validator: items => {
            return items.every(item =>
                    item &&
                    typeof item.id === 'string' &&
                    (typeof item.component === 'string' ||   // tag nativo: 'img', 'div'
                            typeof item.component === 'object' ||   // SFC / defineComponent
                            typeof item.component === 'function') && // funzionale / async
                    (item.props === undefined || typeof item.props === 'object')
            )
        },
    },
    // Passthrough verso UCarousel: disattivati per default, così i caroselli
    // esistenti non cambiano aspetto.
    dots: {
        type: Boolean,
        default: false,
    },
    arrows: {
        type: Boolean,
        default: false,
    },
    // Adatta l'altezza del carosello alla slide visibile invece di usare
    // sempre quella della slide più alta.
    autoHeight: {
        type: [Boolean, Object],
        default: false,
    },
})

const carouselUi = computed(() => ({
    item: 'p-1',
    // Senza transizione il cambio di altezza fra slide è a scatti.
    ...(props.autoHeight ? {container: 'transition-[height] duration-200'} : {}),
}))

const lastIndex = ref(0);
const opsCarousel = useTemplateRef('carousel')

function onSelectEvent(item) {
    lastIndex.value = item;
}

onActivated(() => {
    const embla = opsCarousel.value?.emblaApi
    if (!embla) {
        console.warn("API Embla non trovata sulla ref del carosello.")
        return
    }
    if (lastIndex.value !== 0) {
        embla.scrollTo(lastIndex.value, true)
        console.log("Scrolling to last index:", lastIndex.value)
    }else{
        console.log("No last index to scroll to.")
    }
})

</script>

<template>
    <div class="centered-view" :class="{ 'has-dots': dots }">
        <UCarousel
                ref="carousel"
                v-slot="{ item }"
                :items="carouselItems"
                :dots="dots"
                :arrows="arrows"
                :auto-height="autoHeight"
                @select="onSelectEvent"
                class="w-full max-w-full mx-auto"
                :ui="carouselUi">
            <component :is="item.component" :key="item.id" v-bind="item.props ?? {}"/>
        </UCarousel>
    </div>
</template>

<style scoped>
.centered-view {
    display: flex;
    justify-content: center;
}

/* I dots di UCarousel sono in posizione assoluta a -1.75rem dal fondo della
   root: senza questo spazio finirebbero sopra il contenuto successivo. */
.centered-view.has-dots {
    margin-bottom: 2.5rem;
}
</style>
