import { format } from "date-fns";
import { forwardRef } from "react";

interface DrinkTally {
  name: string;
  count: number;
}

interface DayData {
  day: string;
  date: string;
  drinks: DrinkTally[];
}

interface ReportData {
  periodName: string;
  startDate: Date;
  endDate: Date;
  totalCaffeine: number;
  totalDrinks: number;
  avgDrinksPerDay: number;
  avgCaffeinePerDay: number;
  weekData: DayData[];
}

interface PrintableReportProps {
  data: ReportData;
}

export const PrintableReport = forwardRef<HTMLDivElement, PrintableReportProps>(
  ({ data }, ref) => {
    return (
      <div ref={ref} className="p-8 bg-white text-black">
        <style>
          {`
            @media print {
              @page { 
                margin: 0.5in;
                size: landscape;
              }
              body { 
                -webkit-print-color-adjust: exact; 
                print-color-adjust: exact; 
              }
              .no-print { display: none !important; }
            }
          `}
        </style>
        
        <div className="mb-6">
          <div className="flex items-baseline justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-1">Caffeine Intake Report</h1>
              <p className="text-sm text-gray-500">
                Generated on {format(new Date(), "MMMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-semibold">{data.periodName}</h2>
              <p className="text-sm text-gray-600">
                {format(data.startDate, "MMM d, yyyy")} - {format(data.endDate, "MMM d, yyyy")}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Weekly Calendar</h2>
          <div className="grid grid-cols-5 gap-3">
            {data.weekData.map((dayData) => (
              <div
                key={dayData.day}
                className="border border-gray-300 rounded-md p-3"
              >
                <div className="text-center mb-2">
                  <div className="text-sm font-semibold">{dayData.day}</div>
                  <div className="text-xs text-gray-500">{dayData.date}</div>
                </div>
                <div className="space-y-1.5">
                  {dayData.drinks.length === 0 ? (
                    <div className="text-xs text-center text-gray-400 py-2">
                      No drinks
                    </div>
                  ) : (
                    dayData.drinks.map((drink, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-100 rounded px-2 py-1"
                      >
                        <div className="text-xs font-medium truncate" title={drink.name}>
                          {drink.name}
                        </div>
                        <div className="flex items-center gap-0.5 mt-1">
                          {Array.from({ length: drink.count }).map((_, i) => (
                            <div
                              key={i}
                              className="w-1.5 h-3 bg-black rounded-sm"
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
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="border border-gray-300 rounded-lg p-3">
            <h3 className="text-xs font-medium text-gray-600 mb-1">Total Caffeine</h3>
            <p className="text-2xl font-bold">{data.totalCaffeine}mg</p>
          </div>
          <div className="border border-gray-300 rounded-lg p-3">
            <h3 className="text-xs font-medium text-gray-600 mb-1">Total Drinks</h3>
            <p className="text-2xl font-bold">{data.totalDrinks}</p>
          </div>
          <div className="border border-gray-300 rounded-lg p-3">
            <h3 className="text-xs font-medium text-gray-600 mb-1">Avg Drinks/Day</h3>
            <p className="text-2xl font-bold">{data.avgDrinksPerDay.toFixed(1)}</p>
          </div>
          <div className="border border-gray-300 rounded-lg p-3">
            <h3 className="text-xs font-medium text-gray-600 mb-1">Avg Caffeine/Day</h3>
            <p className="text-2xl font-bold">{data.avgCaffeinePerDay.toFixed(0)}mg</p>
          </div>
        </div>
      </div>
    );
  }
);

PrintableReport.displayName = "PrintableReport";
