<script setup>
import logoImg from '../../../public/logo.svg'

defineProps({
    title: {
        type: String,
        default: 'Kill Team Battle Companion'
    }
})
</script>

<template>
    <header class="navbar custom-padding">
        <div class="logo-container">
            <img :src="logoImg" alt="Logo" class="logo"/>
        </div>
        <h1 class="title">{{ title }}</h1>
    </header>
</template>

<style scoped>
.logo {
    justify-content: left;
    height: 40px;
    display: block;
}

.logo-container {
    flex-shrink: 0;
}

.custom-padding{
    padding: 0.5rem 0.5rem 0 0.5rem;
    padding-top: calc(0.5rem + env(safe-area-inset-top, 0px));
}

/* Header compatto quando lo schermo e' basso (telefono in orizzontale):
   il logo da 80px si mangerebbe meta' viewport */
@media (max-height: 500px) {
    .logo {
        height: 40px;
    }

    .custom-padding {
        padding: 0.25rem 0.5rem 0 0.5rem;
        padding-top: calc(0.25rem + env(safe-area-inset-top, 0px));
    }
}
</style>
