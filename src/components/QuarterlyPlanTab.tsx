import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { type Settings, type ScheduledProject } from "@/lib/types";
import { findNextAvailableStart, getQuarterRange, getBusinessDaysInRange, formatDate, getMonthsInQuarter } from "@/lib/scheduler";
import { CalendarDays, Plus, Trash2, AlertTriangle } from "lucide-react";
import MonthCalendar from "./MonthCalendar";

interface Props {
  settings: Settings;
  projects: ScheduledProject[];
  onProjectsChange: (p: ScheduledProject[]) => void;
}

export default function QuarterlyPlanTab({ settings, projects, onProjectsChange }: Props) {
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState(settings.projectTypes[0]?.key ?? "");
  const [preferredStart, setPreferredStart] = useState("");
  const [notes, setNotes] = useState("");
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  const now = new Date();
  const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
  const currentYear = now.getFullYear();
  const [quarter, setQuarter] = useState(currentQuarter);
  const [year, setYear] = useState(currentYear);

  const qRange = useMemo(() => getQuarterRange(year, quarter), [year, quarter]);
  const totalBusinessDays = useMemo(() => getBusinessDaysInRange(qRange.start, qRange.end), [qRange]);
  const months = useMemo(() => getMonthsInQuarter(year, quarter), [year, quarter]);

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

  const utilization = totalBusinessDays > 0 ? bookedDays / totalBusinessDays : 0;

  const addProject = () => {
    if (!newName.trim()) return;
    setScheduleError(null);

    const type = settings.projectTypes.find((t) => t.key === newType);
    if (!type) return;

    const duration = type.basePrice === null && type.duration === 0 ? 5 : type.duration;
    const hours = type.basePrice === null && type.yourHours === 0 ? 20 : type.yourHours;
    const price = type.basePrice ?? hours * settings.hourlyRate;

    const result = findNextAvailableStart(
      projects,
      duration,
      settings.projectTypes,
      newType,
      preferredStart || undefined
    );

    if (!result) {
      setScheduleError(`Could not find an available slot for "${newName.trim()}". All dates within the next year are booked. Try a different preferred start date or remove existing projects.`);
      return;
    }

    const project: ScheduledProject = {
      id: Date.now().toString(),
      name: newName.trim(),
      type: newType,
      hours,
      duration,
      price,
      preferredStart: preferredStart || undefined,
      notes: notes || undefined,
      startDate: result.startDate,
      endDate: result.endDate,
    };

    onProjectsChange([...projects, project]);
    setNewName("");
    setNotes("");
    setPreferredStart("");
  };

  const removeProject = (id: string) => {
    onProjectsChange(projects.filter((p) => p.id !== id));
  };

  const typeColors: Record<string, string> = {};
  const colorPalette = [
    "bg-primary/20 text-primary",
    "bg-accent/20 text-accent-foreground",
    "bg-success/20 text-success",
    "bg-secondary text-secondary-foreground",
    "bg-destructive/10 text-destructive",
    "bg-primary/10 text-primary",
  ];
  settings.projectTypes.forEach((pt, i) => {
    typeColors[pt.key] = colorPalette[i % colorPalette.length];
  });

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
        {scheduleError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{scheduleError}</AlertDescription>
          </Alert>
        )}
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
                {settings.projectTypes.map((t) => (
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

      {/* Monthly Calendars */}
      <div className="space-y-4">
        {months.map((month) => (
          <MonthCalendar
            key={month.name}
            month={month}
            projects={quarterProjects}
            typeColors={typeColors}
            projectTypes={settings.projectTypes}
          />
        ))}

        {/* Legend */}
        <div className="flex gap-4 flex-wrap px-1">
          {settings.projectTypes.map((t) => (
            <div key={t.key} className="flex items-center gap-1.5 text-xs">
              <div className={`w-3 h-3 rounded-sm ${typeColors[t.key]}`} />
              {t.label}
              {t.isIntensive && <span className="text-muted-foreground">(can overlap)</span>}
            </div>
          ))}
        </div>
      </div>

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
                    {settings.projectTypes.find((t) => t.key === p.type)?.label ?? p.type}
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
