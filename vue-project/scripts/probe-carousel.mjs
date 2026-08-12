// Sonda temporanea: misura via CDP l'altezza applicata da autoHeight rispetto
// all'altezza naturale delle slide, seguendo il flusso dell'utente.
// Uso: node scripts/probe-carousel.mjs [porta-vite]
const VITE_PORT = process.argv[2] ?? '5173'
const CDP_PORT = 9333

const sleep = ms => new Promise(r => setTimeout(r, ms))

async function targets() {
    const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`)
    return res.json()
}

let id = 0
function rpc(ws, method, params = {}) {
    const msgId = ++id
    return new Promise((resolve, reject) => {
        const onMsg = ev => {
            const msg = JSON.parse(ev.data)
            if (msg.id !== msgId) return
            ws.removeEventListener('message', onMsg)
            msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result)
        }
        ws.addEventListener('message', onMsg)
        ws.send(JSON.stringify({id: msgId, method, params}))
    })
}

async function evaluate(ws, expression) {
    const {result, exceptionDetails} = await rpc(ws, 'Runtime.evaluate', {
        expression, returnByValue: true, awaitPromise: true,
    })
    if (exceptionDetails) throw new Error(exceptionDetails.exception?.description ?? 'eval failed')
    return result.value
}

// Confronta cio' che autoHeight ha applicato al container con l'altezza reale
// della slide visibile, e con le misure che Embla ha in pancia.
const MEASURE = `(() => {
  const viewport = document.querySelector('[aria-roledescription="carousel"] > div')
  if (!viewport) return {error: 'carosello non trovato'}
  const container = viewport.firstElementChild
  const slides = [...container.children]
  const api = window.__embla
  const engine = api?.internalEngine()
  const index = api ? api.selectedScrollSnap() : -1
  const slide = slides[index]
  return {
    index,
    snaps: api ? api.scrollSnapList().length : -1,
    containerStyleHeight: container.style.height,
    containerOffsetHeight: container.offsetHeight,
    visibleSlideNaturalHeight: slide ? slide.offsetHeight : null,
    engineSlideRectHeights: engine ? engine.slideRects.map(r => Math.round(r.height)) : null,
    naturalSlideHeights: slides.map(s => s.offsetHeight),
    clippedBy: slide ? slide.offsetHeight - container.offsetHeight : null,
  }
})()`

const report = (label, m) => {
    if (m.error) return console.log(`\n## ${label}\n  ${m.error}`)
    const verdict = m.clippedBy > 0.5 ? `TAGLIATA di ${m.clippedBy}px` : 'ok'
    console.log(`\n## ${label}`)
    console.log(`  slide ${m.index} / ${m.snaps} snap  -> ${verdict}`)
    console.log(`  container: style=${m.containerStyleHeight || '(nessuno)'} offset=${m.containerOffsetHeight}`)
    console.log(`  altezza naturale slide visibile: ${m.visibleSlideNaturalHeight}`)
    console.log(`  misure Embla:   ${JSON.stringify(m.engineSlideRectHeights?.slice(0, 8))}`)
    console.log(`  altezze reali:  ${JSON.stringify(m.naturalSlideHeights?.slice(0, 8))}`)
}

const ws = new WebSocket((await targets()).find(t => t.type === 'page').webSocketDebuggerUrl)
await new Promise(r => ws.addEventListener('open', r))
await rpc(ws, 'Runtime.enable')
await rpc(ws, 'Page.enable')
await rpc(ws, 'Emulation.setDeviceMetricsOverride', {
    width: 400, height: 620, deviceScaleFactor: 2, mobile: true,
})

// 1. Primo caricamento della pagina ops.
await rpc(ws, 'Page.navigate', {url: `http://127.0.0.1:${VITE_PORT}/#/ops`})
await sleep(3500)
// Aggancia l'API Embla per poterla interrogare dalle valutazioni successive.
await evaluate(ws, `(() => {
  const root = document.querySelector('[aria-roledescription="carousel"]')
  const vnode = root.__vueParentComponent
  let inst = vnode
  while (inst && !inst.exposed?.emblaApi) inst = inst.parent
  window.__embla = inst?.exposed?.emblaApi?.value ?? inst?.exposed?.emblaApi
  return !!window.__embla
})()`)
report('primo caricamento, slide 0', await evaluate(ws, MEASURE))

// 2. Vai su una slide alta (la 3 = TRASMISSIONE dello screenshot).
await evaluate(ws, `window.__embla.scrollTo(2, true), 'ok'`)
await sleep(600)
report('dopo scrollTo(2)', await evaluate(ws, MEASURE))

// 3. Cambia pagina e torna: e' il flusso che rompeva tutto.
await evaluate(ws, `(location.hash = '#/'), 'ok'`)
await sleep(1200)
await evaluate(ws, `(location.hash = '#/ops'), 'ok'`)
await sleep(1200)
report('rientro su /ops', await evaluate(ws, MEASURE))

// 4. Simula un cambio di altezza dei contenuti a carosello gia' inizializzato
//    (e' cio' che fa lo swap dei webfont Google, che arrivano dopo l'init).
await evaluate(ws, `(() => {
  const s = document.createElement('style')
  s.textContent = '.op-card p { line-height: 2.2 !important; }'
  document.head.appendChild(s)
  return 'ok'
})()`)
await sleep(1200)
report('dopo cambio altezza contenuti (simula swap font)', await evaluate(ws, MEASURE))

ws.close()
