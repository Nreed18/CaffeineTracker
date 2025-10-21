import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Coffee, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface DrinkHistoryItem {
  id: string;
  drinkName: string;
  caffeineAmount: number;
  timestamp: Date;
}

interface DrinkHistoryListProps {
  entries: DrinkHistoryItem[];
  onDelete?: (id: string) => void;
}

export function DrinkHistoryList({ entries, onDelete }: DrinkHistoryListProps) {
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
          {Object.entries(groupedByDate).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Coffee className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">No drinks logged yet</p>
              <p className="text-xs text-muted-foreground">Start tracking your caffeine intake above</p>
            </div>
          ) : (
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
                        className="flex items-center justify-between gap-3 p-3 rounded-md bg-accent/50"
                        data-testid={`history-item-${item.id}`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="rounded-full bg-primary/10 p-2">
                            <Coffee className="h-4 w-4 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm truncate">{item.drinkName}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(item.timestamp, "h:mm a")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-semibold">
                            {item.caffeineAmount}mg
                          </div>
                          {onDelete && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onDelete(item.id)}
                              data-testid={`button-delete-${item.id}`}
                              className="h-8 w-8"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
