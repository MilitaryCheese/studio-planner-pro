import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { type Settings, PROJECT_TYPES } from "@/lib/types";
import { TrendingUp } from "lucide-react";

interface ScenarioRow {
  type: string;
  count: number;
}

interface Props {
  settings: Settings;
}

export default function ProjectionTab({ settings }: Props) {
  const [scenarios, setScenarios] = useState<ScenarioRow[]>([
    { type: "flagship", count: 2 },
    { type: "2day", count: 3 },
    { type: "1day", count: 2 },
  ]);

  const updateCount = (index: number, count: number) => {
    setScenarios((prev) => prev.map((s, i) => (i === index ? { ...s, count } : s)));
  };

  const projection = useMemo(() => {
    let totalRevenue = 0;
    let totalHours = 0;
    let totalDays = 0;

    scenarios.forEach((s) => {
      const type = PROJECT_TYPES.find((t) => t.key === s.type);
      if (!type || !type.basePrice) return;
      totalRevenue += type.basePrice * s.count;
      totalHours += type.yourHours * s.count;
      totalDays += type.duration * s.count;
    });

    const workingDaysInQuarter = 65; // ~13 weeks × 5 days
    const utilization = totalDays / workingDaysInQuarter;

    return { totalRevenue, totalHours, totalDays, utilization, workingDaysInQuarter };
  }, [scenarios]);

  const utilizationColor =
    projection.utilization > 0.9
      ? "text-destructive"
      : projection.utilization > 0.7
      ? "text-accent"
      : "text-success";

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Quarterly Projection
        </h2>
        <p className="text-muted-foreground mt-1">
          Forecast revenue by adjusting project counts
        </p>
      </div>

      <Card className="p-5">
        <h3 className="font-semibold mb-4">Scenario Builder</h3>
        <div className="space-y-3">
          {scenarios.map((s, i) => {
            const type = PROJECT_TYPES.find((t) => t.key === s.type)!;
            const lineRevenue = (type.basePrice ?? 0) * s.count;
            return (
              <div key={s.type} className="flex items-center gap-4">
                <span className="text-sm font-medium w-36">{type.label}</span>
                <Input
                  type="number"
                  className="w-20"
                  value={s.count}
                  onChange={(e) => updateCount(i, Math.max(0, Number(e.target.value)))}
                  min={0}
                />
                <span className="text-sm text-muted-foreground">×</span>
                <span className="mono text-sm">${(type.basePrice ?? 0).toLocaleString()}</span>
                <span className="text-sm text-muted-foreground">=</span>
                <span className="mono text-sm font-medium text-primary">
                  ${lineRevenue.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">Revenue</span>
          <div className="mono text-2xl font-bold text-primary mt-1">
            ${projection.totalRevenue.toLocaleString()}
          </div>
        </Card>
        <Card className="p-4">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">Your Hours</span>
          <div className="mono text-2xl font-bold mt-1">{projection.totalHours}h</div>
        </Card>
        <Card className="p-4">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">Days Booked</span>
          <div className="mono text-2xl font-bold mt-1">
            {projection.totalDays}
            <span className="text-sm font-normal text-muted-foreground">
              /{projection.workingDaysInQuarter}
            </span>
          </div>
        </Card>
        <Card className="p-4">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">Utilization</span>
          <div className={`mono text-2xl font-bold mt-1 ${utilizationColor}`}>
            {Math.round(projection.utilization * 100)}%
          </div>
          {projection.utilization > 0.9 && (
            <Badge variant="destructive" className="mt-1 text-xs">
              Over capacity
            </Badge>
          )}
        </Card>
      </div>

      <Card className="p-5 bg-secondary/50">
        <h3 className="font-semibold text-sm mb-2">Revenue per Hour</h3>
        <span className="mono text-xl font-bold text-primary">
          ${projection.totalHours > 0 ? Math.round(projection.totalRevenue / projection.totalHours) : 0}/hr
        </span>
        <p className="text-xs text-muted-foreground mt-1">
          Based on your hours only (excludes junior time)
        </p>
      </Card>
    </div>
  );
}
