import Image from "next/image";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/utils";

export interface AvatarProps {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg";
  status?: "online" | "busy" | "offline";
  className?: string;
}

const sizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
};

const statusColors = {
  online: "bg-success",
  busy: "bg-warning",
  offline: "bg-neutral-400",
};

export function Avatar({ name, src, size = "md", status, className }: AvatarProps) {
  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      <span
        className={cn(
          "flex items-center justify-center rounded-full font-semibold",
          "bg-gradient-to-br from-sage-400 to-serene-500 text-white select-none",
          sizes[size],
        )}
        aria-hidden={src ? "true" : undefined}
      >
        {src ? (
          <Image
            src={src}
            alt={name}
            width={56}
            height={56}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          initials(name)
        )}
      </span>
      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-[color:var(--color-surface)]",
            statusColors[status],
          )}
          role="img"
          aria-label={`Estado: ${status === "online" ? "en línea" : status === "busy" ? "ocupado" : "desconectado"}`}
        />
      )}
    </span>
  );
}
