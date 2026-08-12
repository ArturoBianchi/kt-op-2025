<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
    <nav class="menu">
        <ul class="nav-list">
            <li class="nav-item">
                <RouterLink to="/" active-class="active">
                    <span class="nav-icon material-symbols-outlined">description</span>
                    <span class="nav-text">Regole</span>
                </RouterLink>
            </li>
            <li class="nav-item">
                <RouterLink to="/ops" active-class="active">
                    <span class="nav-icon material-symbols-outlined">target</span>
                    <span class="nav-text">Ops</span>
                </RouterLink>
            </li>
            <li class="nav-item">
                <RouterLink to="/battle" active-class="active">
                    <span class="nav-icon material-symbols-outlined">swords</span>
                    <span class="nav-text">Battle</span>
                </RouterLink>
            </li>
        </ul>
    </nav>
</template>

<style scoped>
.menu {
    /* il menu sta in alto sotto l'header: nessun inset bottom qui,
       con viewport-fit=cover aggiungerebbe spazio morto inutile */
    padding: 0.5rem 0.8rem;
    position: relative;
    z-index: 1000;
    margin: 0;
    flex-shrink: 0;
    background-color: var(--bg-surface);
    -webkit-tap-highlight-color: transparent;
}

.nav-text {
    font-size: 0.65rem;
}

.nav-list {
    list-style: none;
    padding: 0;
    display: flex;
    justify-content: space-around;
    align-items: center;
    max-width: 600px;
    margin: 0 auto;
}

.nav-item {
    flex: 1;
    text-align: center;
}

.menu a {
    text-decoration: none;
    color: var(--text-secondary);
    font-weight: bold;
    padding: 0.4rem 0.2rem;
    border-top: 3px solid transparent;
    border-radius: var(--radius);
    font-family: var(--font-mono),serif;
    text-transform: uppercase;
    font-size: 0.8rem;
    transition: var(--transition);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.2rem;
}

.nav-icon {
    font-size: 1.4rem;
    margin-bottom: 2px;
}

.menu a:hover {
    color: var(--text-primary);
}

.menu a.active {
    color: var(--accent-main);
    border-radius: 0.5rem;
}

.menu a.active .nav-icon {
    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    transform: scale(1.1);
    transition: all 0.2s ease;
}

.nav-text {
    font-size: 0.7rem;
}

@media (min-width: 601px) {
    .nav-text {
        font-size: 0.9rem;
    }
    .menu a {
        font-size: 0.9rem;
        flex-direction: row;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
    }
    
    .nav-icon {
        font-size: 1.2rem;
    }
}

/* Menu compatto su schermi bassi (telefono in orizzontale).
   Dopo il blocco min-width cosi' vince anche in landscape su schermi larghi. */
@media (max-height: 500px) {
    .menu {
        padding: 0.15rem 0.8rem;
    }

    .menu a {
        flex-direction: row;
        gap: 0.4rem;
        padding: 0.2rem 0.5rem;
    }

    .nav-icon {
        font-size: 1.1rem;
        margin-bottom: 0;
    }
}
</style>
