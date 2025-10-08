import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Coffee } from "lucide-react";
import { format } from "date-fns";

interface DrinkHistoryItem {
  id: string;
  drinkName: string;
  caffeineAmount: number;
  timestamp: Date;
}

interface DrinkHistoryListProps {
  entries: DrinkHistoryItem[];
}

export function DrinkHistoryList({ entries }: DrinkHistoryListProps) {
  const groupedByDate = entries.reduce((acc, entry) => {
    const dateKey = format(entry.timestamp, "MMMM d, yyyy");
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(entry);
    return acc;
  }, {} as Record<string, DrinkHistoryItem[]>);

  return (
    <Card data-testid="card-drink-history">
      <CardHeader>
        <CardTitle>Recent History</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-6">
            {Object.entries(groupedByDate).map(([date, items]) => (
              <div key={date} className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground sticky top-0 bg-card py-1">
                  {date}
                </h3>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-md bg-accent/50"
                      data-testid={`history-item-${item.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-primary/10 p-2">
                          <Coffee className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{item.drinkName}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(item.timestamp, "h:mm a")}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm font-semibold">
                        {item.caffeineAmount}mg
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
