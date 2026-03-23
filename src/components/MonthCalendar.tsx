import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { type ScheduledProject, type ProjectType } from "@/lib/types";
import { formatDate } from "@/lib/scheduler";

interface Props {
  month: { name: string; start: string; end: string };
  projects: ScheduledProject[];
  typeColors: Record<string, string>;
  projectTypes: ProjectType[];
}

export default function MonthCalendar({ month, projects, typeColors }: Props) {
  const calendarWeeks = useMemo(() => {
    const start = new Date(month.start + "T00:00:00");
    const end = new Date(month.end + "T00:00:00");

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
  }, [month]);

  const projectOnDate = (dateStr: string) =>
    projects.filter((p) => dateStr >= p.startDate && dateStr <= p.endDate);

  return (
    <Card className="p-4">
      <h4 className="font-semibold text-sm mb-2">{month.name}</h4>
      <div className="grid grid-cols-7 text-xs text-muted-foreground font-medium mb-1">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="text-center py-1">{d}</div>
        ))}
      </div>
      {calendarWeeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7">
          {week.map((day, di) => {
            const dateStr = formatDate(day);
            const inMonth = dateStr >= month.start && dateStr <= month.end;
            const isWeekend = day.getDay() === 0 || day.getDay() === 6;
            const dayProjects = !isWeekend ? projectOnDate(dateStr) : [];
            const isToday = dateStr === formatDate(new Date());
            const hasMultiple = dayProjects.length > 1;

            return (
              <div
                key={di}
                className={`relative h-9 flex items-center justify-center text-xs border-t transition-colors ${
                  !inMonth
                    ? "text-muted-foreground/30"
                    : isWeekend
                    ? "bg-muted/50 text-muted-foreground/50"
                    : !dayProjects.length
                    ? "hover:bg-secondary/50"
                    : ""
                } ${isToday ? "ring-2 ring-primary ring-inset rounded-sm" : ""}`}
                title={dayProjects.length > 0 ? dayProjects.map((p) => `${p.name} (${p.type})`).join(", ") : dateStr}
              >
                {dayProjects.length === 1 && (
                  <div className={`absolute inset-0 ${typeColors[dayProjects[0].type] || "bg-secondary"} rounded-sm`} />
                )}
                {dayProjects.length === 2 && (
                  <>
                    <div className={`absolute top-0 left-0 right-0 h-1/2 ${typeColors[dayProjects[0].type] || "bg-secondary"} rounded-t-sm`} />
                    <div className={`absolute bottom-0 left-0 right-0 h-1/2 ${typeColors[dayProjects[1].type] || "bg-secondary"} rounded-b-sm`} />
                  </>
                )}
                {dayProjects.length >= 3 && (
                  <>
                    <div className={`absolute top-0 left-0 right-0 h-1/3 ${typeColors[dayProjects[0].type] || "bg-secondary"} rounded-t-sm`} />
                    <div className={`absolute top-1/3 left-0 right-0 h-1/3 ${typeColors[dayProjects[1].type] || "bg-secondary"}`} />
                    <div className={`absolute bottom-0 left-0 right-0 h-1/3 ${typeColors[dayProjects[2].type] || "bg-secondary"} rounded-b-sm`} />
                  </>
                )}
                <span className="relative z-10">
                  {day.getDate()}
                  {dayProjects.length > 3 && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary text-[8px] text-white flex items-center justify-center font-bold">
                      {dayProjects.length}
                    </span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      ))}
    </Card>
  );
}
