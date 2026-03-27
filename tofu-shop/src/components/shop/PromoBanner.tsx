'use client'
import { useEffect, useState } from 'react'

interface Banner { id: string; text: string }

export default function PromoBanner({ banners }: { banners: Banner[] }) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (banners.length <= 1) return
    const timer = setInterval(() => {
      setCurrent(i => (i + 1) % banners.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [banners.length])

  if (banners.length === 0) return null

  return (
    <div style={{ background: '#c8973a' }} className="w-full py-2.5 px-4 text-center relative overflow-hidden">
      <p className="text-[#2c1f0e] text-sm font-bold tracking-wide transition-opacity duration-500">
        {banners[current].text}
      </p>
      {banners.length > 1 && (
        <div className="flex justify-center gap-1 mt-1.5">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${i === current ? 'bg-[#2c1f0e]' : 'bg-[#2c1f0e]/30'}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
