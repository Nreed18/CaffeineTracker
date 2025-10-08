import { PeriodSelector } from '../PeriodSelector'
import { useState } from 'react'

export default function PeriodSelectorExample() {
  const [selectedPeriod, setSelectedPeriod] = useState('period-1')
  
  const periods = [
    { id: 'period-1', name: 'Period 1' },
    { id: 'period-2', name: 'Period 2' },
    { id: 'period-3', name: 'Period 3' },
  ]

  return (
    <div className="p-4">
      <PeriodSelector
        periods={periods}
        selectedPeriodId={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
      />
    </div>
  )
}
