export function useSwipe(options = {}) {
    const {
        onSwipeLeft,
        onSwipeRight,
        onSwipeUp,
        onSwipeDown,
        minDistance = 50,
        maxVerticalDistance = 80,
    } = options

    let startPoint = null

    function onPointerDown(event) {
        startPoint = {
            x: event.clientX || (event.touches && event.touches[0].clientX),
            y: event.clientY || (event.touches && event.touches[0].clientY),
        }
    }

    function onPointerUp(event) {
        if (!startPoint) return

        const endPoint = {
            x: event.clientX || (event.changedTouches && event.changedTouches[0].clientX),
            y: event.clientY || (event.changedTouches && event.changedTouches[0].clientY),
        }

        const diffX = endPoint.x - startPoint.x
        const diffY = endPoint.y - startPoint.y

        startPoint = null

        const absX = Math.abs(diffX)
        const absY = Math.abs(diffY)

        // Threshold logic
        if (absX < minDistance && absY < minDistance) {
            return
        }

        if (absX > absY) {
            // Horizontal swipe
            if (absY > maxVerticalDistance) {
                return // Too much vertical movement for a horizontal swipe
            }

            if (diffX > 0) {
                onSwipeRight?.(event)
            } else {
                onSwipeLeft?.(event)
            }
        } else {
            // Vertical swipe
            if (diffY > 0) {
                onSwipeDown?.(event)
            } else {
                onSwipeUp?.(event)
            }
        }
    }

    function onPointerCancel() {
        startPoint = null
    }

    const swipeHandlers = {
        onPointerDown: onPointerDown,
        onPointerUp: onPointerUp,
        onPointerCancel: onPointerCancel,
    }

    return {
        onPointerDown,
        onPointerUp,
        onPointerCancel,
        swipeHandlers,
    }
}