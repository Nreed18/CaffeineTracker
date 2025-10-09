import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DrinkTally {
  name: string;
  count: number;
}

interface DayData {
  day: string;
  date: string;
  drinks: DrinkTally[];
}

interface WeekCalendarViewProps {
  weekData: DayData[];
  title?: string;
}

export function WeekCalendarView({ weekData, title = "This Week" }: WeekCalendarViewProps) {
  return (
    <Card data-testid="card-week-calendar">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-3">
          {weekData.map((dayData) => (
            <div
              key={dayData.day}
              className="border rounded-md p-3 bg-card"
              data-testid={`calendar-day-${dayData.day.toLowerCase()}`}
            >
              <div className="text-center mb-3">
                <div className="text-sm font-semibold">{dayData.day}</div>
                <div className="text-xs text-muted-foreground">{dayData.date}</div>
              </div>
              <div className="space-y-2">
                {dayData.drinks.length === 0 ? (
                  <div className="text-xs text-center text-muted-foreground py-4">
                    No drinks
                  </div>
                ) : (
                  dayData.drinks.map((drink, idx) => (
                    <div
                      key={idx}
                      className="bg-accent/50 rounded px-2 py-1.5"
                      data-testid={`drink-tally-${dayData.day.toLowerCase()}-${idx}`}
                    >
                      <div className="text-xs font-medium truncate" title={drink.name}>
                        {drink.name}
                      </div>
                      <div className="flex items-center gap-0.5 mt-1">
                        {Array.from({ length: drink.count }).map((_, i) => (
                          <div
                            key={i}
                            className="w-1.5 h-3 bg-primary rounded-sm"
                            data-testid={`tally-mark-${i}`}
                          />
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
