"use client";

import { Droplet, Droplets, Minus, Plus, Target } from "lucide-react";
import { useHealthStore, waterMl } from "@/stores/use-health-store";
import { WATER_GLASS_ML } from "@/lib/constants";
import { Button, ProgressBar } from "@/components/ui";
import { cn, percent } from "@/lib/utils";

/** Registro de hidratación: vasos de 250 ml con meta de 2 L. */
export function HydrationTracker() {
  const { waterGlasses, waterGoalGlasses, addWater, removeWater, ensureToday } =
    useHealthStore();
  ensureToday();

  const totalMl = waterMl(waterGlasses);
  const goalMl = waterGoalGlasses * WATER_GLASS_ML;
  const complete = waterGlasses >= waterGoalGlasses;

  return (
    <section aria-label="Registro de hidratación" className="card-surface p-5">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-info dark:bg-blue-700/30">
            <Droplets className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-base font-semibold">Hidratación</h2>
            <p className="text-xs text-secondary">
              {totalMl} ml de {goalMl.toLocaleString("es-ES")} ml
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon"
            aria-label="Quitar un vaso de agua"
            onClick={removeWater}
            disabled={waterGlasses === 0}
          >
            <Minus className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            size="icon"
            aria-label="Añadir un vaso de agua"
            onClick={() => addWater()}
            disabled={complete}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </header>

      <div className="mt-5 flex flex-wrap gap-1.5" role="list" aria-label="Vasos de agua del día">
        {Array.from({ length: waterGoalGlasses }, (_, i) => {
          const filled = i < waterGlasses;
          return (
            <button
              key={i}
              type="button"
              role="listitem"
              aria-label={filled ? `Vaso ${i + 1}: lleno` : `Vaso ${i + 1}: vacío, pulsa para rellenar`}
              onClick={() => {
                if (i === waterGlasses - 1) removeWater();
                else if (i >= waterGlasses) {
                  ensureToday();
                  useHealthStore.setState({ waterGlasses: i + 1 });
                }
              }}
              className={cn(
                "flex h-11 w-9 items-end justify-center rounded-b-xl rounded-t-md border-2 transition-all duration-200 ease-vitalia",
                filled
                  ? "border-info bg-info/15 text-info"
                  : "border-dashed border-[color:var(--color-border)] text-neutral-300 hover:border-info/50",
              )}
            >
              <Droplet className={cn("mb-1 h-4 w-4", filled && "fill-current")} aria-hidden="true" />
            </button>
          );
        })}
      </div>

      <ProgressBar
        className="mt-4"
        value={totalMl}
        max={goalMl}
        showValue
        label={`${percent(totalMl, goalMl)}% de la meta`}
        color={complete ? "success" : "serene"}
      />

      {complete && (
        <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-success">
          <Target className="h-3.5 w-3.5" aria-hidden="true" />
          ¡Meta diaria de hidratación alcanzada!
        </p>
      )}
    </section>
  );
}
