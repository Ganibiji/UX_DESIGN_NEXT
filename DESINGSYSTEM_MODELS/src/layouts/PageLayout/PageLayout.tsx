import type { ReactNode } from "react";
import { cx } from "@ui/index";

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav className="k-breadcrumb" aria-label="Breadcrumb">
      <ol>
        {items.map((c, i) => (
          <li key={c.label}>{i < items.length - 1 && c.href ? <a href={c.href}>{c.label}</a> : <span aria-current="page">{c.label}</span>}</li>
        ))}
      </ol>
    </nav>
  );
}

export interface PageLayoutProps {
  breadcrumb?: Crumb[];
  title: ReactNode;
  /** One line: what this page is for. Never a hero. */
  description?: ReactNode;
  /** Primary last (right-most). */
  actions?: ReactNode;
  /** "fill" makes the content fill the viewport (list pages with a grid). */
  variant?: "default" | "fill" | "narrow";
  children: ReactNode;
}

/** Breadcrumb · title · description · actions · content. */
export function PageLayout({ breadcrumb, title, description, actions, variant = "default", children }: PageLayoutProps) {
  return (
    <div className={cx("k-page", variant === "fill" && "k-page--fill", variant === "narrow" && "k-page--narrow")}>
      <div className="k-page-header">
        {breadcrumb && <Breadcrumb items={breadcrumb} />}
        <div className="k-page-header__row">
          <div className="k-page-header__titles">
            <h1 className="k-page-header__title">{title}</h1>
            {description && <p className="k-page-header__desc">{description}</p>}
          </div>
          {actions && <div className="k-page-header__actions">{actions}</div>}
        </div>
      </div>
      {children}
    </div>
  );
}
