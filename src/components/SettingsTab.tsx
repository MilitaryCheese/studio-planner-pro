import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { type Settings, type AddOn } from "@/lib/types";
import { Settings2, Plus, Trash2 } from "lucide-react";

interface Props {
  settings: Settings;
  onUpdate: (s: Settings) => void;
}

export default function SettingsTab({ settings, onUpdate }: Props) {
  const [newName, setNewName] = useState("");
  const [newYourHrs, setNewYourHrs] = useState(4);
  const [newJuniorHrs, setNewJuniorHrs] = useState(8);

  const addCustomAddon = () => {
    if (!newName.trim()) return;
    onUpdate({
      ...settings,
      customAddons: [
        ...settings.customAddons,
        { name: newName.trim(), yourHours: newYourHrs, juniorHours: newJuniorHrs },
      ],
    });
    setNewName("");
    setNewYourHrs(4);
    setNewJuniorHrs(8);
  };

  const removeCustomAddon = (index: number) => {
    onUpdate({
      ...settings,
      customAddons: settings.customAddons.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6 animate-fade-in-up max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Settings2 className="h-5 w-5 text-primary" />
          Settings
        </h2>
        <p className="text-muted-foreground mt-1">Configure rates and custom add-ons</p>
      </div>

      <Card className="p-5 space-y-4">
        <h3 className="font-semibold">Rates</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Your Hourly Rate ($)</Label>
            <Input
              type="number"
              value={settings.hourlyRate}
              onChange={(e) => onUpdate({ ...settings, hourlyRate: Number(e.target.value) })}
              min={1}
            />
          </div>
          <div>
            <Label>Junior Cost ($/hr)</Label>
            <Input
              type="number"
              value={settings.juniorCost}
              onChange={(e) => onUpdate({ ...settings, juniorCost: Number(e.target.value) })}
              min={1}
            />
          </div>
        </div>
      </Card>

      <Card className="p-5 space-y-4">
        <h3 className="font-semibold">Custom Add-Ons</h3>

        {settings.customAddons.length > 0 && (
          <div className="space-y-2">
            {settings.customAddons.map((addon, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg border bg-secondary/50">
                <div className="flex-1">
                  <span className="text-sm font-medium">{addon.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {addon.yourHours}h yours · {addon.juniorHours}h junior
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeCustomAddon(i)}
                  className="h-8 w-8 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-[1fr_80px_80px_auto] gap-2 items-end">
          <div>
            <Label>Name</Label>
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Motion Graphics" />
          </div>
          <div>
            <Label>Your Hrs</Label>
            <Input type="number" value={newYourHrs} onChange={(e) => setNewYourHrs(Number(e.target.value))} min={0} />
          </div>
          <div>
            <Label>Jr Hrs</Label>
            <Input type="number" value={newJuniorHrs} onChange={(e) => setNewJuniorHrs(Number(e.target.value))} min={0} />
          </div>
          <Button onClick={addCustomAddon} size="icon" className="h-9 w-9">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
