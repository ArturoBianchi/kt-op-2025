<script setup>
import {computed, onMounted, onUnmounted, ref, useTemplateRef} from "vue";
import {useCarouselStore} from "@/stores/carousels.js";

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
    carouselId: {
        type: String,
        required: true,
    },
    dots: {
        type: Boolean,
        default: false,
    },
    arrows: {
        type: Boolean,
        default: false,
    },
    autoHeight: {
        type: [Boolean, Object],
        default: false,
    },
})

const carouselUi = computed(() => ({
    item: 'p-1',
    ...(props.autoHeight ? {container: 'transition-[height] duration-200'} : {}),
}))

const carouselRef = useTemplateRef('carousel')
const carouselStore = useCarouselStore()
const isMeasurable = (container) => container.isConnected && container.offsetParent !== null
const watchResizeWhenVisible = (emblaApi) => isMeasurable(emblaApi.containerNode())
let slideObserver = null

// Risolve l'id salvato in un indice valido per l'attuale carouselItems.
// Senza <KeepAlive> il componente viene rimontato da zero ad ogni visita:
// il risultato va letto qui, prima che UCarousel/Embla venga costruito, e
// passato come start-index invece di essere applicato con uno scrollTo dopo
// il mount. Se l'id non è più presente (es. escluso da un futuro filtro) o
// la lista è vuota, si torna alla prima slide invece di andare fuori range.
const resolveIndexFromSavedId = () => {
    if (props.carouselItems.length === 0) {
        return 0
    }
    const savedId = carouselStore.getPosition(props.carouselId)
    const index = props.carouselItems.findIndex(item => item.id === savedId)
    
    return index === -1
            ? 0
            : index
}

// initialIndex è una costante non reattiva calcolata una sola volta: non va
// mai trasformata in un computed/ref derivato da lastIndex o dallo store,
// altrimenti ogni handleSelect (anche restando sulla stessa pagina)
// aggiornerebbe start-index e farebbe scattare il reInit interno di
// @nuxt/ui (Carousel.vue:99-101), corrompendo la slide in corso.
const initialIndex = resolveIndexFromSavedId()
const lastIndex = ref(initialIndex)

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


const handleSelect = (index) => {
    lastIndex.value = index
    carouselStore.setPosition(props.carouselId, props.carouselItems[index]?.id)
}

onMounted(() => {
    const embla = carouselRef.value?.emblaApi
    if (!embla) return
    slideObserver = new ResizeObserver(remeasureIfSlidesChanged)
    embla.on('reInit', observeSlides)
    observeSlides()

    // Rete di sicurezza: start-index dovrebbe già aver posizionato Embla
    // correttamente alla costruzione. Questo fallback interviene solo se
    // alcune slide non erano ancora misurabili in quel momento, per cui
    // Embla potrebbe aver ridotto/clampato start-index; il confronto usa
    // initialIndex (non lastIndex.value) per non correre contro il select
    // fantasma emesso da Embla/@nuxt/ui subito dopo il mount.
    requestAnimationFrame(() => {
        if (!embla || embla.selectedScrollSnap() === initialIndex) return
        // Snap collassati: il motore va rimisurato prima di poterci navigare.
        if (embla.scrollSnapList().length <= initialIndex) embla.reInit()
        embla.scrollTo(initialIndex, true)
    })
})

onUnmounted(() => {
    slideObserver?.disconnect()
    slideObserver = null
    carouselRef.value?.emblaApi?.off('reInit', observeSlides)
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
                :start-index="initialIndex"
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
