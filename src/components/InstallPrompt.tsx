'use client'
import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallPrompt() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [show, setShow] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Dismissed before — don't show again for 7 days
    const dismissed = localStorage.getItem('fc_install_dismissed')
    if (dismissed && Date.now() - parseInt(dismissed) < 7 * 24 * 60 * 60 * 1000) return

    // iOS detection
    const ua = navigator.userAgent
    const ios = /iphone|ipad|ipod/i.test(ua) && !(window as unknown as Record<string, unknown>).MSStream
    if (ios) {
      // Only show on Safari (Chrome on iOS can't install PWAs)
      const safari = /safari/i.test(ua) && !/crios|fxios/i.test(ua)
      if (safari) { setIsIOS(true); setShow(true) }
      return
    }

    // Android/Chrome — listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e as BeforeInstallPromptEvent)
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!prompt) return
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setShow(false)
    setPrompt(null)
  }

  const handleDismiss = () => {
    localStorage.setItem('fc_install_dismissed', Date.now().toString())
    setShow(false)
  }

  if (!show || isInstalled) return null

  return (
    <div className="fixed bottom-24 left-4 right-4 sm:left-auto sm:right-20 sm:w-80 z-40
                    bg-[#0F172A] border border-[#D4AF37]/40 rounded-2xl p-4 shadow-2xl
                    shadow-black/50 animate-in slide-in-from-bottom-4">
      <div className="flex items-start gap-3">
        {/* Icon */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon-96x96.png" alt="Faith Compass" className="w-12 h-12 rounded-xl shrink-0" />

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white mb-0.5">Add to Home Screen</p>
          <p className="text-xs text-white/50 leading-relaxed">
            {isIOS
              ? 'Tap the Share button below, then "Add to Home Screen" to install Faith Compass.'
              : 'Install Faith Compass for quick access — works offline too.'}
          </p>

          {!isIOS && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleInstall}
                className="flex-1 bg-[#1E40AF] text-white py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
              >
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-1.5 rounded-lg text-xs text-white/40 hover:text-white/70 hover:bg-white/5 transition"
              >
                Not now
              </button>
            </div>
          )}

          {isIOS && (
            <div className="flex items-center gap-2 mt-3">
              <span className="text-lg">⬆️</span>
              <span className="text-xs text-[#D4AF37]">Tap Share → Add to Home Screen</span>
              <button onClick={handleDismiss} className="ml-auto text-white/30 hover:text-white/60 transition text-lg leading-none">×</button>
            </div>
          )}
        </div>

        {isIOS && (
          <button onClick={handleDismiss} className="text-white/30 hover:text-white/60 transition text-xl leading-none shrink-0">×</button>
        )}
      </div>
    </div>
  )
}
