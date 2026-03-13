'use client'

interface VoiceOption {
  id: string
  name: string
  gender: 'male' | 'female'
  description: string
}

const VOICES: VoiceOption[] = [
  { id: 'onyx',    name: 'Elder',   gender: 'male',   description: 'Deep, pastoral' },
  { id: 'echo',    name: 'Guide',   gender: 'male',   description: 'Warm, approachable' },
  { id: 'fable',   name: 'Scholar', gender: 'male',   description: 'Measured, narrative' },
  { id: 'nova',    name: 'Grace',   gender: 'female', description: 'Warm, encouraging' },
  { id: 'shimmer', name: 'Serene',  gender: 'female', description: 'Soft, meditative' },
  { id: 'alloy',   name: 'Clarity', gender: 'female', description: 'Clear, balanced' },
]

export default function VoiceSelector({
  selected,
  onSelect,
  onClose,
}: {
  selected: string
  onSelect: (voiceId: string) => void
  onClose: () => void
}) {
  const males = VOICES.filter(v => v.gender === 'male')
  const females = VOICES.filter(v => v.gender === 'female')

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-5 w-full max-w-sm">
      <h3 className="text-sm font-bold text-[#0A0A0A] text-center mb-4">Choose a Voice</h3>

      <div className="grid grid-cols-2 gap-4">
        {/* Male column */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#C9A84C] mb-2">&#9794; Male</p>
          <div className="space-y-2">
            {males.map(v => (
              <button
                key={v.id}
                onClick={() => onSelect(v.id)}
                className={`w-full text-left rounded-xl border p-3 transition-all ${
                  selected === v.id
                    ? 'border-[#C9A84C] bg-[#C9A84C]/5 shadow-sm'
                    : 'border-gray-100 hover:border-[#C9A84C]/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#0A0A0A]">{v.name}</span>
                  {selected === v.id && (
                    <span className="text-[#C9A84C] text-xs">&#10003;</span>
                  )}
                </div>
                <p className="text-[10px] text-[#9CA3AF] mt-0.5">{v.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Female column */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#C9A84C] mb-2">&#9792; Female</p>
          <div className="space-y-2">
            {females.map(v => (
              <button
                key={v.id}
                onClick={() => onSelect(v.id)}
                className={`w-full text-left rounded-xl border p-3 transition-all ${
                  selected === v.id
                    ? 'border-[#C9A84C] bg-[#C9A84C]/5 shadow-sm'
                    : 'border-gray-100 hover:border-[#C9A84C]/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#0A0A0A]">{v.name}</span>
                  {selected === v.id && (
                    <span className="text-[#C9A84C] text-xs">&#10003;</span>
                  )}
                </div>
                <p className="text-[10px] text-[#9CA3AF] mt-0.5">{v.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={onClose}
        className="w-full mt-4 btn-gold py-2 rounded-xl text-xs font-semibold transition"
      >
        Done
      </button>
    </div>
  )
}

export { VOICES }
export type { VoiceOption }
