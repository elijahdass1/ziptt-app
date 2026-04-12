'use client'

import { useState } from 'react'
import { DisputeForm } from './DisputeForm'

interface Props {
  preselectedOrderId?: string
}

export function DisputeFormWrapper({ preselectedOrderId }: Props) {
  const [showForm, setShowForm] = useState(!!preselectedOrderId)

  return (
    <div className="mb-2">
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="bg-[#C9A84C] text-[#0A0A0A] hover:bg-[#b8963f] font-semibold px-4 py-2 rounded text-sm transition-colors"
        >
          Open New Dispute
        </button>
      ) : (
        <DisputeForm
          preselectedOrderId={preselectedOrderId}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  )
}
