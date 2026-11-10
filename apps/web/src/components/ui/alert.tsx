import type { ReactNode } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type AlertVariant = "info" | "warning" | "danger" | "success";

export interface AlertProps {
  variant: AlertVariant;
  title: string;
  children?: ReactNode;
  className?: string;
}

const config: Record<AlertVariant, { icon: LucideIcon; iconClass: string; border: string }> = {
  info: { icon: Info, iconClass: "text-info", border: "border-l-info" },
  warning: { icon: AlertTriangle, iconClass: "text-warning", border: "border-l-warning" },
  danger: { icon: XCircle, iconClass: "text-danger", border: "border-l-danger" },
  success: { icon: CheckCircle2, iconClass: "text-success", border: "border-l-success" },
};

export function Alert({ variant, title, children, className }: AlertProps) {
  const { icon: Icon, iconClass, border } = config[variant];
  return (
    <div
      role={variant === "danger" ? "alert" : "status"}
      className={cn(
        "flex gap-3 rounded-xl border border-l-4 border-[color:var(--color-border)] px-4 py-3",
        border,
        className,
      )}
    >
      <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", iconClass)} aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-sm font-semibold">{title}</p>
        {children && <div className="mt-1 text-sm text-secondary">{children}</div>}
      </div>
    </div>
  );
}
