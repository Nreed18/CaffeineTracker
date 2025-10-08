import { useState, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DrinkButton } from "@/components/DrinkButton";
import { PeriodSelector } from "@/components/PeriodSelector";
import { StatCard } from "@/components/StatCard";
import { CaffeineMeter } from "@/components/CaffeineMeter";
import { WeekCalendarView } from "@/components/WeekCalendarView";
import { PeriodManagement } from "@/components/PeriodManagement";
import { DailyIntakeChart } from "@/components/DailyIntakeChart";
import { DrinkHistoryList } from "@/components/DrinkHistoryList";
import { PrintableReport } from "@/components/PrintableReport";
import { TrendingUp, Coffee, Calendar, Printer, Plus, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useReactToPrint } from "react-to-print";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, startOfDay, isSameDay } from "date-fns";

const COMMON_DRINKS = [
  { name: "Coffee", caffeineAmount: 95, icon: "coffee" as const },
  { name: "Sweet Tea", caffeineAmount: 47, icon: "tea" as const },
  { name: "Coke", caffeineAmount: 34, icon: "soda" as const },
  { name: "Energy Drink", caffeineAmount: 80, icon: "soda" as const },
];

interface DrinkEntry {
  id: string;
  drinkName: string;
  caffeineAmount: number;
  timestamp: Date;
}

export default function Home() {
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);

  const [selectedPeriod, setSelectedPeriod] = useState("period-1");
  const [customDrinkDialogOpen, setCustomDrinkDialogOpen] = useState(false);
  const [customDrink, setCustomDrink] = useState({ name: "", caffeine: "" });
  const [activeTab, setActiveTab] = useState("tracker");

  const [periods, setPeriods] = useState([
    { id: "period-1", name: "Period 1", startDate: "2025-10-01", endDate: "2025-10-05" },
    { id: "period-2", name: "Period 2", startDate: "2025-10-08", endDate: "2025-10-12" },
    { id: "period-3", name: "Period 3", startDate: "2025-10-15", endDate: "2025-10-19" },
  ]);

  const [drinkEntries, setDrinkEntries] = useState<DrinkEntry[]>([
    { id: "1", drinkName: "Coffee", caffeineAmount: 95, timestamp: new Date("2025-10-08T09:30:00") },
    { id: "2", drinkName: "Sweet Tea", caffeineAmount: 47, timestamp: new Date("2025-10-08T14:15:00") },
    { id: "3", drinkName: "Coke", caffeineAmount: 34, timestamp: new Date("2025-10-07T12:00:00") },
    { id: "4", drinkName: "Coffee", caffeineAmount: 95, timestamp: new Date("2025-10-07T08:45:00") },
    { id: "5", drinkName: "Energy Drink", caffeineAmount: 80, timestamp: new Date("2025-10-06T15:30:00") },
    { id: "6", drinkName: "Coffee", caffeineAmount: 95, timestamp: new Date("2025-10-05T10:00:00") },
  ]);

  const todayDrinkCount = useMemo(() => {
    const today = startOfDay(new Date());
    return drinkEntries.filter(entry => isSameDay(entry.timestamp, today)).length;
  }, [drinkEntries]);

  const weekData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const today = new Date();
    
    return days.map((day, index) => {
      const date = new Date(today);
      const dayOfWeek = today.getDay();
      const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      date.setDate(today.getDate() - daysFromMonday + index);
      
      const dayEntries = drinkEntries.filter(entry => 
        isSameDay(entry.timestamp, date)
      );
      
      const drinkTallies = dayEntries.reduce((acc, entry) => {
        const existing = acc.find(d => d.name === entry.drinkName);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ name: entry.drinkName, count: 1 });
        }
        return acc;
      }, [] as Array<{ name: string; count: number }>);
      
      return {
        day,
        date: format(date, 'MMM d'),
        drinks: drinkTallies,
      };
    });
  }, [drinkEntries]);

  const dailyData = useMemo(() => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const today = new Date();
    
    return days.map((day, index) => {
      const date = new Date(today);
      const dayOfWeek = today.getDay();
      const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      date.setDate(today.getDate() - daysFromMonday + index);
      
      const dayEntries = drinkEntries.filter(entry => 
        isSameDay(entry.timestamp, date)
      );
      
      const totalCaffeine = dayEntries.reduce((sum, entry) => sum + entry.caffeineAmount, 0);
      
      return {
        day,
        caffeine: totalCaffeine,
      };
    });
  }, [drinkEntries]);

  const stats = useMemo(() => {
    const periodEntries = drinkEntries;
    const totalCaffeine = periodEntries.reduce((sum, entry) => sum + entry.caffeineAmount, 0);
    const totalDrinks = periodEntries.length;
    
    const uniqueDays = new Set(
      periodEntries.map(entry => format(startOfDay(entry.timestamp), 'yyyy-MM-dd'))
    ).size;
    
    const avgDrinksPerDay = uniqueDays > 0 ? totalDrinks / uniqueDays : 0;
    const avgCaffeinePerDay = uniqueDays > 0 ? totalCaffeine / uniqueDays : 0;
    
    return {
      totalCaffeine,
      totalDrinks,
      avgDrinksPerDay,
      avgCaffeinePerDay,
    };
  }, [drinkEntries]);

  const reportData = useMemo(() => ({
    periodName: periods.find((p) => p.id === selectedPeriod)?.name || "Period 1",
    startDate: new Date("2025-10-01"),
    endDate: new Date("2025-10-05"),
    totalCaffeine: stats.totalCaffeine,
    totalDrinks: stats.totalDrinks,
    avgDrinksPerDay: stats.avgDrinksPerDay,
    avgCaffeinePerDay: stats.avgCaffeinePerDay,
    dailyBreakdown: dailyData.map((day, index) => ({
      date: `${day.day}, Oct ${index + 1}`,
      drinks: drinkEntries.filter(entry => {
        const date = new Date();
        const dayOfWeek = date.getDay();
        const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const targetDate = new Date(date);
        targetDate.setDate(date.getDate() - daysFromMonday + index);
        return isSameDay(entry.timestamp, targetDate);
      }).length,
      caffeine: day.caffeine,
    })),
    drinkHistory: drinkEntries,
  }), [periods, selectedPeriod, stats, dailyData, drinkEntries]);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  const handleDrinkLog = (drinkName: string, caffeineAmount: number) => {
    const newEntry: DrinkEntry = {
      id: `entry-${Date.now()}`,
      drinkName,
      caffeineAmount,
      timestamp: new Date(),
    };
    
    setDrinkEntries(prev => [newEntry, ...prev]);
    
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

  const handleAddPeriod = (period: Omit<typeof periods[0], 'id'>) => {
    const newPeriod = { ...period, id: `period-${Date.now()}` };
    setPeriods([...periods, newPeriod]);
    console.log("Added period:", newPeriod);
    toast({
      title: "Period added!",
      description: `${period.name} has been created.`,
    });
  };

  const handleEditPeriod = (id: string, period: Omit<typeof periods[0], 'id'>) => {
    setPeriods(periods.map((p) => (p.id === id ? { ...period, id } : p)));
    console.log("Edited period:", id, period);
    toast({
      title: "Period updated!",
      description: `${period.name} has been updated.`,
    });
  };

  const handleDeletePeriod = (id: string) => {
    setPeriods(periods.filter((p) => p.id !== id));
    console.log("Deleted period:", id);
    toast({
      title: "Period deleted!",
      description: "The period has been removed.",
    });
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
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="tracker" data-testid="tab-tracker">
                  Tracker
                </TabsTrigger>
                <TabsTrigger value="manage-periods" data-testid="tab-manage-periods">
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Periods
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === "tracker" && (
          <>
            <div className="mb-4">
              <PeriodSelector
                periods={periods.map(p => ({ id: p.id, name: p.name }))}
                selectedPeriodId={selectedPeriod}
                onPeriodChange={setSelectedPeriod}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
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
                  <WeekCalendarView weekData={weekData} />
                </section>
              </div>

              <div>
                <CaffeineMeter currentDrinks={todayDrinkCount} maxDrinks={10} />
              </div>
            </div>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-6">Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                  title="Total Caffeine"
                  value={`${stats.totalCaffeine.toLocaleString()}mg`}
                  subtitle="This period"
                  icon={TrendingUp}
                  variant="default"
                />
                <StatCard
                  title="Avg Drinks/Day"
                  value={stats.avgDrinksPerDay.toFixed(1)}
                  subtitle="Across all days"
                  icon={Coffee}
                  variant="success"
                />
                <StatCard
                  title="Daily Average"
                  value={`${Math.round(stats.avgCaffeinePerDay)}mg`}
                  subtitle="Per day"
                  icon={Calendar}
                  variant="default"
                />
              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DailyIntakeChart data={dailyData} />
              <DrinkHistoryList entries={drinkEntries} />
            </div>
          </>
        )}

        {activeTab === "manage-periods" && (
          <div className="max-w-3xl mx-auto">
            <PeriodManagement
              periods={periods}
              onAddPeriod={handleAddPeriod}
              onEditPeriod={handleEditPeriod}
              onDeletePeriod={handleDeletePeriod}
            />
          </div>
        )}
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
