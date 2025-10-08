import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface CaffeineMeterProps {
  currentDrinks: number;
  maxDrinks?: number;
}

export function CaffeineMeter({ currentDrinks, maxDrinks = 10 }: CaffeineMeterProps) {
  const percentage = Math.min((currentDrinks / maxDrinks) * 100, 100);
  const isWarning = currentDrinks >= maxDrinks * 0.7;
  const isFull = currentDrinks >= maxDrinks;

  return (
    <Card data-testid="card-caffeine-meter">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Today's Caffeine Meter</span>
          <span className={`text-2xl font-bold font-[Manrope] ${isFull ? 'text-chart-3' : isWarning ? 'text-chart-3' : 'text-chart-2'}`}>
            {currentDrinks}/{maxDrinks}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Empty</span>
            <span>Full</span>
          </div>
          <Progress 
            value={percentage} 
            className="h-4"
            data-testid="progress-caffeine-meter"
          />
        </div>
        <p className="text-sm text-center text-muted-foreground">
          {isFull ? "You've reached your daily limit!" : 
           isWarning ? "Approaching daily limit" : 
           "Tracking your daily intake"}
        </p>
      </CardContent>
    </Card>
  );
}
