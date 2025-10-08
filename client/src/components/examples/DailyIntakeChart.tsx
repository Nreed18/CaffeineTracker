import { DailyIntakeChart } from '../DailyIntakeChart'

export default function DailyIntakeChartExample() {
  const mockData = [
    { day: 'Monday', caffeine: 285 },
    { day: 'Tuesday', caffeine: 320 },
    { day: 'Wednesday', caffeine: 190 },
    { day: 'Thursday', caffeine: 405 },
    { day: 'Friday', caffeine: 225 },
  ]

  return (
    <div className="p-4 max-w-2xl">
      <DailyIntakeChart data={mockData} />
    </div>
  )
}
