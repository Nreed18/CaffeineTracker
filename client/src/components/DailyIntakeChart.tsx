import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DayData {
  day: string;
  caffeine: number;
}

interface DailyIntakeChartProps {
  data: DayData[];
}

export function DailyIntakeChart({ data }: DailyIntakeChartProps) {
  const maxCaffeine = Math.max(...data.map(d => d.caffeine), 1);

  return (
    <Card data-testid="card-daily-intake-chart">
      <CardHeader>
        <CardTitle>Daily Caffeine Intake</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((day) => (
            <div key={day.day} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{day.day}</span>
                <span className="text-muted-foreground">{day.caffeine}mg</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${(day.caffeine / maxCaffeine) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
