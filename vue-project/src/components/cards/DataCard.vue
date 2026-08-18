<script setup>
defineProps({
    pinData: {
        type: [Object, String, Number],
        default: null
    }
});

// Placeholder for the future "pinned data cards" store: swap the console.log
// for a real store call later without touching the button markup.
function handlePin(pinData) {
    console.log(pinData);
}
</script>

<template>
    <div class="data-card card-gradient-background">
        <UButton
                icon="i-lucide-pin"
                color="neutral"
                variant="ghost"
                size="xs"
                class="pin-button"
                @click="handlePin(pinData)"
        />
        <slot />
    </div>
</template>

<style scoped>
.data-card {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    border-radius: 0.6rem;
    padding: 0.5rem;
    padding-top: 1.5rem;
    padding-right: 2.25rem;
    width: auto;
    text-align: left;
}

.pin-button {
    position: absolute;
    top: 0.25rem;
    right: 0.25rem;
}
</style>
