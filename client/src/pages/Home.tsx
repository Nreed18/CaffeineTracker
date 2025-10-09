import { useRef, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import { BulkImportDialog } from "@/components/BulkImportDialog";
import { TrendingUp, Coffee, Calendar, Printer, Plus, Settings, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useReactToPrint } from "react-to-print";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, startOfDay, isSameDay, startOfWeek, addDays } from "date-fns";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Period, DrinkEntry, InsertPeriod, InsertDrinkEntry } from "@shared/schema";
import { useState } from "react";

const DEFAULT_DRINKS = [
  { name: "Coffee", caffeineAmount: 95, icon: "coffee" as const },
  { name: "Sweet Tea", caffeineAmount: 47, icon: "tea" as const },
  { name: "Coke", caffeineAmount: 34, icon: "soda" as const },
  { name: "Energy Drink", caffeineAmount: 80, icon: "soda" as const },
];

type DrinkConfig = typeof DEFAULT_DRINKS[number];

export default function Home() {
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);

  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");
  const [customDrinkDialogOpen, setCustomDrinkDialogOpen] = useState(false);
  const [bulkImportDialogOpen, setBulkImportDialogOpen] = useState(false);
  const [customDrink, setCustomDrink] = useState({ 
    name: "", 
    caffeine: "", 
    date: format(new Date(), 'yyyy-MM-dd'),
    time: format(new Date(), 'HH:mm')
  });
  const [activeTab, setActiveTab] = useState("tracker");
  const [quickDrinks, setQuickDrinks] = useState<DrinkConfig[]>(() => {
    const saved = localStorage.getItem('quickDrinks');
    return saved ? JSON.parse(saved) : DEFAULT_DRINKS;
  });
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [editingDrinkIndex, setEditingDrinkIndex] = useState<number | null>(null);
  const [drinkFormData, setDrinkFormData] = useState({ name: "", caffeineAmount: "", icon: "coffee" as const });

  const { data: periods = [], isLoading: periodsLoading } = useQuery<Period[]>({
    queryKey: ["/api/periods"],
  });

  const { data: drinkEntries = [], isLoading: entriesLoading } = useQuery<DrinkEntry[]>({
    queryKey: ["/api/drink-entries"],
  });

  const selectedPeriod = useMemo(() => {
    if (!selectedPeriodId && periods.length > 0) {
      setSelectedPeriodId(periods[0].id);
      return periods[0];
    }
    return periods.find(p => p.id === selectedPeriodId);
  }, [selectedPeriodId, periods]);

  const createPeriodMutation = useMutation({
    mutationFn: async (data: InsertPeriod) => {
      const res = await apiRequest("POST", "/api/periods", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/periods"] });
    },
  });

  const updatePeriodMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: InsertPeriod }) => {
      const res = await apiRequest("PUT", `/api/periods/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/periods"] });
    },
  });

  const deletePeriodMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/periods/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/periods"] });
    },
  });

  const togglePeriodHiddenMutation = useMutation({
    mutationFn: async ({ id, hidden }: { id: string; hidden: boolean }) => {
      const res = await apiRequest("PATCH", `/api/periods/${id}/toggle-hidden`, { hidden });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/periods"] });
    },
  });

  const createDrinkEntryMutation = useMutation({
    mutationFn: async (data: InsertDrinkEntry) => {
      const res = await apiRequest("POST", "/api/drink-entries", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/drink-entries"] });
    },
  });

  const deleteDrinkEntryMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/drink-entries/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/drink-entries"] });
      toast({
        title: "Drink deleted",
        description: "The drink entry has been removed.",
      });
    },
  });

  const todayDrinkCount = useMemo(() => {
    const today = startOfDay(new Date());
    return drinkEntries.filter(entry => {
      const matchesToday = isSameDay(new Date(entry.timestamp), today);
      const matchesPeriod = selectedPeriod ? entry.periodId === selectedPeriod.id : true;
      return matchesToday && matchesPeriod;
    }).length;
  }, [drinkEntries, selectedPeriod]);

  const weekData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    
    // Calculate Monday of the week to show
    let monday: Date;
    
    if (selectedPeriod) {
      const periodStart = new Date(selectedPeriod.startDate);
      const periodEnd = new Date(selectedPeriod.endDate);
      
      // Find the Monday-Friday week that best overlaps with the period
      // Start by getting the Monday of the week containing the period start
      const periodStartMonday = startOfWeek(periodStart, { weekStartsOn: 1 });
      
      // Check if period start is on weekend - if so, use next Monday
      const periodStartDay = periodStart.getDay();
      if (periodStartDay === 0 || periodStartDay === 6) {
        // Weekend - find the next Monday
        monday = periodStartDay === 0 
          ? addDays(periodStart, 1) // Sunday -> Monday
          : addDays(periodStart, 2); // Saturday -> Monday
      } else {
        // Weekday - use the Monday of this week
        monday = periodStartMonday;
      }
    } else {
      // No period selected - use current week
      monday = startOfWeek(new Date(), { weekStartsOn: 1 });
    }
    
    return days.map((day, index) => {
      const date = addDays(monday, index);
      
      // Filter drinks by both date AND period
      const dayEntries = drinkEntries.filter(entry => {
        const matchesDate = isSameDay(new Date(entry.timestamp), date);
        const matchesPeriod = selectedPeriod ? entry.periodId === selectedPeriod.id : true;
        return matchesDate && matchesPeriod;
      });
      
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
  }, [drinkEntries, selectedPeriod]);

  const dailyData = useMemo(() => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    
    // Calculate Monday of the week to show (same logic as weekData)
    let monday: Date;
    
    if (selectedPeriod) {
      const periodStart = new Date(selectedPeriod.startDate);
      const periodStartMonday = startOfWeek(periodStart, { weekStartsOn: 1 });
      
      const periodStartDay = periodStart.getDay();
      if (periodStartDay === 0 || periodStartDay === 6) {
        monday = periodStartDay === 0 
          ? addDays(periodStart, 1)
          : addDays(periodStart, 2);
      } else {
        monday = periodStartMonday;
      }
    } else {
      monday = startOfWeek(new Date(), { weekStartsOn: 1 });
    }
    
    return days.map((day, index) => {
      const date = addDays(monday, index);
      
      // Filter drinks by both date AND period
      const dayEntries = drinkEntries.filter(entry => {
        const matchesDate = isSameDay(new Date(entry.timestamp), date);
        const matchesPeriod = selectedPeriod ? entry.periodId === selectedPeriod.id : true;
        return matchesDate && matchesPeriod;
      });
      
      const totalCaffeine = dayEntries.reduce((sum, entry) => sum + entry.caffeineAmount, 0);
      
      return {
        day,
        caffeine: totalCaffeine,
      };
    });
  }, [drinkEntries, selectedPeriod]);

  const stats = useMemo(() => {
    // Filter entries to only include those from the selected period
    const periodEntries = selectedPeriod 
      ? drinkEntries.filter(entry => entry.periodId === selectedPeriod.id)
      : drinkEntries;
    
    const totalCaffeine = periodEntries.reduce((sum, entry) => sum + entry.caffeineAmount, 0);
    const totalDrinks = periodEntries.length;
    
    const uniqueDays = new Set(
      periodEntries.map(entry => format(startOfDay(new Date(entry.timestamp)), 'yyyy-MM-dd'))
    ).size;
    
    const avgDrinksPerDay = uniqueDays > 0 ? totalDrinks / uniqueDays : 0;
    const avgCaffeinePerDay = uniqueDays > 0 ? totalCaffeine / uniqueDays : 0;
    
    return {
      totalCaffeine,
      totalDrinks,
      avgDrinksPerDay,
      avgCaffeinePerDay,
    };
  }, [drinkEntries, selectedPeriod]);

  const yearlyStats = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const yearEntries = drinkEntries.filter(entry => {
      const entryYear = new Date(entry.timestamp).getFullYear();
      return entryYear === currentYear;
    });
    
    const totalCaffeine = yearEntries.reduce((sum, entry) => sum + entry.caffeineAmount, 0);
    const totalDrinks = yearEntries.length;
    
    const uniqueDays = new Set(
      yearEntries.map(entry => format(startOfDay(new Date(entry.timestamp)), 'yyyy-MM-dd'))
    ).size;
    
    const avgDrinksPerDay = uniqueDays > 0 ? totalDrinks / uniqueDays : 0;
    const avgCaffeinePerDay = uniqueDays > 0 ? totalCaffeine / uniqueDays : 0;
    
    return {
      year: currentYear,
      totalCaffeine,
      totalDrinks,
      avgDrinksPerDay,
      avgCaffeinePerDay,
    };
  }, [drinkEntries]);

  const reportData = useMemo(() => ({
    periodName: selectedPeriod?.name || "All Time",
    startDate: selectedPeriod ? new Date(selectedPeriod.startDate) : new Date(),
    endDate: selectedPeriod ? new Date(selectedPeriod.endDate) : new Date(),
    totalCaffeine: stats.totalCaffeine,
    totalDrinks: stats.totalDrinks,
    avgDrinksPerDay: stats.avgDrinksPerDay,
    avgCaffeinePerDay: stats.avgCaffeinePerDay,
    weekData: weekData,
  }), [selectedPeriod, stats, weekData]);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  const handleDrinkLog = (drinkName: string, caffeineAmount: number) => {
    if (!selectedPeriod) {
      toast({
        title: "No period selected",
        description: "Please create a period first.",
        variant: "destructive",
      });
      return;
    }

    createDrinkEntryMutation.mutate({
      periodId: selectedPeriod.id,
      drinkName,
      caffeineAmount,
    }, {
      onSuccess: () => {
        toast({
          title: "Drink logged!",
          description: `${drinkName} (${caffeineAmount}mg) added to your tracker.`,
        });
      },
    });
  };

  const handleCustomDrinkSubmit = () => {
    if (customDrink.name && customDrink.caffeine && selectedPeriod) {
      const timestamp = new Date(`${customDrink.date}T${customDrink.time}`);
      
      createDrinkEntryMutation.mutate({
        periodId: selectedPeriod.id,
        drinkName: customDrink.name,
        caffeineAmount: parseInt(customDrink.caffeine),
        timestamp: timestamp.toISOString(),
      }, {
        onSuccess: () => {
          toast({
            title: "Drink logged!",
            description: `${customDrink.name} (${customDrink.caffeine}mg) added for ${format(timestamp, 'MMM d, h:mm a')}.`,
          });
          setCustomDrinkDialogOpen(false);
          setCustomDrink({ 
            name: "", 
            caffeine: "", 
            date: format(new Date(), 'yyyy-MM-dd'),
            time: format(new Date(), 'HH:mm')
          });
        },
      });
    }
  };

  const handleBulkImport = async (entries: Array<{ drinkName: string; caffeineAmount: number; timestamp: Date }>) => {
    if (!selectedPeriod) {
      toast({
        title: "No period selected",
        description: "Please create a period first.",
        variant: "destructive",
      });
      return;
    }

    let successCount = 0;
    let failCount = 0;

    for (const entry of entries) {
      try {
        await apiRequest("POST", "/api/drink-entries", {
          periodId: selectedPeriod.id,
          drinkName: entry.drinkName,
          caffeineAmount: entry.caffeineAmount,
          timestamp: entry.timestamp.toISOString(),
        });
        successCount++;
      } catch (error) {
        failCount++;
        console.error("Failed to import entry:", entry, error);
      }
    }

    queryClient.invalidateQueries({ queryKey: ["/api/drink-entries"] });

    toast({
      title: "Bulk import complete!",
      description: `Successfully imported ${successCount} drink(s)${failCount > 0 ? `, ${failCount} failed` : ''}.`,
      variant: failCount > 0 ? "destructive" : "default",
    });
  };

  const handleAddPeriod = (period: { name: string; startDate: string; endDate: string }) => {
    const data: InsertPeriod = {
      name: period.name,
      startDate: period.startDate,
      endDate: period.endDate,
    };
    
    createPeriodMutation.mutate(data, {
      onSuccess: () => {
        toast({
          title: "Period added!",
          description: `${period.name} has been created.`,
        });
      },
    });
  };

  const handleEditPeriod = (id: string, period: { name: string; startDate: string; endDate: string }) => {
    const data: InsertPeriod = {
      name: period.name,
      startDate: period.startDate,
      endDate: period.endDate,
    };
    
    updatePeriodMutation.mutate({ id, data }, {
      onSuccess: () => {
        toast({
          title: "Period updated!",
          description: `${period.name} has been updated.`,
        });
      },
    });
  };

  const handleDeletePeriod = (id: string) => {
    deletePeriodMutation.mutate(id, {
      onSuccess: () => {
        toast({
          title: "Period deleted!",
          description: "The period has been removed.",
        });
      },
    });
  };

  const handleTogglePeriodHidden = (id: string, hidden: boolean) => {
    togglePeriodHiddenMutation.mutate({ id, hidden }, {
      onSuccess: () => {
        toast({
          title: hidden ? "Period hidden" : "Period shown",
          description: hidden ? "The period has been hidden from the selector." : "The period is now visible in the selector.",
        });
      },
    });
  };

  const isLoading = periodsLoading || entriesLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-semibold">Loading...</div>
        </div>
      </div>
    );
  }

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
                  Manage Periods
                </TabsTrigger>
                <TabsTrigger value="settings" data-testid="tab-settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
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
              {periods.length > 0 ? (
                <PeriodSelector
                  periods={periods.map(p => ({ id: p.id, name: p.name }))}
                  selectedPeriodId={selectedPeriodId}
                  onPeriodChange={setSelectedPeriodId}
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No periods yet. Create one to get started!</p>
                  <Button onClick={() => setActiveTab("manage-periods")} data-testid="button-create-first-period">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Period
                  </Button>
                </div>
              )}
            </div>

            {periods.length > 0 && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  <div className="lg:col-span-2">
                    <section className="mb-8">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold">Quick Log</h2>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setBulkImportDialogOpen(true)}
                            data-testid="button-bulk-import"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Bulk Import
                          </Button>
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
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {quickDrinks.map((drink: DrinkConfig) => (
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
                  <h2 className="text-xl font-semibold mb-6">Period Statistics</h2>
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

                <section className="mb-8">
                  <h2 className="text-xl font-semibold mb-6">Yearly Statistics ({yearlyStats.year})</h2>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <StatCard
                      title="Total Caffeine"
                      value={`${yearlyStats.totalCaffeine.toLocaleString()}mg`}
                      subtitle={`All of ${yearlyStats.year}`}
                      icon={TrendingUp}
                      variant="default"
                    />
                    <StatCard
                      title="Total Drinks"
                      value={yearlyStats.totalDrinks.toLocaleString()}
                      subtitle="This year"
                      icon={Coffee}
                      variant="success"
                    />
                    <StatCard
                      title="Avg Drinks/Day"
                      value={yearlyStats.avgDrinksPerDay.toFixed(1)}
                      subtitle="Per day"
                      icon={Coffee}
                      variant="success"
                    />
                    <StatCard
                      title="Daily Average"
                      value={`${Math.round(yearlyStats.avgCaffeinePerDay)}mg`}
                      subtitle="Per day"
                      icon={Calendar}
                      variant="default"
                    />
                  </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <DailyIntakeChart data={dailyData} />
                  <DrinkHistoryList 
                    entries={drinkEntries
                      .filter(e => selectedPeriod ? e.periodId === selectedPeriod.id : true)
                      .map(e => ({
                        ...e,
                        timestamp: new Date(e.timestamp),
                      }))}
                    onDelete={(id) => deleteDrinkEntryMutation.mutate(id)}
                  />
                </div>
              </>
            )}
          </>
        )}

        {activeTab === "manage-periods" && (
          <div className="max-w-3xl mx-auto">
            <PeriodManagement
              periods={periods.map(p => ({
                id: p.id,
                name: p.name,
                startDate: format(new Date(p.startDate), 'yyyy-MM-dd'),
                endDate: format(new Date(p.endDate), 'yyyy-MM-dd'),
                hidden: p.hidden,
              }))}
              onAddPeriod={handleAddPeriod}
              onEditPeriod={handleEditPeriod}
              onDeletePeriod={handleDeletePeriod}
              onToggleHidden={handleTogglePeriodHidden}
            />
          </div>
        )}

        {activeTab === "settings" && (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-semibold mb-6">Quick Log Drinks</h2>
            <p className="text-muted-foreground mb-6">
              Customize the drinks that appear on your quick-log buttons. Changes are saved automatically.
            </p>
            <div className="space-y-4">
              {quickDrinks.map((drink, index) => (
                <div key={index} className="flex items-center gap-4 p-4 rounded-md border" data-testid={`quick-drink-${index}`}>
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`drink-name-${index}`}>Drink Name</Label>
                      <Input
                        id={`drink-name-${index}`}
                        value={drink.name}
                        onChange={(e) => {
                          const updated = [...quickDrinks];
                          updated[index] = { ...drink, name: e.target.value };
                          setQuickDrinks(updated);
                          localStorage.setItem('quickDrinks', JSON.stringify(updated));
                        }}
                        data-testid={`input-quick-drink-name-${index}`}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`drink-caffeine-${index}`}>Caffeine (mg)</Label>
                      <Input
                        id={`drink-caffeine-${index}`}
                        type="number"
                        value={drink.caffeineAmount}
                        onChange={(e) => {
                          const updated = [...quickDrinks];
                          updated[index] = { ...drink, caffeineAmount: parseInt(e.target.value) || 0 };
                          setQuickDrinks(updated);
                          localStorage.setItem('quickDrinks', JSON.stringify(updated));
                        }}
                        data-testid={`input-quick-drink-caffeine-${index}`}
                      />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const updated = quickDrinks.filter((_, i) => i !== index);
                      setQuickDrinks(updated);
                      localStorage.setItem('quickDrinks', JSON.stringify(updated));
                    }}
                    data-testid={`button-remove-quick-drink-${index}`}
                  >
                    ✕
                  </Button>
                </div>
              ))}
              {quickDrinks.length < 6 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    const updated = [...quickDrinks, { name: "New Drink", caffeineAmount: 0, icon: "coffee" as const }];
                    setQuickDrinks(updated);
                    localStorage.setItem('quickDrinks', JSON.stringify(updated));
                  }}
                  data-testid="button-add-quick-drink"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Quick Drink
                </Button>
              )}
              <Button
                variant="secondary"
                onClick={() => {
                  setQuickDrinks(DEFAULT_DRINKS);
                  localStorage.setItem('quickDrinks', JSON.stringify(DEFAULT_DRINKS));
                  toast({
                    title: "Reset to defaults",
                    description: "Quick-log drinks have been reset to defaults.",
                  });
                }}
                data-testid="button-reset-quick-drinks"
              >
                Reset to Defaults
              </Button>
            </div>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="drink-date">Date</Label>
                <Input
                  id="drink-date"
                  type="date"
                  value={customDrink.date}
                  onChange={(e) => setCustomDrink({ ...customDrink, date: e.target.value })}
                  data-testid="input-drink-date"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="drink-time">Time</Label>
                <Input
                  id="drink-time"
                  type="time"
                  value={customDrink.time}
                  onChange={(e) => setCustomDrink({ ...customDrink, time: e.target.value })}
                  data-testid="input-drink-time"
                />
              </div>
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

      <BulkImportDialog
        open={bulkImportDialogOpen}
        onOpenChange={setBulkImportDialogOpen}
        onImport={handleBulkImport}
      />

      <div className="hidden">
        <PrintableReport ref={printRef} data={reportData} />
      </div>
    </div>
  );
}
