import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl px-6 py-12 text-center",
        className,
      )}
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sage-100 text-sage-500 dark:bg-neutral-800 dark:text-sage-300">
        <Icon className="h-7 w-7" aria-hidden="true" />
      </span>
      <div className="max-w-sm">
        <h3 className="text-base font-semibold">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-secondary">{description}</p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
