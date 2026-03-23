import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { type Settings, type AddOn, type ProjectType } from "@/lib/types";
import { Settings2, Plus, Trash2, Pencil, Check, X } from "lucide-react";

interface Props {
  settings: Settings;
  onUpdate: (s: Settings) => void;
}

export default function SettingsTab({ settings, onUpdate }: Props) {
  const [newName, setNewName] = useState("");
  const [newYourHrs, setNewYourHrs] = useState(4);
  const [newJuniorHrs, setNewJuniorHrs] = useState(8);

  // Project type form
  const [newPtLabel, setNewPtLabel] = useState("");
  const [newPtDuration, setNewPtDuration] = useState(5);
  const [newPtHours, setNewPtHours] = useState(20);
  const [newPtPercent, setNewPtPercent] = useState(75);
  const [newPtPrice, setNewPtPrice] = useState<number | "">("");
  const [newPtIntensive, setNewPtIntensive] = useState(false);

  // Editing state
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ProjectType>>({});

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

  const addProjectType = () => {
    if (!newPtLabel.trim()) return;
    const key = newPtLabel.trim().toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();
    const newType: ProjectType = {
      key,
      label: newPtLabel.trim(),
      duration: newPtDuration,
      yourHours: newPtHours,
      yourPercent: newPtPercent,
      basePrice: newPtPrice === "" ? null : newPtPrice,
      isIntensive: newPtIntensive,
    };
    onUpdate({ ...settings, projectTypes: [...settings.projectTypes, newType] });
    setNewPtLabel("");
    setNewPtDuration(5);
    setNewPtHours(20);
    setNewPtPercent(75);
    setNewPtPrice("");
    setNewPtIntensive(false);
  };

  const removeProjectType = (key: string) => {
    onUpdate({ ...settings, projectTypes: settings.projectTypes.filter((t) => t.key !== key) });
  };

  const startEdit = (pt: ProjectType) => {
    setEditingKey(pt.key);
    setEditForm({ ...pt });
  };

  const cancelEdit = () => {
    setEditingKey(null);
    setEditForm({});
  };

  const saveEdit = () => {
    if (!editingKey) return;
    onUpdate({
      ...settings,
      projectTypes: settings.projectTypes.map((t) =>
        t.key === editingKey ? { ...t, ...editForm } as ProjectType : t
      ),
    });
    setEditingKey(null);
    setEditForm({});
  };

  return (
    <div className="space-y-6 animate-fade-in-up max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Settings2 className="h-5 w-5 text-primary" />
          Settings
        </h2>
        <p className="text-muted-foreground mt-1">Configure rates, project types, and add-ons</p>
      </div>

      {/* Rates */}
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

      {/* Project Types */}
      <Card className="p-5 space-y-4">
        <h3 className="font-semibold">Project Types</h3>

        <div className="space-y-2">
          {settings.projectTypes.map((pt) => (
            <div key={pt.key} className="rounded-lg border bg-card">
              {editingKey === pt.key ? (
                <div className="p-3 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Label</Label>
                      <Input
                        value={editForm.label ?? ""}
                        onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Duration (days)</Label>
                      <Input
                        type="number"
                        value={editForm.duration ?? 0}
                        onChange={(e) => setEditForm({ ...editForm, duration: Number(e.target.value) })}
                        min={0}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Your Hours</Label>
                      <Input
                        type="number"
                        value={editForm.yourHours ?? 0}
                        onChange={(e) => setEditForm({ ...editForm, yourHours: Number(e.target.value) })}
                        min={0}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Your % of Work</Label>
                      <Input
                        type="number"
                        value={editForm.yourPercent ?? 75}
                        onChange={(e) => setEditForm({ ...editForm, yourPercent: Number(e.target.value) })}
                        min={0}
                        max={100}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Base Price ($)</Label>
                      <Input
                        type="number"
                        value={editForm.basePrice ?? ""}
                        onChange={(e) => setEditForm({ ...editForm, basePrice: e.target.value ? Number(e.target.value) : null })}
                        placeholder="Auto-calc"
                      />
                    </div>
                    <div className="flex items-end gap-2 pb-1">
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <Checkbox
                          checked={editForm.isIntensive ?? false}
                          onCheckedChange={(v) => setEditForm({ ...editForm, isIntensive: !!v })}
                        />
                        Intensive (can overlap)
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" size="sm" onClick={cancelEdit}>
                      <X className="h-4 w-4 mr-1" /> Cancel
                    </Button>
                    <Button size="sm" onClick={saveEdit}>
                      <Check className="h-4 w-4 mr-1" /> Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3">
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium">{pt.label}</span>
                    <div className="text-xs text-muted-foreground flex gap-2 flex-wrap mt-0.5">
                      <span>{pt.duration}d</span>
                      <span>·</span>
                      <span>{pt.yourHours}h</span>
                      <span>·</span>
                      <span>{pt.yourPercent}%</span>
                      {pt.basePrice !== null && (
                        <>
                          <span>·</span>
                          <span className="mono">${pt.basePrice.toLocaleString()}</span>
                        </>
                      )}
                      {pt.isIntensive && (
                        <>
                          <span>·</span>
                          <span className="text-primary font-medium">Intensive</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(pt)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => removeProjectType(pt.key)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add new project type */}
        <div className="border-t pt-4 space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Add Project Type</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Label</Label>
              <Input value={newPtLabel} onChange={(e) => setNewPtLabel(e.target.value)} placeholder="e.g. Half-Day Sprint" />
            </div>
            <div>
              <Label className="text-xs">Duration (days)</Label>
              <Input type="number" value={newPtDuration} onChange={(e) => setNewPtDuration(Number(e.target.value))} min={1} />
            </div>
            <div>
              <Label className="text-xs">Your Hours</Label>
              <Input type="number" value={newPtHours} onChange={(e) => setNewPtHours(Number(e.target.value))} min={1} />
            </div>
            <div>
              <Label className="text-xs">Your % of Work</Label>
              <Input type="number" value={newPtPercent} onChange={(e) => setNewPtPercent(Number(e.target.value))} min={0} max={100} />
            </div>
            <div>
              <Label className="text-xs">Base Price ($)</Label>
              <Input
                type="number"
                value={newPtPrice}
                onChange={(e) => setNewPtPrice(e.target.value ? Number(e.target.value) : "")}
                placeholder="Leave empty for auto-calc"
              />
            </div>
            <div className="flex items-end gap-2 pb-1">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox
                  checked={newPtIntensive}
                  onCheckedChange={(v) => setNewPtIntensive(!!v)}
                />
                Intensive (can overlap)
              </label>
            </div>
          </div>
          <Button onClick={addProjectType} className="gap-2" size="sm">
            <Plus className="h-4 w-4" /> Add Type
          </Button>
        </div>
      </Card>

      {/* Custom Add-Ons */}
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
