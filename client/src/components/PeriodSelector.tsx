import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface Period {
  id: string;
  name: string;
  hidden?: number;
}

interface PeriodSelectorProps {
  periods: Period[];
  selectedPeriodId: string;
  onPeriodChange: (periodId: string) => void;
}

export function PeriodSelector({ periods, selectedPeriodId, onPeriodChange }: PeriodSelectorProps) {
  const visiblePeriods = periods.filter(p => !p.hidden);
  
  return (
    <Tabs value={selectedPeriodId} onValueChange={onPeriodChange}>
      <ScrollArea className="w-full">
        <TabsList className="w-max justify-start">
          {visiblePeriods.map((period) => (
            <TabsTrigger
              key={period.id}
              value={period.id}
              data-testid={`tab-period-${period.id}`}
            >
              {period.name}
            </TabsTrigger>
          ))}
        </TabsList>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </Tabs>
  );
}
