"use client";

import { useState } from "react";
import { Tag } from "@/components/ui/tag";
import { Input, Select, Button } from "@/components/ui";
import type { Allergy } from "@vitalia/shared-types";
import { ALLERGY_SEVERITY_LABELS } from "@/lib/constants";

type Severity = Allergy["severity"];

interface AllergyTagsProps {
  allergies: Allergy[];
  onAdd: (data: { allergen: string; severity: Severity; reaction: string }) => void;
  onRemove: (id: string) => void;
}

const SEVERITY_VARIANT: Record<string, TagPropsVariant> = {
  mild: "sage",
  moderate: "serene",
  severe: "warning",
  "life-threatening": "danger",
};

type TagPropsVariant = "sage" | "serene" | "warning" | "danger" | "neutral";

export function AllergyTags({ allergies, onAdd, onRemove }: AllergyTagsProps) {
  const [allergen, setAllergen] = useState("");
  const [severity, setSeverity] = useState<Severity>("moderate");
  const [reaction, setReaction] = useState("");

  const severityOptions: Array<{ value: Severity; label: string }> = [
    { value: "mild", label: "Leve" },
    { value: "moderate", label: "Moderada" },
    { value: "severe", label: "Grave" },
    { value: "life-threatening", label: "Peligrosa para la vida" },
  ];

  const handleAdd = () => {
    if (!allergen.trim() || !reaction.trim()) return;
    onAdd({ allergen: allergen.trim(), severity, reaction: reaction.trim() });
    setAllergen("");
    setReaction("");
  };

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold">Alergias</h2>
      <div className="flex flex-wrap gap-2">
        {allergies.length === 0 && (
          <p className="text-xs text-secondary italic">No hay alergias registradas.</p>
        )}
        {allergies.map((a) => (
          <Tag
            key={a.id}
            label={`${a.allergen} · ${ALLERGY_SEVERITY_LABELS[a.severity] ?? a.severity}`}
            variant={SEVERITY_VARIANT[a.severity] ?? "sage"}
            onRemove={() => onRemove(a.id)}
          />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <Input label="Alergeno" value={allergen} onChange={(e) => setAllergen(e.target.value)} placeholder="Ej. Penicilina" />
        <Select value={severity} onChange={(e) => setSeverity(e.target.value as Severity)}>
          {severityOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </Select>
        <Input label="Reacción" value={reaction} onChange={(e) => setReaction(e.target.value)} placeholder="Ej. Urticaria" />
        <Button size="sm" onClick={handleAdd} type="submit">Añadir</Button>
      </div>
    </section>
  );
}
