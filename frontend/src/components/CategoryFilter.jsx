import React from 'react'

const CATEGORIES = [
  { id: 'all', label: 'All', emoji: '🌐' },
  { id: 'agriculture', label: 'Agriculture', emoji: '🌾' },
  { id: 'livestock', label: 'Livestock & Food', emoji: '🐄' },
  { id: 'textile', label: 'Textile', emoji: '🧵' },
  { id: 'manufacturing', label: 'Manufacturing', emoji: '🏭' },
]

export { CATEGORIES }

export default function CategoryFilter({ active, onChange }) {
  return (
    <div className="category-filter">
      {CATEGORIES.map(cat => (
        <button
          key={cat.id}
          className={`category-chip ${active === cat.id ? 'active' : ''}`}
          onClick={() => onChange(cat.id)}
        >
          {cat.emoji} {cat.label}
        </button>
      ))}
    </div>
  )
}
