<script setup>
import {RouterView} from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import AppMenu from './components/AppMenu.vue'
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import {useSwipe} from "@/composables/useSwipe.js";

const heroSection = ref(null)
const isAtBottom = ref(true)
const routedComponent = ref(null)
const route = useRoute()

let resizeObserver = null
let pendingChecks = []

const checkScroll = () => {
    const el = heroSection.value
    if (!el) return
    const { scrollTop, scrollHeight, clientHeight } = el
    // Se non c'e' nulla da scrollare non serve la dissolvenza in basso
    const scrollable = scrollHeight - clientHeight > 1
    // Use a small buffer (1px) to avoid precision issues
    isAtBottom.value = !scrollable || scrollTop + clientHeight >= scrollHeight - 1
}

// Dopo una rotazione (o quando la barra del browser si apre/chiude) le
// dimensioni non sono definitive subito: ricontrolla anche a layout assestato.
const scheduleCheck = () => {
    nextTick(checkScroll)
    pendingChecks.forEach(clearTimeout)
    pendingChecks = [
        setTimeout(checkScroll, 150),
        setTimeout(checkScroll, 400),
    ]
}

// Watch for route changes to re-check scroll
watch(route, scheduleCheck)

onMounted(() => {
    const el = heroSection.value
    if (!el) return

    el.addEventListener('scroll', checkScroll, { passive: true })
    window.addEventListener('resize', scheduleCheck)
    window.addEventListener('orientationchange', scheduleCheck)
    window.visualViewport?.addEventListener('resize', scheduleCheck)

    // Il contenuto cambia altezza anche senza cambio rotta (es. swipe fra le
    // sezioni delle regole): osserva scroller e contenuto.
    if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(checkScroll)
        resizeObserver.observe(el)
        if (el.firstElementChild) resizeObserver.observe(el.firstElementChild)
    }

    scheduleCheck()
})

onUnmounted(() => {
    heroSection.value?.removeEventListener('scroll', checkScroll)
    window.removeEventListener('resize', scheduleCheck)
    window.removeEventListener('orientationchange', scheduleCheck)
    window.visualViewport?.removeEventListener('resize', scheduleCheck)
    resizeObserver?.disconnect()
    resizeObserver = null
    pendingChecks.forEach(clearTimeout)
    pendingChecks = []
})

const { swipeHandlers } = useSwipe({
    onSwipeLeft: () => {
        if (routedComponent.value && routedComponent.value.swipeLeft) {
            routedComponent.value.swipeLeft()
        } else {
            console.log("Nessun'azione di swipe definita in questo componente.")
        }
    },
    onSwipeRight: () => {
        if (routedComponent.value && routedComponent.value.swipeRight) {
            routedComponent.value.swipeRight()
        } else {
            console.log("Nessun'azione di swipe definita in questo componente.")
        }
    },
})
</script>

<template>
    <div class="app-wrapper">
        <div class="app-container">
            <AppHeader />
            <AppMenu/>
            <div 
                ref="heroSection"
                class="hero-section swipe-area"
                :class="{ 'has-fade': !isAtBottom }"
                @pointerdown="swipeHandlers.onPointerDown"
                @pointerup="swipeHandlers.onPointerUp"
                @pointercancel="swipeHandlers.onPointerCancel"
                @touchstart="swipeHandlers.onPointerDown"
                @touchend="swipeHandlers.onPointerUp"
                @touchcancel="swipeHandlers.onPointerCancel"
            >
                <main class="container">
                    <router-view v-slot="{ Component }">
                        <component :is="Component" ref="routedComponent" />
                    </router-view>
                </main>
            </div>
        </div>
    </div>
</template>

<style>
.app-wrapper {
    font-family: var(--font-mono), serif;
    background-color: #0a0a0a;
}
</style>
