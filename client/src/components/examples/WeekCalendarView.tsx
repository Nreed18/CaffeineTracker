import { WeekCalendarView } from '../WeekCalendarView'

export default function WeekCalendarViewExample() {
  const mockWeekData = [
    {
      day: 'Mon',
      date: 'Oct 7',
      drinks: [
        { name: 'Coffee', count: 2 },
        { name: 'Sweet Tea', count: 1 },
      ]
    },
    {
      day: 'Tue',
      date: 'Oct 8',
      drinks: [
        { name: 'Coffee', count: 3 },
        { name: 'Coke', count: 1 },
      ]
    },
    {
      day: 'Wed',
      date: 'Oct 9',
      drinks: [
        { name: 'Coffee', count: 1 },
      ]
    },
    {
      day: 'Thu',
      date: 'Oct 10',
      drinks: [
        { name: 'Coffee', count: 2 },
        { name: 'Energy Drink', count: 1 },
        { name: 'Coke', count: 2 },
      ]
    },
    {
      day: 'Fri',
      date: 'Oct 11',
      drinks: []
    },
  ]

  return (
    <div className="p-4">
      <WeekCalendarView weekData={mockWeekData} />
    </div>
  )
}
