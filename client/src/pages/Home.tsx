import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DrinkButton } from "@/components/DrinkButton";
import { PeriodSelector } from "@/components/PeriodSelector";
import { StatCard } from "@/components/StatCard";
import { DailyIntakeChart } from "@/components/DailyIntakeChart";
import { DrinkHistoryList } from "@/components/DrinkHistoryList";
import { PrintableReport } from "@/components/PrintableReport";
import { TrendingUp, Coffee, Calendar, Printer, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useReactToPrint } from "react-to-print";

const COMMON_DRINKS = [
  { name: "Coffee", caffeineAmount: 95, icon: "coffee" as const },
  { name: "Sweet Tea", caffeineAmount: 47, icon: "tea" as const },
  { name: "Coke", caffeineAmount: 34, icon: "soda" as const },
  { name: "Energy Drink", caffeineAmount: 80, icon: "soda" as const },
];

export default function Home() {
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);

  const [selectedPeriod, setSelectedPeriod] = useState("period-1");
  const [customDrinkDialogOpen, setCustomDrinkDialogOpen] = useState(false);
  const [customDrink, setCustomDrink] = useState({ name: "", caffeine: "" });

  const periods = [
    { id: "period-1", name: "Period 1" },
    { id: "period-2", name: "Period 2" },
    { id: "period-3", name: "Period 3" },
  ];

  const dailyData = [
    { day: "Monday", caffeine: 285 },
    { day: "Tuesday", caffeine: 320 },
    { day: "Wednesday", caffeine: 190 },
    { day: "Thursday", caffeine: 405 },
    { day: "Friday", caffeine: 225 },
  ];

  const historyEntries = [
    { id: "1", drinkName: "Coffee", caffeineAmount: 95, timestamp: new Date("2025-10-08T09:30:00") },
    { id: "2", drinkName: "Sweet Tea", caffeineAmount: 47, timestamp: new Date("2025-10-08T14:15:00") },
    { id: "3", drinkName: "Coke", caffeineAmount: 34, timestamp: new Date("2025-10-07T12:00:00") },
    { id: "4", drinkName: "Coffee", caffeineAmount: 95, timestamp: new Date("2025-10-07T08:45:00") },
    { id: "5", drinkName: "Energy Drink", caffeineAmount: 80, timestamp: new Date("2025-10-06T15:30:00") },
  ];

  const reportData = {
    periodName: periods.find(p => p.id === selectedPeriod)?.name || "Period 1",
    startDate: new Date("2025-10-01"),
    endDate: new Date("2025-10-05"),
    totalCaffeine: 1425,
    totalDrinks: 16,
    avgDrinksPerDay: 3.2,
    avgCaffeinePerDay: 285,
    dailyBreakdown: [
      { date: "Monday, Oct 1", drinks: 3, caffeine: 285 },
      { date: "Tuesday, Oct 2", drinks: 4, caffeine: 320 },
      { date: "Wednesday, Oct 3", drinks: 2, caffeine: 190 },
      { date: "Thursday, Oct 4", drinks: 5, caffeine: 405 },
      { date: "Friday, Oct 5", drinks: 2, caffeine: 225 },
    ],
    drinkHistory: historyEntries,
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  const handleDrinkLog = (drinkName: string, caffeineAmount: number) => {
    console.log(`Logged ${drinkName} with ${caffeineAmount}mg caffeine`);
    toast({
      title: "Drink logged!",
      description: `${drinkName} (${caffeineAmount}mg) added to your tracker.`,
    });
  };

  const handleCustomDrinkSubmit = () => {
    if (customDrink.name && customDrink.caffeine) {
      handleDrinkLog(customDrink.name, parseInt(customDrink.caffeine));
      setCustomDrinkDialogOpen(false);
      setCustomDrink({ name: "", caffeine: "" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl font-bold font-[Manrope]">Caffeine Tracker</h1>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="default"
                onClick={handlePrint}
                data-testid="button-print"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print Report
              </Button>
              <ThemeToggle />
            </div>
          </div>
          <div className="mt-4">
            <PeriodSelector
              periods={periods}
              selectedPeriodId={selectedPeriod}
              onPeriodChange={setSelectedPeriod}
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Quick Log</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCustomDrinkDialogOpen(true)}
              data-testid="button-add-custom-drink"
            >
              <Plus className="h-4 w-4 mr-2" />
              Custom Drink
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {COMMON_DRINKS.map((drink) => (
              <DrinkButton
                key={drink.name}
                name={drink.name}
                caffeineAmount={drink.caffeineAmount}
                icon={drink.icon}
                onClick={() => handleDrinkLog(drink.name, drink.caffeineAmount)}
              />
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-6">Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Total Caffeine"
              value="1,425mg"
              subtitle="This period"
              icon={TrendingUp}
              variant="default"
            />
            <StatCard
              title="Avg Drinks/Day"
              value="3.2"
              subtitle="Across 5 days"
              icon={Coffee}
              variant="success"
            />
            <StatCard
              title="Daily Average"
              value="285mg"
              subtitle="Per day"
              icon={Calendar}
              variant="default"
            />
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DailyIntakeChart data={dailyData} />
          <DrinkHistoryList entries={historyEntries} />
        </div>
      </main>

      <Dialog open={customDrinkDialogOpen} onOpenChange={setCustomDrinkDialogOpen}>
        <DialogContent data-testid="dialog-custom-drink">
          <DialogHeader>
            <DialogTitle>Add Custom Drink</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="drink-name">Drink Name</Label>
              <Input
                id="drink-name"
                placeholder="e.g., Espresso"
                value={customDrink.name}
                onChange={(e) => setCustomDrink({ ...customDrink, name: e.target.value })}
                data-testid="input-drink-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="caffeine-amount">Caffeine Amount (mg)</Label>
              <Input
                id="caffeine-amount"
                type="number"
                placeholder="e.g., 64"
                value={customDrink.caffeine}
                onChange={(e) => setCustomDrink({ ...customDrink, caffeine: e.target.value })}
                data-testid="input-caffeine-amount"
              />
            </div>
            <Button
              className="w-full"
              onClick={handleCustomDrinkSubmit}
              disabled={!customDrink.name || !customDrink.caffeine}
              data-testid="button-submit-custom-drink"
            >
              Log Drink
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="hidden">
        <PrintableReport ref={printRef} data={reportData} />
      </div>
    </div>
  );
}
