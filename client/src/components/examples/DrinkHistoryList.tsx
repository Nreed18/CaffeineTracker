import { DrinkHistoryList } from '../DrinkHistoryList'

export default function DrinkHistoryListExample() {
  const mockEntries = [
    { id: '1', drinkName: 'Coffee', caffeineAmount: 95, timestamp: new Date('2025-10-08T09:30:00') },
    { id: '2', drinkName: 'Sweet Tea', caffeineAmount: 47, timestamp: new Date('2025-10-08T14:15:00') },
    { id: '3', drinkName: 'Coke', caffeineAmount: 34, timestamp: new Date('2025-10-07T12:00:00') },
    { id: '4', drinkName: 'Coffee', caffeineAmount: 95, timestamp: new Date('2025-10-07T08:45:00') },
    { id: '5', drinkName: 'Energy Drink', caffeineAmount: 80, timestamp: new Date('2025-10-06T15:30:00') },
  ]

  return (
    <div className="p-4 max-w-2xl">
      <DrinkHistoryList entries={mockEntries} />
    </div>
  )
}
