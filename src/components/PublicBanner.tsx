export function PublicBanner() {
  return (
    <div className="bg-amber-50 border-b border-amber-200/70 px-4 py-2 flex items-center justify-center gap-2 shrink-0">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
      <p className="text-xs text-amber-700">
        Conversations are <span className="font-semibold">public</span> — you stay <span className="font-semibold">anonymous</span>
      </p>
    </div>
  )
}
