import { StatCard } from '../StatCard'
import { TrendingUp, Coffee, Calendar } from 'lucide-react'

export default function StatCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
      <StatCard
        title="Total Caffeine"
        value="1,425mg"
        subtitle="This period"
        icon={TrendingUp}
        variant="default"
      />
      <StatCard
        title="Avg Drinks/Day"
        value="3.2"
        subtitle="Across 5 days"
        icon={Coffee}
        variant="success"
      />
      <StatCard
        title="Daily Average"
        value="285mg"
        subtitle="Per day"
        icon={Calendar}
        variant="default"
      />
    </div>
  )
}
