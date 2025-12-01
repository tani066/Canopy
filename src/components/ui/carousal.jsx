import { useEffect, useState, useRef } from 'react';

export default function Carousel({ images = [], delay = 2500, className = '', height = 160 }) {
  const [i, setI] = useState(0)
  const [hover, setHover] = useState(false)
  const ref = useRef(null)
  const safeImages = Array.isArray(images) ? images.filter(Boolean) : []

  useEffect(() => {
    if (safeImages.length <= 1) return
    const t = setInterval(() => {
      if (!hover) setI(prev => (prev + 1) % safeImages.length)
    }, delay)
    return () => clearInterval(t)
  }, [safeImages.length, delay, hover])

  const src = safeImages[i]
  if (!src) return null

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`relative overflow-hidden ${className}`}
      style={{ height: `${height}px` }}
    >
      <img src={src} alt="carousel" className="w-full h-full object-cover" />
      {safeImages.length > 1 ? (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 bg-black/20 rounded-full px-2 py-1">
          {safeImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              className={`h-2 w-2 rounded-full ${i === idx ? 'bg-white' : 'bg-white/50'}`}
              aria-label={`Go to image ${idx + 1}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
