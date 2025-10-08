import { format } from "date-fns";
import { forwardRef } from "react";

interface ReportData {
  periodName: string;
  startDate: Date;
  endDate: Date;
  totalCaffeine: number;
  totalDrinks: number;
  avgDrinksPerDay: number;
  avgCaffeinePerDay: number;
  dailyBreakdown: Array<{
    date: string;
    drinks: number;
    caffeine: number;
  }>;
  drinkHistory: Array<{
    drinkName: string;
    caffeineAmount: number;
    timestamp: Date;
  }>;
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
              @page { margin: 0.5in; }
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .no-print { display: none !important; }
              .page-break { page-break-after: always; }
            }
          `}
        </style>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Caffeine Intake Report</h1>
          <p className="text-gray-600">
            Generated on {format(new Date(), "MMMM d, yyyy 'at' h:mm a")}
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{data.periodName}</h2>
          <p className="text-gray-700">
            {format(data.startDate, "MMMM d, yyyy")} - {format(data.endDate, "MMMM d, yyyy")}
          </p>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4">
          <div className="border border-gray-300 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Total Caffeine</h3>
            <p className="text-3xl font-bold">{data.totalCaffeine}mg</p>
          </div>
          <div className="border border-gray-300 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Total Drinks</h3>
            <p className="text-3xl font-bold">{data.totalDrinks}</p>
          </div>
          <div className="border border-gray-300 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Avg Drinks/Day</h3>
            <p className="text-3xl font-bold">{data.avgDrinksPerDay.toFixed(1)}</p>
          </div>
          <div className="border border-gray-300 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Avg Caffeine/Day</h3>
            <p className="text-3xl font-bold">{data.avgCaffeinePerDay.toFixed(0)}mg</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Daily Breakdown</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-2 px-4">Date</th>
                <th className="text-right py-2 px-4">Drinks</th>
                <th className="text-right py-2 px-4">Caffeine (mg)</th>
              </tr>
            </thead>
            <tbody>
              {data.dailyBreakdown.map((day, idx) => (
                <tr key={idx} className="border-b border-gray-200">
                  <td className="py-2 px-4">{day.date}</td>
                  <td className="text-right py-2 px-4">{day.drinks}</td>
                  <td className="text-right py-2 px-4">{day.caffeine}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="page-break"></div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Complete History</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-2 px-4">Date & Time</th>
                <th className="text-left py-2 px-4">Drink</th>
                <th className="text-right py-2 px-4">Caffeine (mg)</th>
              </tr>
            </thead>
            <tbody>
              {data.drinkHistory.map((entry, idx) => (
                <tr key={idx} className="border-b border-gray-200">
                  <td className="py-2 px-4">
                    {format(entry.timestamp, "MMM d, yyyy h:mm a")}
                  </td>
                  <td className="py-2 px-4">{entry.drinkName}</td>
                  <td className="text-right py-2 px-4">{entry.caffeineAmount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
);

PrintableReport.displayName = "PrintableReport";
