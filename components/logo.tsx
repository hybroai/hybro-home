interface LogoProps {
  className?: string
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={`flex items-center gap-0.5 -ml-2 ${className ?? ''}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- small static raster mark */}
      <img src="/logo-mark.png" alt="" width={28} height={28} className="mr-2.5 rounded-md" />
      <span
        className="hybro-logo-hy font-bold text-2xl"
        style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
      >
        HY
      </span>
      <span
        className="hybro-logo-bro font-bold text-2xl"
        style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
      >
        BRO
      </span>
    </div>
  )
}
