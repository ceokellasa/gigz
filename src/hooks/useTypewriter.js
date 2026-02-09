import { useState, useEffect } from 'react'

export function useTypewriter(text, speed = 50, delay = 0) {
    const [displayedText, setDisplayedText] = useState('')
    const [isComplete, setIsComplete] = useState(false)

    useEffect(() => {
        if (!text) return

        const timeout = setTimeout(() => {
            let currentIndex = 0
            setDisplayedText('')
            setIsComplete(false)

            const interval = setInterval(() => {
                if (currentIndex < text.length) {
                    setDisplayedText(text.slice(0, currentIndex + 1))
                    currentIndex++
                } else {
                    setIsComplete(true)
                    clearInterval(interval)
                }
            }, speed)

            return () => clearInterval(interval)
        }, delay)

        return () => clearTimeout(timeout)
    }, [text, speed, delay])

    return { displayedText, isComplete }
}
