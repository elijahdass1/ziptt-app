'use client'
import { useState } from 'react'

export function RevealCodeButton({ code }: { code: string }) {
  const [revealed, setRevealed] = useState(false)
  const [copied, setCopied] = useState(false)
  if (!code) return null
  return (
    <div>
      {!revealed ? (
        <button onClick={() => setRevealed(true)} style={{ background: 'var(--bg-card)', border: '1px solid #C9A84C', color: '#C9A84C', padding: '8px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
          🔑 Show Code
        </button>
      ) : (
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <code style={{ background: 'var(--bg-card)', border: '1px solid #2A2A2A', padding: '8px 16px', borderRadius: '6px', fontFamily: 'monospace', color: '#C9A84C', fontSize: '14px', letterSpacing: '1px' }}>{code}</code>
          <button onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
            style={{ background: copied ? '#166534' : 'var(--bg-card)', border: '1px solid #2A2A2A', color: copied ? '#4ade80' : 'var(--text-primary)', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
            {copied ? '✅ Copied' : '📋 Copy'}
          </button>
        </div>
      )}
    </div>
  )
}
