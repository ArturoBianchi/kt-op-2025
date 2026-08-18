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


.centered-view.has-dots {
    margin-bottom: 2.5rem;
}
</style>
