import { useState, useEffect } from 'react'
import Confetti from 'react-confetti'

export default function ConfettiCelebration({ trigger = false, duration = 3000 }) {
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (trigger) {
      setShowConfetti(true)
      const timer = setTimeout(() => setShowConfetti(false), duration)
      return () => clearTimeout(timer)
    }
  }, [trigger, duration])

  if (!showConfetti) return null

  return (
    <Confetti
      width={window.innerWidth}
      height={window.innerHeight}
      numberOfPieces={200}
      recycle={false}
    />
  )
}
