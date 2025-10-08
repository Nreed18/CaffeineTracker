import { DrinkButton } from '../DrinkButton'

export default function DrinkButtonExample() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
      <DrinkButton name="Coffee" caffeineAmount={95} icon="coffee" onClick={() => console.log('Coffee logged')} />
      <DrinkButton name="Sweet Tea" caffeineAmount={47} icon="tea" onClick={() => console.log('Sweet Tea logged')} />
      <DrinkButton name="Coke" caffeineAmount={34} icon="soda" onClick={() => console.log('Coke logged')} />
      <DrinkButton name="Energy Drink" caffeineAmount={80} icon="soda" onClick={() => console.log('Energy Drink logged')} />
    </div>
  )
}
