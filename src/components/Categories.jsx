import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { fundaciones as localData, categoriaMeta } from '../data/fundaciones'

function buildCategories(data) {
  const counts = {}
  data.forEach(f => { counts[f.categoria] = (counts[f.categoria] || 0) + 1 })
  const cats = Object.entries(categoriaMeta).map(([id, meta]) => ({
    id, label: meta.label, emoji: meta.emoji, count: counts[id] || 0,
  }))
  return [{ id: 'all', label: 'Todas', emoji: '🌟', count: data.length }, ...cats]
}

export default function Categories({ onCategoryChange }) {
  const [active, setActive]         = useState('all')
  const [categories, setCategories] = useState(() => buildCategories(localData))

  useEffect(() => {
    supabase.from('fundaciones').select('categoria')
      .then(({ data }) => {
        if (data && data.length > 0) setCategories(buildCategories(data))
      })
  }, [])

  const handleSelect = (id) => {
    setActive(id)
    if (onCategoryChange) onCategoryChange(id)
    if (id !== 'all') {
      setTimeout(() => {
        document.getElementById('fundaciones')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 80)
    }
  }

  return (
    <section id="categorias" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Explorar por categoría</h2>
        <a href="#" className="text-primary-500 text-sm font-medium hover:underline">Ver todas →</a>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => handleSelect(cat.id)}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl border text-sm font-medium whitespace-nowrap transition-all duration-200 shrink-0
              ${active === cat.id
                ? 'bg-primary-500 text-white border-primary-500 shadow-md shadow-primary-500/20'
                : 'bg-white text-gray-700 border-gray-200 hover:border-primary-400 hover:text-primary-600'
              }`}
          >
            <span className="text-lg leading-none">{cat.emoji}</span>
            <span>{cat.label}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-normal
              ${active === cat.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
              {cat.count}
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
