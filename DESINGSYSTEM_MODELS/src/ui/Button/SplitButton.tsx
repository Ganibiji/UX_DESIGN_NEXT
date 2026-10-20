import { Button, type ButtonVariant } from "./Button";
import { Dropdown, type MenuItem } from "../Dropdown/Dropdown";

export interface SplitButtonProps {
  label: string;
  onClick: () => void;
  /** Related actions, e.g. "Save & new", "Save as draft". */
  items: MenuItem[];
  variant?: Extract<ButtonVariant, "primary" | "secondary">;
  menuLabel?: string;
}

export function SplitButton({ label, onClick, items, variant = "primary", menuLabel = "More options" }: SplitButtonProps) {
  return (
    <div className="k-split">
      <Button variant={variant} onClick={onClick}>{label}</Button>
      <Dropdown
        items={items}
        align="end"
        trigger={(props) => <Button variant={variant} iconOnly icon="chevron-down" aria-label={menuLabel} {...props} />}
      />
    </div>
  );
}
