import { CaffeineMeter } from '../CaffeineMeter'

export default function CaffeineMeterExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
      <CaffeineMeter currentDrinks={3} maxDrinks={10} />
      <CaffeineMeter currentDrinks={7} maxDrinks={10} />
      <CaffeineMeter currentDrinks={10} maxDrinks={10} />
    </div>
  )
}
