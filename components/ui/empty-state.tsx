import { Inbox } from "lucide-react";
import { Button } from "./button";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={[
        "flex flex-col items-center justify-center py-16 px-8 text-center",
        className,
      ].join(" ")}
    >
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-50 text-neutral-300">
        {icon || <Inbox className="h-8 w-8" />}
      </div>
      <h3 className="text-base font-semibold text-neutral-700">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-neutral-400">{description}</p>
      )}
      {action && (
        <div className="mt-5">
          {action.href ? (
            <a href={action.href}>
              <Button variant="primary" size="md">
                {action.label}
              </Button>
            </a>
          ) : (
            <Button variant="primary" size="md" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
