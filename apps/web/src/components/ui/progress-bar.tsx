import { cn } from "@/lib/utils";

export interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  color?: "sage" | "serene" | "success" | "warning" | "danger";
  size?: "sm" | "md";
  className?: string;
}

const colors = {
  sage: "bg-sage-500",
  serene: "bg-serene-500",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

/** Barra de progreso lineal con semántica de medición. */
export function ProgressBar({
  value,
  max = 100,
  label,
  showValue = false,
  color = "sage",
  size = "md",
  className,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / Math.max(1, max)) * 100));
  const percent = Math.round(pct);

  return (
    <div className={cn("w-full", className)}>
      {(label || showValue) && (
        <div className="mb-1.5 flex items-center justify-between">
          {label && <span className="text-sm text-secondary">{label}</span>}
          {showValue && (
            <span className="text-sm font-semibold tabular-nums">{percent}%</span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={Math.round(value)}
        aria-valuemin={0}
        aria-valuemax={Math.round(max)}
        aria-label={label}
        className={cn(
          "w-full overflow-hidden rounded-full bg-sage-100 dark:bg-neutral-800",
          size === "sm" ? "h-1.5" : "h-2.5",
        )}
      >
        <div
          className={cn("h-full rounded-full transition-[width] duration-500 ease-vitalia", colors[color])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  color?: "sage" | "serene" | "success" | "warning" | "danger";
  className?: string;
}

const strokeColors = {
  sage: "#6b8c5c",
  serene: "#4A6fa5",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#dc2626",
};

/** Anillo de progreso SVG con texto central. */
export function CircularProgress({
  value,
  max = 100,
  size = 96,
  strokeWidth = 8,
  label,
  sublabel,
  color = "sage",
  className,
}: CircularProgressProps) {
  const pct = Math.min(1, Math.max(0, value / Math.max(1, max)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={Math.round(max)}
      aria-label={label}
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-sage-100 dark:stroke-neutral-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          stroke={strokeColors[color]}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-vitalia"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label && <span className="text-lg font-bold tabular-nums">{label}</span>}
        {sublabel && <span className="text-[10px] uppercase tracking-wide text-secondary">{sublabel}</span>}
      </div>
    </div>
  );
}
