import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface Period {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  hidden?: number;
}

interface PeriodManagementProps {
  periods: Period[];
  onAddPeriod?: (period: Omit<Period, 'id'>) => void;
  onEditPeriod?: (id: string, period: Omit<Period, 'id'>) => void;
  onDeletePeriod?: (id: string) => void;
  onToggleHidden?: (id: string, hidden: boolean) => void;
}

export function PeriodManagement({
  periods,
  onAddPeriod,
  onEditPeriod,
  onDeletePeriod,
  onToggleHidden,
}: PeriodManagementProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showHidden, setShowHidden] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<Period | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
  });

  const displayedPeriods = showHidden ? periods : periods.filter(p => !p.hidden);

  const handleOpenDialog = (period?: Period) => {
    if (period) {
      setEditingPeriod(period);
      setFormData({
        name: period.name,
        startDate: period.startDate,
        endDate: period.endDate,
      });
    } else {
      setEditingPeriod(null);
      setFormData({ name: "", startDate: "", endDate: "" });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    // Validate that end date is not before start date
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end < start) {
        alert("End date cannot be before start date");
        return;
      }
    }

    if (editingPeriod) {
      onEditPeriod?.(editingPeriod.id, formData);
    } else {
      onAddPeriod?.(formData);
    }
    setIsDialogOpen(false);
    setFormData({ name: "", startDate: "", endDate: "" });
  };

  return (
    <>
      <Card data-testid="card-period-management">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
          <CardTitle>Manage Periods</CardTitle>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Label htmlFor="show-hidden" className="text-sm">Show hidden</Label>
              <Switch
                id="show-hidden"
                checked={showHidden}
                onCheckedChange={setShowHidden}
                data-testid="switch-show-hidden"
              />
            </div>
            <Button
              size="sm"
              onClick={() => handleOpenDialog()}
              data-testid="button-add-period"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Period
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {displayedPeriods.map((period) => (
              <div
                key={period.id}
                className={`flex items-center justify-between p-3 rounded-md ${period.hidden ? 'bg-muted/50 opacity-60' : 'bg-accent/50'}`}
                data-testid={`period-item-${period.id}`}
              >
                <div className="flex-1">
                  <div className="font-medium">{period.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {period.startDate} - {period.endDate}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onToggleHidden?.(period.id, !period.hidden)}
                    title={period.hidden ? "Show period" : "Hide period"}
                    data-testid={`button-toggle-hidden-${period.id}`}
                  >
                    {period.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenDialog(period)}
                    data-testid={`button-edit-period-${period.id}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeletePeriod?.(period.id)}
                    data-testid={`button-delete-period-${period.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent data-testid="dialog-period-form">
          <DialogHeader>
            <DialogTitle>
              {editingPeriod ? "Edit Period" : "Add New Period"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="period-name">Period Name</Label>
              <Input
                id="period-name"
                placeholder="e.g., Period 1, Week 1, etc."
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                data-testid="input-period-name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  data-testid="input-start-date"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  data-testid="input-end-date"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleSubmit}
              disabled={!formData.name || !formData.startDate || !formData.endDate}
              data-testid="button-submit-period"
            >
              {editingPeriod ? "Update Period" : "Add Period"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
