import { PrintableReport } from '../PrintableReport'

export default function PrintableReportExample() {
  const mockData = {
    periodName: 'Period 1',
    startDate: new Date('2025-10-01'),
    endDate: new Date('2025-10-05'),
    totalCaffeine: 1425,
    totalDrinks: 16,
    avgDrinksPerDay: 3.2,
    avgCaffeinePerDay: 285,
    dailyBreakdown: [
      { date: 'Monday, Oct 1', drinks: 3, caffeine: 285 },
      { date: 'Tuesday, Oct 2', drinks: 4, caffeine: 320 },
      { date: 'Wednesday, Oct 3', drinks: 2, caffeine: 190 },
      { date: 'Thursday, Oct 4', drinks: 5, caffeine: 405 },
      { date: 'Friday, Oct 5', drinks: 2, caffeine: 225 },
    ],
    drinkHistory: [
      { drinkName: 'Coffee', caffeineAmount: 95, timestamp: new Date('2025-10-01T09:00:00') },
      { drinkName: 'Sweet Tea', caffeineAmount: 47, timestamp: new Date('2025-10-01T14:30:00') },
      { drinkName: 'Coke', caffeineAmount: 34, timestamp: new Date('2025-10-02T12:00:00') },
    ]
  }

  return (
    <div className="bg-gray-100 p-4">
      <PrintableReport data={mockData} />
    </div>
  )
}
