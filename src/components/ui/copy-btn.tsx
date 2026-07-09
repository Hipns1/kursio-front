import { useState } from 'react'

export function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <button
      onClick={copy}
      className={`border-line bg-primary-glow ml-1.5 rounded border px-1.5 py-0.5 font-mono text-xs transition-all ${
        copied ? 'text-success' : 'text-primary'
      }`}
    >
      {copied ? '✓' : '⧉'}
    </button>
  )
}
