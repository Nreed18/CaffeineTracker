import { PeriodManagement } from '../PeriodManagement'
import { useState } from 'react'

export default function PeriodManagementExample() {
  const [periods, setPeriods] = useState([
    { id: '1', name: 'Period 1', startDate: '2025-10-01', endDate: '2025-10-05' },
    { id: '2', name: 'Period 2', startDate: '2025-10-08', endDate: '2025-10-12' },
    { id: '3', name: 'Period 3', startDate: '2025-10-15', endDate: '2025-10-19' },
  ])

  return (
    <div className="p-4 max-w-2xl">
      <PeriodManagement
        periods={periods}
        onAddPeriod={(period) => {
          console.log('Add period:', period)
          setPeriods([...periods, { ...period, id: String(Date.now()) }])
        }}
        onEditPeriod={(id, period) => {
          console.log('Edit period:', id, period)
          setPeriods(periods.map(p => p.id === id ? { ...period, id } : p))
        }}
        onDeletePeriod={(id) => {
          console.log('Delete period:', id)
          setPeriods(periods.filter(p => p.id !== id))
        }}
      />
    </div>
  )
}
