import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Period {
  id: string;
  name: string;
}

interface PeriodSelectorProps {
  periods: Period[];
  selectedPeriodId: string;
  onPeriodChange: (periodId: string) => void;
}

export function PeriodSelector({ periods, selectedPeriodId, onPeriodChange }: PeriodSelectorProps) {
  return (
    <Tabs value={selectedPeriodId} onValueChange={onPeriodChange}>
      <TabsList className="w-full justify-start">
        {periods.map((period) => (
          <TabsTrigger
            key={period.id}
            value={period.id}
            data-testid={`tab-period-${period.id}`}
          >
            {period.name}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
