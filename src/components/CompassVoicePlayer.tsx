'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import VoiceSelector, { VOICES } from './VoiceSelector'

type PlayerState = 'idle' | 'loading' | 'playing' | 'paused' | 'error'

function formatTime(s: number) {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

export default function CompassVoicePlayer({
  text,
  defaultVoice,
  onVoiceChange,
}: {
  text: string
  defaultVoice: string
  onVoiceChange: (voiceId: string) => void
}) {
  const [state, setState] = useState<PlayerState>('idle')
  const [voice, setVoice] = useState(defaultVoice)
  const [showSelector, setShowSelector] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const blobUrlRef = useRef<string | null>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  // Reset when text changes
  useEffect(() => {
    setState('idle')
    setCurrentTime(0)
    setDuration(0)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current)
      blobUrlRef.current = null
    }
  }, [text])

  const fetchAndPlay = useCallback(async () => {
    setState('loading')
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice }),
      })
      if (!res.ok) { setState('error'); return }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current)
      blobUrlRef.current = url

      const audio = new Audio(url)
      audioRef.current = audio

      audio.addEventListener('loadedmetadata', () => setDuration(audio.duration))
      audio.addEventListener('timeupdate', () => setCurrentTime(audio.currentTime))
      audio.addEventListener('ended', () => setState('idle'))
      audio.addEventListener('error', () => setState('error'))

      await audio.play()
      setState('playing')
    } catch {
      setState('error')
    }
  }, [text, voice])

  const togglePlayPause = () => {
    if (state === 'idle' || state === 'error') {
      fetchAndPlay()
    } else if (state === 'playing' && audioRef.current) {
      audioRef.current.pause()
      setState('paused')
    } else if (state === 'paused' && audioRef.current) {
      audioRef.current.play()
      setState('playing')
    }
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    audioRef.current.currentTime = ratio * duration
    setCurrentTime(ratio * duration)
  }

  const handleVoiceSelect = (id: string) => {
    setVoice(id)
    onVoiceChange(id)
    // If audio was playing, reset so next play uses new voice
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current)
      blobUrlRef.current = null
    }
    setState('idle')
    setCurrentTime(0)
    setDuration(0)
  }

  const voiceLabel = VOICES.find(v => v.id === voice)

  return (
    <div className="mb-5">
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
        {/* Top row: play + waveform + voice picker */}
        <div className="flex items-center gap-3">
          {/* Play/Pause button */}
          <button
            onClick={togglePlayPause}
            disabled={state === 'loading'}
            className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              state === 'playing'
                ? 'bg-[#C9A84C] text-black'
                : 'bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-[#C9A84C] hover:bg-[#C9A84C]/20'
            } disabled:opacity-50`}
          >
            {state === 'loading' ? (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            ) : state === 'playing' ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1"/>
                <rect x="14" y="4" width="4" height="16" rx="1"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>

          {/* Waveform bars */}
          <div className="flex items-center gap-[3px] h-6">
            {[1, 2, 3, 4, 5].map(i => (
              <div
                key={i}
                className={`w-[3px] rounded-full bg-[#C9A84C] ${
                  state === 'playing' ? `soundwave-bar-${i}` : ''
                }`}
                style={{
                  height: state === 'playing' ? undefined : '6px',
                  opacity: state === 'playing' ? undefined : 0.4,
                }}
              />
            ))}
          </div>

          {/* Label */}
          <div className="flex-1 min-w-0">
            {state === 'idle' && (
              <span className="text-xs text-[#374151] font-medium">Listen to response</span>
            )}
            {state === 'loading' && (
              <span className="text-xs text-[#9CA3AF]">Preparing audio...</span>
            )}
            {(state === 'playing' || state === 'paused') && voiceLabel && (
              <span className="text-xs text-[#374151] font-medium">
                {voiceLabel.name} ({voiceLabel.description})
              </span>
            )}
            {state === 'error' && (
              <span className="text-xs text-red-400">Couldn&apos;t load audio</span>
            )}
          </div>

          {/* Voice picker toggle */}
          <button
            onClick={() => setShowSelector(!showSelector)}
            className="shrink-0 flex items-center gap-1 text-[10px] text-[#9CA3AF] hover:text-[#C9A84C] transition px-2 py-1 rounded-lg hover:bg-[#C9A84C]/5"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            Voice
          </button>
        </div>

        {/* Progress bar */}
        {(state === 'playing' || state === 'paused') && duration > 0 && (
          <div className="mt-3">
            <div
              ref={progressRef}
              onClick={handleProgressClick}
              className="w-full h-1.5 bg-gray-100 rounded-full cursor-pointer overflow-hidden"
            >
              <div
                className="h-full bg-[#C9A84C] rounded-full transition-all duration-100"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-[#9CA3AF]">{formatTime(currentTime)}</span>
              <span className="text-[10px] text-[#9CA3AF]">{formatTime(duration)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Voice selector dropdown */}
      {showSelector && (
        <div className="mt-2">
          <VoiceSelector
            selected={voice}
            onSelect={handleVoiceSelect}
            onClose={() => setShowSelector(false)}
          />
        </div>
      )}
    </div>
  )
}
