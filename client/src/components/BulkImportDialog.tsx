import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Upload } from "lucide-react";

interface BulkImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (entries: Array<{ drinkName: string; caffeineAmount: number; timestamp: Date }>) => void;
}

export function BulkImportDialog({ open, onOpenChange, onImport }: BulkImportDialogProps) {
  const [csvText, setCsvText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<Array<{ drinkName: string; caffeineAmount: number; timestamp: Date }>>([]);

  const parseCSV = (text: string) => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) {
      setError("CSV must have at least a header row and one data row");
      setPreview([]);
      return;
    }

    const header = lines[0].toLowerCase().trim();
    const validHeaders = ["drinkname,caffeineamount,date,time", "drink,caffeine,date,time", "drink name,caffeine amount,date,time"];
    
    if (!validHeaders.some(h => header.replace(/\s+/g, '').includes(h.replace(/,/g, '')))) {
      setError("CSV must have headers: drinkName, caffeineAmount, date, time (or variations)");
      setPreview([]);
      return;
    }

    const entries: Array<{ drinkName: string; caffeineAmount: number; timestamp: Date }> = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = line.split(',').map(p => p.trim());
      if (parts.length < 4) {
        errors.push(`Line ${i + 1}: Not enough columns`);
        continue;
      }

      const [drinkName, caffeineStr, dateStr, timeStr] = parts;
      const caffeineAmount = parseInt(caffeineStr);

      if (!drinkName) {
        errors.push(`Line ${i + 1}: Missing drink name`);
        continue;
      }
      if (isNaN(caffeineAmount) || caffeineAmount <= 0) {
        errors.push(`Line ${i + 1}: Invalid caffeine amount`);
        continue;
      }

      try {
        const timestamp = new Date(`${dateStr}T${timeStr}`);
        if (isNaN(timestamp.getTime())) {
          errors.push(`Line ${i + 1}: Invalid date/time format`);
          continue;
        }
        entries.push({ drinkName, caffeineAmount, timestamp });
      } catch {
        errors.push(`Line ${i + 1}: Could not parse date/time`);
      }
    }

    if (errors.length > 0) {
      setError(errors.join('\n'));
      setPreview([]);
      return;
    }

    if (entries.length === 0) {
      setError("No valid entries found");
      setPreview([]);
      return;
    }

    setError(null);
    setPreview(entries);
  };

  const handleTextChange = (text: string) => {
    setCsvText(text);
    if (text.trim()) {
      parseCSV(text);
    } else {
      setError(null);
      setPreview([]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
      parseCSV(text);
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (preview.length > 0) {
      onImport(preview);
      setCsvText("");
      setPreview([]);
      setError(null);
      onOpenChange(false);
    }
  };

  const exampleCSV = `drinkName,caffeineAmount,date,time
Coffee,100,2024-10-01,09:00
Energy Drink,160,2024-10-01,14:30
Tea,40,2024-10-02,10:15`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Import Drinks</DialogTitle>
          <DialogDescription>
            Import multiple drinks at once using CSV format. Upload a file or paste CSV data below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="file-upload" className="mb-2 block">Upload CSV File</Label>
            <div className="flex items-center gap-2">
              <input
                id="file-upload"
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                data-testid="input-csv-file"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('file-upload')?.click()}
                data-testid="button-upload-csv"
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose File
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="csv-text" className="mb-2 block">Or Paste CSV Data</Label>
            <Textarea
              id="csv-text"
              placeholder={exampleCSV}
              value={csvText}
              onChange={(e) => handleTextChange(e.target.value)}
              className="font-mono text-sm min-h-[200px]"
              data-testid="textarea-csv-input"
            />
          </div>

          {error && (
            <Alert variant="destructive" data-testid="alert-import-error">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="whitespace-pre-wrap">{error}</AlertDescription>
            </Alert>
          )}

          {preview.length > 0 && (
            <Alert data-testid="alert-import-preview">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                <strong>Ready to import {preview.length} drink(s)</strong>
                <div className="mt-2 max-h-32 overflow-y-auto space-y-1 text-sm">
                  {preview.slice(0, 5).map((entry, idx) => (
                    <div key={idx} className="text-muted-foreground">
                      • {entry.drinkName} ({entry.caffeineAmount}mg) - {entry.timestamp.toLocaleString()}
                    </div>
                  ))}
                  {preview.length > 5 && (
                    <div className="text-muted-foreground">... and {preview.length - 5} more</div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="bg-muted p-3 rounded-md">
            <p className="text-sm font-medium mb-2">CSV Format:</p>
            <pre className="text-xs bg-background p-2 rounded border overflow-x-auto">
              {exampleCSV}
            </pre>
            <p className="text-xs text-muted-foreground mt-2">
              • Headers: drinkName, caffeineAmount, date, time<br />
              • Date format: YYYY-MM-DD<br />
              • Time format: HH:MM (24-hour)
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel-import">
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={preview.length === 0}
            data-testid="button-confirm-import"
          >
            Import {preview.length > 0 ? `${preview.length} Drink${preview.length > 1 ? 's' : ''}` : 'Drinks'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
