export interface ProjectType {
  key: string;
  label: string;
  duration: number;
  yourHours: number;
  yourPercent: number;
  basePrice: number | null; // null = calculated
}

export interface AddOn {
  name: string;
  yourHours: number;
  juniorHours: number;
}

export interface ScheduledProject {
  id: string;
  name: string;
  type: string;
  hours: number;
  duration: number;
  price: number;
  preferredStart?: string;
  notes?: string;
  startDate: string;
  endDate: string;
}

export interface Settings {
  hourlyRate: number;
  juniorCost: number;
  customAddons: AddOn[];
}

export const PROJECT_TYPES: ProjectType[] = [
  { key: "flagship", label: "Flagship", duration: 21, yourHours: 61.6, yourPercent: 70, basePrice: 8000 },
  { key: "2day", label: "2-Day Intensive", duration: 2, yourHours: 12, yourPercent: 75, basePrice: 3500 },
  { key: "1day", label: "1-Day Intensive", duration: 1, yourHours: 6, yourPercent: 75, basePrice: 2000 },
  { key: "custom", label: "Custom", duration: 0, yourHours: 0, yourPercent: 75, basePrice: null },
];

export const DEFAULT_ADDONS: AddOn[] = [
  { name: "Landing Page Design", yourHours: 6, juniorHours: 12 },
  { name: "Social Media Templates", yourHours: 4, juniorHours: 8 },
  { name: "Extra Brand Assets", yourHours: 6, juniorHours: 8 },
  { name: "Website Mockups", yourHours: 4, juniorHours: 10 },
  { name: "Brand Guidelines Doc", yourHours: 2, juniorHours: 6 },
  { name: "Image Refinement", yourHours: 3, juniorHours: 8 },
];

export const DEFAULT_SETTINGS: Settings = {
  hourlyRate: 130,
  juniorCost: 35,
  customAddons: [],
};
