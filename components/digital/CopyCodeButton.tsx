'use client'
import { useState } from 'react'

export function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      style={{ background: copied ? '#166534' : 'var(--bg-card)', border: '1px solid #2A2A2A', color: copied ? '#4ade80' : 'var(--text-primary)', padding: '10px 24px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>
      {copied ? '✅ Copied!' : '📋 Copy Code'}
    </button>
  )
}
