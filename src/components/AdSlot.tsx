import { useEffect, useRef, useState } from 'react'
import type { Locale } from '../i18n/translations'

const adKey =
  import.meta.env.VITE_ADSTERRA_BANNER_KEY?.trim() ||
  '7b66911524eb07aa8f8811f3a1672d5c'
const adHost =
  import.meta.env.VITE_ADSTERRA_BANNER_HOST?.trim() ||
  'pl31358934.profitableratecpmnetwork.com'

export function AdSlot({ locale }: { locale: Locale }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = containerRef.current
    if (!node || !adKey || !adHost) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '160px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  if (!adKey || !adHost) return null

  const label = locale === 'zh' ? '广告' : 'Advertisement'
  const source = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;overflow:hidden;font-family:system-ui,sans-serif"><script async data-cfasync="false" src=${JSON.stringify(`https://${adHost}/${adKey}/invoke.js`)}></script><div id="container-${adKey}"></div></body></html>`

  return (
    <aside
      ref={containerRef}
      aria-label={label}
      className="mb-6 overflow-hidden rounded-xl border border-slate-200 bg-white/70 px-2 py-2 text-center"
    >
      <span className="mb-1 block text-[10px] tracking-wide text-slate-400">{label}</span>
      {visible ? (
        <iframe
          title={label}
          srcDoc={source}
          width="900"
          height="180"
          loading="lazy"
          sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
          className="mx-auto block max-w-full border-0"
        />
      ) : (
        <div aria-hidden="true" className="mx-auto h-[180px] max-w-[900px]" />
      )}
    </aside>
  )
}
