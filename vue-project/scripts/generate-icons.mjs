/**
 * Genera le icone PNG della PWA da public/logo.svg.
 * Uso: npm run icons  (da rilanciare solo se cambia il logo)
 *
 * I PNG prodotti vengono committati: la CI non deve rigenerarli.
 * Requisiti: .requirements/PWA-REQUIREMENTS.md -> ICONS
 */
import sharp from 'sharp'
import { readFile, mkdir } from 'node:fs/promises'
import { fileURLToPath, URL } from 'node:url'

const BG = '#121212' // --bg-app, deve combaciare con background_color del manifest

// Il disegno del logo occupa x,y da 5 a 195, ma il viewBox e' 0 0 200 230:
// i 35 punti di altezza in eccesso sono spazio vuoto in basso e, in un canvas
// quadrato, spingerebbero il logo fuori centro. Riquadriamo su 200x200 (il
// contenuto resta centrato con un margine del 2.5% per lato) e diamo dimensioni
// esplicite, altrimenti il rasterizzatore non sa a che risoluzione renderizzare.
const squareSvg = async (px) => {
    const src = await readFile(new URL('../public/logo.svg', import.meta.url), 'utf8')
    return Buffer.from(
        src
            .replace('viewBox="0 0 200 230"', 'viewBox="0 0 200 200"')
            .replace('width="100%" height="100%"', `width="${px}" height="${px}"`)
    )
}

/** Icona "any": il logo riempie il quadrato, con il fondo del tema dietro. */
const plain = async (size, out) => {
    await sharp(await squareSvg(size * 2))
        .resize(size, size, { fit: 'contain', background: BG })
        .flatten({ background: BG })
        .png()
        .toFile(out)
}

/**
 * Icona "maskable": Android ritaglia le icone adattive a cerchio/squircle e
 * garantisce solo il cerchio centrale con diametro pari all'80% del lato.
 * A scala 0.78 le punte del mirino cadono appena dentro quel cerchio.
 */
const maskable = async (size, out) => {
    const inner = Math.round(size * 0.78)
    const logo = await sharp(await squareSvg(inner * 2))
        .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer()

    await sharp({ create: { width: size, height: size, channels: 4, background: BG } })
        .composite([{ input: logo, gravity: 'center' }])
        .png()
        .toFile(out)
}

const iconsDir = fileURLToPath(new URL('../public/icons/', import.meta.url))
await mkdir(iconsDir, { recursive: true })

await plain(192, `${iconsDir}icon-192.png`)
await plain(512, `${iconsDir}icon-512.png`)
await maskable(512, `${iconsDir}icon-maskable-512.png`)

console.log('Icone generate in public/icons/')
