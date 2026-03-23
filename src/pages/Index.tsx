import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Settings, type ScheduledProject, DEFAULT_SETTINGS } from "@/lib/types";
import CalculatorTab from "@/components/CalculatorTab";
import SettingsTab from "@/components/SettingsTab";
import ProjectionTab from "@/components/ProjectionTab";
import QuarterlyPlanTab from "@/components/QuarterlyPlanTab";
import { Calculator, Settings2, TrendingUp, CalendarDays } from "lucide-react";

export default function Index() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [projects, setProjects] = useState<ScheduledProject[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('studio-planner-settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Failed to load settings from localStorage:', error);
      }
    }

    const savedProjects = localStorage.getItem('studio-planner-projects');
    if (savedProjects) {
      try {
        setProjects(JSON.parse(savedProjects));
      } catch (error) {
        console.error('Failed to load projects from localStorage:', error);
      }
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('studio-planner-settings', JSON.stringify(settings));
  }, [settings]);

  // Save projects to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('studio-planner-projects', JSON.stringify(projects));
  }, [projects]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-5xl flex items-center justify-between h-14 px-4">
          <h1 className="text-lg font-bold tracking-tight">Studio Planner</h1>
          <span className="text-xs text-muted-foreground mono">
            ${settings.hourlyRate}/hr
          </span>
        </div>
      </header>

      <main className="container max-w-5xl px-4 py-8">
        <Tabs defaultValue="calculator" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-lg">
            <TabsTrigger value="calculator" className="gap-1.5 text-xs sm:text-sm">
              <Calculator className="h-4 w-4" />
              <span className="hidden sm:inline">Calculator</span>
            </TabsTrigger>
            <TabsTrigger value="projection" className="gap-1.5 text-xs sm:text-sm">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Projection</span>
            </TabsTrigger>
            <TabsTrigger value="plan" className="gap-1.5 text-xs sm:text-sm">
              <CalendarDays className="h-4 w-4" />
              <span className="hidden sm:inline">Plan</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-1.5 text-xs sm:text-sm">
              <Settings2 className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calculator">
            <CalculatorTab settings={settings} />
          </TabsContent>
          <TabsContent value="projection">
            <ProjectionTab settings={settings} />
          </TabsContent>
          <TabsContent value="plan">
            <QuarterlyPlanTab
              settings={settings}
              projects={projects}
              onProjectsChange={setProjects}
            />
          </TabsContent>
          <TabsContent value="settings">
            <SettingsTab settings={settings} onUpdate={setSettings} projects={projects} onProjectsChange={setProjects} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}