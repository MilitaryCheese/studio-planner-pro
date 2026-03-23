import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { DEFAULT_ADDONS, type Settings } from "@/lib/types";
import { Calculator } from "lucide-react";

interface Props {
  settings: Settings;
}

export default function CalculatorTab({ settings }: Props) {
  const [selectedType, setSelectedType] = useState(settings.projectTypes[0]?.key ?? "");
  const [customHours, setCustomHours] = useState(20);
  const [customDuration, setCustomDuration] = useState(5);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  const allAddons = [...DEFAULT_ADDONS, ...settings.customAddons];
  const projectType = settings.projectTypes.find((t) => t.key === selectedType);

  const isCustom = projectType?.basePrice === null;

  const basePrice = useMemo(() => {
    if (!projectType) return 0;
    if (isCustom) return customHours * settings.hourlyRate;
    return projectType.basePrice!;
  }, [projectType, isCustom, customHours, settings.hourlyRate]);

  const yourHours = isCustom ? customHours : (projectType?.yourHours ?? 0);
  const duration = isCustom ? customDuration : (projectType?.duration ?? 0);

  const addonTotal = useMemo(() => {
    return selectedAddons.reduce((sum, name) => {
      const addon = allAddons.find((a) => a.name === name);
      if (!addon) return sum;
      return sum + (addon.yourHours + addon.juniorHours) * settings.hourlyRate;
    }, 0);
  }, [selectedAddons, allAddons, settings.hourlyRate]);

  const addonCost = useMemo(() => {
    return selectedAddons.reduce((sum, name) => {
      const addon = allAddons.find((a) => a.name === name);
      if (!addon) return sum;
      return sum + addon.juniorHours * settings.juniorCost;
    }, 0);
  }, [selectedAddons, allAddons, settings.juniorCost]);

  const totalPrice = basePrice + addonTotal;

  const toggleAddon = (name: string) => {
    setSelectedAddons((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          Project Calculator
        </h2>
        <p className="text-muted-foreground mt-1">Price a project based on type and add-ons</p>
      </div>

      {/* Project Type Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {settings.projectTypes.map((type) => (
          <button
            key={type.key}
            onClick={() => setSelectedType(type.key)}
            className={`p-4 rounded-lg border-2 text-left transition-all duration-200 active:scale-[0.97] ${
              selectedType === type.key
                ? "border-primary bg-primary/5 shadow-md"
                : "border-border bg-card hover:border-primary/30 hover:shadow-sm"
            }`}
          >
            <span className="font-semibold text-sm">{type.label}</span>
            {type.basePrice !== null && (
              <span className="block mono text-lg mt-1 text-primary font-medium">
                ${type.basePrice.toLocaleString()}
              </span>
            )}
            {type.basePrice !== null ? (
              <span className="block text-xs text-muted-foreground mt-1">
                {type.duration}d · {type.yourHours}h · {type.yourPercent}%
              </span>
            ) : (
              <span className="block text-xs text-muted-foreground mt-1">
                You define
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Custom fields */}
      {isCustom && (
        <Card className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Your Hours</Label>
              <Input
                type="number"
                value={customHours}
                onChange={(e) => setCustomHours(Number(e.target.value))}
                min={1}
              />
            </div>
            <div>
              <Label>Duration (days)</Label>
              <Input
                type="number"
                value={customDuration}
                onChange={(e) => setCustomDuration(Number(e.target.value))}
                min={1}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Add-Ons */}
      <div>
        <h3 className="font-semibold text-lg mb-3">Add-Ons</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {allAddons.map((addon) => {
            const price = (addon.yourHours + addon.juniorHours) * settings.hourlyRate;
            const isSelected = selectedAddons.includes(addon.name);
            return (
              <button
                key={addon.name}
                onClick={() => toggleAddon(addon.name)}
                className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all duration-200 active:scale-[0.97] ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-primary/20"
                }`}
              >
                <Checkbox checked={isSelected} className="pointer-events-none" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium block truncate">{addon.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {addon.yourHours}h yours · {addon.juniorHours}h junior
                  </span>
                </div>
                <span className="mono text-sm font-medium text-primary">
                  +${price.toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <Card className="p-6 bg-primary/[0.03] border-primary/20">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg">Quote Summary</h3>
            <div className="mt-3 space-y-1 text-sm">
              <div className="flex justify-between gap-8">
                <span className="text-muted-foreground">Base ({projectType?.label ?? "—"})</span>
                <span className="mono font-medium">${basePrice.toLocaleString()}</span>
              </div>
              {addonTotal > 0 && (
                <div className="flex justify-between gap-8">
                  <span className="text-muted-foreground">Add-Ons ({selectedAddons.length})</span>
                  <span className="mono font-medium">${addonTotal.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t pt-2 mt-2 flex justify-between gap-8">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium">{duration} day{duration !== 1 ? "s" : ""}</span>
              </div>
              <div className="flex justify-between gap-8">
                <span className="text-muted-foreground">Your Hours</span>
                <span className="font-medium">{yourHours}h</span>
              </div>
              {addonCost > 0 && (
                <div className="flex justify-between gap-8">
                  <span className="text-muted-foreground">Junior Cost</span>
                  <span className="mono text-sm">${addonCost.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Total</span>
            <div className="mono text-3xl font-bold text-primary mt-1">
              ${totalPrice.toLocaleString()}
            </div>
            {addonCost > 0 && (
              <span className="text-xs text-muted-foreground block mt-1">
                Margin: ${(totalPrice - addonCost).toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
