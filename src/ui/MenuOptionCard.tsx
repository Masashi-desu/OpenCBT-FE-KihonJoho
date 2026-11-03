import type { ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";

export function MenuOptionCard({ icon, title, caption, selected, disabled = false, onSelect }: {
  icon: ReactNode;
  title: string;
  caption: ReactNode;
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
}) {
  return <button type="button" className={`selection-option${selected ? " selected" : ""}`}
    aria-pressed={selected} disabled={disabled} onClick={onSelect}>
    <span className="selection-option-heading">
      <span className="selection-option-icon" aria-hidden="true">{icon}</span>
      <span className="selection-option-title">{title}</span>
    </span>
    <span className="selection-option-details">
      <span className="selection-option-caption">{caption}</span>
      <span className="selection-option-indicator" aria-hidden="true"><CheckCircle2 /></span>
    </span>
  </button>;
}
