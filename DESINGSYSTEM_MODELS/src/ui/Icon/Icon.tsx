import { cx } from "../utils";

export type IconSize = "xs" | "sm" | "md" | "lg";

export interface IconProps {
  /** Symbol id from the Kestrel sprite (see site/assets/icons.js), without the "i-" prefix. */
  name: string;
  size?: IconSize;
  className?: string;
}

/** Decorative icon. Always aria-hidden — the surrounding control carries the name. */
export function Icon({ name, size = "md", className }: IconProps) {
  return (
    <svg className={cx("k-icon", size !== "md" && `k-icon--${size}`, className)} aria-hidden="true">
      <use href={`#i-${name}`} />
    </svg>
  );
}
