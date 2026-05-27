import { useSpring, animated } from '@react-spring/web'
import { useEffect, useState } from 'react'

export default function AnimatedNumber({ value, duration = 1000, suffix = '' }) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    setDisplayValue(value)
  }, [value])

  const spring = useSpring({
    from: { number: 0 },
    to: { number: displayValue },
    config: { duration },
    reset: false
  })

  return (
    <animated.span>
      {spring.number.to(n => Math.floor(n).toString() + suffix)}
    </animated.span>
  )
}
