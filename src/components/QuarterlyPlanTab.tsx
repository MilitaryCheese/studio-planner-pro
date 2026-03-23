import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type Settings, type ScheduledProject, PROJECT_TYPES } from "@/lib/types";
import { findNextAvailableStart, getQuarterRange, getBusinessDaysInRange, formatDate } from "@/lib/scheduler";
import { CalendarDays, Plus, Trash2, AlertTriangle } from "lucide-react";

interface Props {
  settings: Settings;
  projects: ScheduledProject[];
  onProjectsChange: (p: ScheduledProject[]) => void;
}

export default function QuarterlyPlanTab({ settings, projects, onProjectsChange }: Props) {
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("flagship");
  const [preferredStart, setPreferredStart] = useState("");
  const [notes, setNotes] = useState("");

  const now = new Date();
  const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
  const currentYear = now.getFullYear();
  const [quarter, setQuarter] = useState(currentQuarter);
  const [year, setYear] = useState(currentYear);

  const qRange = useMemo(() => getQuarterRange(year, quarter), [year, quarter]);
  const totalBusinessDays = useMemo(() => getBusinessDaysInRange(qRange.start, qRange.end), [qRange]);

  const quarterProjects = useMemo(
    () => projects.filter((p) => p.startDate <= qRange.end && p.endDate >= qRange.start),
    [projects, qRange]
  );

  const bookedDays = useMemo(
    () => quarterProjects.reduce((sum, p) => sum + p.duration, 0),
    [quarterProjects]
  );

  const quarterRevenue = useMemo(
    () => quarterProjects.reduce((sum, p) => sum + p.price, 0),
    [quarterProjects]
  );

  const utilization = bookedDays / totalBusinessDays;

  const addProject = () => {
    if (!newName.trim()) return;
    const type = PROJECT_TYPES.find((t) => t.key === newType)!;
    const duration = type.key === "custom" ? 5 : type.duration;
    const hours = type.key === "custom" ? 20 : type.yourHours;
    const price = type.basePrice ?? hours * settings.hourlyRate;

    const { startDate, endDate } = findNextAvailableStart(
      projects,
      duration,
      preferredStart || undefined
    );

    const project: ScheduledProject = {
      id: Date.now().toString(),
      name: newName.trim(),
      type: newType,
      hours,
      duration,
      price,
      preferredStart: preferredStart || undefined,
      notes: notes || undefined,
      startDate,
      endDate,
    };

    onProjectsChange([...projects, project]);
    setNewName("");
    setNotes("");
    setPreferredStart("");
  };

  const removeProject = (id: string) => {
    onProjectsChange(projects.filter((p) => p.id !== id));
  };

  // Simple calendar grid for the quarter
  const calendarWeeks = useMemo(() => {
    const start = new Date(qRange.start + "T00:00:00");
    const end = new Date(qRange.end + "T00:00:00");

    // Adjust start to Monday
    while (start.getDay() !== 1) start.setDate(start.getDate() - 1);

    const weeks: Date[][] = [];
    const current = new Date(start);
    while (current <= end || weeks.length === 0) {
      const week: Date[] = [];
      for (let d = 0; d < 7; d++) {
        week.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      weeks.push(week);
    }
    return weeks;
  }, [qRange]);

  const projectOnDate = (dateStr: string) =>
    quarterProjects.find((p) => dateStr >= p.startDate && dateStr <= p.endDate);

  const typeColors: Record<string, string> = {
    flagship: "bg-primary/20 text-primary",
    "2day": "bg-accent/20 text-accent-foreground",
    "1day": "bg-success/20 text-success",
    custom: "bg-secondary text-secondary-foreground",
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            Quarterly Plan
          </h2>
          <p className="text-muted-foreground mt-1">Schedule projects and view capacity</p>
        </div>
        <div className="flex gap-2 items-center">
          <Select value={String(quarter)} onValueChange={(v) => setQuarter(Number(v))}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Q1</SelectItem>
              <SelectItem value="2">Q2</SelectItem>
              <SelectItem value="3">Q3</SelectItem>
              <SelectItem value="4">Q4</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="number"
            className="w-24"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">Revenue</span>
          <div className="mono text-xl font-bold text-primary mt-1">
            ${quarterRevenue.toLocaleString()}
          </div>
        </Card>
        <Card className="p-4">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">Booked</span>
          <div className="mono text-xl font-bold mt-1">
            {bookedDays}
            <span className="text-sm font-normal text-muted-foreground">/{totalBusinessDays}d</span>
          </div>
        </Card>
        <Card className="p-4">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">Utilization</span>
          <div
            className={`mono text-xl font-bold mt-1 ${
              utilization > 0.9 ? "text-destructive" : utilization > 0.7 ? "text-accent" : "text-success"
            }`}
          >
            {Math.round(utilization * 100)}%
          </div>
          {utilization > 0.9 && (
            <div className="flex items-center gap-1 mt-1 text-destructive text-xs">
              <AlertTriangle className="h-3 w-3" /> Over capacity
            </div>
          )}
        </Card>
      </div>

      {/* Add Project Form */}
      <Card className="p-5 space-y-4">
        <h3 className="font-semibold">Schedule a Project</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <Label>Project Name</Label>
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Client name" />
          </div>
          <div>
            <Label>Type</Label>
            <Select value={newType} onValueChange={setNewType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROJECT_TYPES.map((t) => (
                  <SelectItem key={t.key} value={t.key}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Preferred Start</Label>
            <Input type="date" value={preferredStart} onChange={(e) => setPreferredStart(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button onClick={addProject} className="w-full gap-2">
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>
        </div>
        <div>
          <Label>Notes (optional)</Label>
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any notes..." />
        </div>
      </Card>

      {/* Calendar */}
      <Card className="p-5 overflow-x-auto">
        <h3 className="font-semibold mb-3">
          Q{quarter} {year} Calendar
        </h3>
        <div className="min-w-[600px]">
          <div className="grid grid-cols-7 text-xs text-muted-foreground font-medium mb-1">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d} className="text-center py-1">
                {d}
              </div>
            ))}
          </div>
          {calendarWeeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7">
              {week.map((day, di) => {
                const dateStr = formatDate(day);
                const inQuarter = dateStr >= qRange.start && dateStr <= qRange.end;
                const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                const project = !isWeekend ? projectOnDate(dateStr) : undefined;
                const isToday = dateStr === formatDate(new Date());

                return (
                  <div
                    key={di}
                    className={`relative h-10 flex items-center justify-center text-xs border-t transition-colors ${
                      !inQuarter
                        ? "text-muted-foreground/30"
                        : isWeekend
                        ? "bg-muted/50 text-muted-foreground/50"
                        : project
                        ? typeColors[project.type] || "bg-secondary"
                        : "hover:bg-secondary/50"
                    } ${isToday ? "ring-2 ring-primary ring-inset rounded-sm" : ""}`}
                    title={project ? `${project.name} (${project.type})` : dateStr}
                  >
                    {day.getDate()}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex gap-4 mt-3 flex-wrap">
          {PROJECT_TYPES.map((t) => (
            <div key={t.key} className="flex items-center gap-1.5 text-xs">
              <div className={`w-3 h-3 rounded-sm ${typeColors[t.key]}`} />
              {t.label}
            </div>
          ))}
        </div>
      </Card>

      {/* Project List */}
      {quarterProjects.length > 0 && (
        <Card className="p-5">
          <h3 className="font-semibold mb-3">Scheduled Projects</h3>
          <div className="space-y-2">
            {quarterProjects
              .sort((a, b) => a.startDate.localeCompare(b.startDate))
              .map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                >
                  <div className={`w-2 h-8 rounded-full ${typeColors[p.type]?.split(" ")[0] || "bg-muted"}`} />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-sm">{p.name}</span>
                    <div className="text-xs text-muted-foreground flex gap-2 flex-wrap">
                      <span>{p.startDate} → {p.endDate}</span>
                      <span>·</span>
                      <span>{p.duration}d</span>
                      <span>·</span>
                      <span className="mono">${p.price.toLocaleString()}</span>
                    </div>
                    {p.notes && (
                      <span className="text-xs text-muted-foreground italic">{p.notes}</span>
                    )}
                  </div>
                  <Badge variant="secondary" className="text-xs shrink-0">
                    {PROJECT_TYPES.find((t) => t.key === p.type)?.label}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive shrink-0"
                    onClick={() => removeProject(p.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
          </div>
        </Card>
      )}
    </div>
  );
}
