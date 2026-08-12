<script setup>
import {computed, onActivated, onMounted, onUnmounted, ref, useTemplateRef} from "vue";

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

const carouselRef = useTemplateRef('carousel')
const lastIndex = ref(0)

const isMeasurable = (container) => container.isConnected && container.offsetParent !== null

const watchResizeWhenVisible = (emblaApi) => isMeasurable(emblaApi.containerNode())

let slideObserver = null

const remeasureIfSlidesChanged = () => {
    const embla = carouselRef.value?.emblaApi
    if (!embla || !isMeasurable(embla.containerNode())) return
    const {slideRects} = embla.internalEngine()
    const stale = embla.slideNodes()
            .some((node, i) => Math.abs(node.offsetHeight - (slideRects[i]?.height ?? 0)) >= 0.5)
    if (stale) embla.reInit()
}

const observeSlides = () => {
    const embla = carouselRef.value?.emblaApi
    if (!embla || !slideObserver) return
    slideObserver.disconnect()
    embla.slideNodes().forEach(node => slideObserver.observe(node))
}

onMounted(() => {
    const embla = carouselRef.value?.emblaApi
    if (!embla) return
    slideObserver = new ResizeObserver(remeasureIfSlidesChanged)
    embla.on('reInit', observeSlides)
    observeSlides()
})

onUnmounted(() => {
    slideObserver?.disconnect()
    slideObserver = null
    carouselRef.value?.emblaApi?.off('reInit', observeSlides)
})

const handleSelect = (index) => {
    lastIndex.value = index
}

onActivated(() => {
    // Rete di sicurezza: la posizione dovrebbe essere già corretta, ma se
    // qualcosa l'ha comunque persa si torna sulla slide da cui si era usciti.
    requestAnimationFrame(() => {
        const embla = carouselRef.value?.emblaApi
        if (!embla || embla.selectedScrollSnap() === lastIndex.value) return
        // Snap collassati: il motore va rimisurato prima di poterci navigare.
        if (embla.scrollSnapList().length <= lastIndex.value) embla.reInit()
        embla.scrollTo(lastIndex.value, true)
    })
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
                :watch-resize="watchResizeWhenVisible"
                class="w-full max-w-full mx-auto"
                :ui="carouselUi"
                @select="handleSelect">
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
