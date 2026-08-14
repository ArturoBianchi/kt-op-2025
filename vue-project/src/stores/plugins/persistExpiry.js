// Rolling-TTL persistence helper for Pinia stores.
//
// Session-scoped stores (e.g. battleSession) opt into this via
// `persist: { serializer: createExpiringSerializer(NINE_HOURS_MS) }`.
// The serialized payload is wrapped as `{ savedAt, value }`: `savedAt` is
// refreshed on every write (pinia-plugin-persistedstate re-serializes on
// every mutation), so data only expires after NINE_HOURS_MS of inactivity.
export const NINE_HOURS_MS = 9 * 60 * 60 * 1000

export function createExpiringSerializer(ttlMs) {
    return {
        serialize: (value) => JSON.stringify({savedAt: Date.now(), value}),
        deserialize: (raw) => {
            if (!raw) return {}
            try {
                const {savedAt, value} = JSON.parse(raw)
                if (!savedAt || Date.now() - savedAt > ttlMs) return {}
                return value ?? {}
            } catch {
                // Malformed JSON: treat as absent rather than throwing.
                return {}
            }
        },
    }
}

// Registry of session-scoped store keys (their persisted localStorage key,
// which defaults to the store's own $id) and their TTL. Keep this colocated
// with the serializer helper so the registry never drifts from the stores
// that actually use it.
const EXPIRING_STORES = [
    {key: 'battleSession', ttlMs: NINE_HOURS_MS},
]

// One-time boot sweep: removes any already-expired entries from
// localStorage before Pinia stores hydrate, so stale data never even gets
// transiently loaded into memory.
export function pruneExpiredStores() {
    EXPIRING_STORES.forEach(({key, ttlMs}) => {
        const raw = localStorage.getItem(key)
        if (!raw) return
        try {
            const {savedAt} = JSON.parse(raw)
            if (!savedAt || Date.now() - savedAt > ttlMs) {
                localStorage.removeItem(key)
            }
        } catch {
            // Corrupted entry: drop it rather than risk hydrating garbage.
            localStorage.removeItem(key)
        }
    })
}
