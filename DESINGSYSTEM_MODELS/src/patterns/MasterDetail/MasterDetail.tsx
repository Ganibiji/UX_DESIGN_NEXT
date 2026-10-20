import { useRef, type KeyboardEvent, type ReactNode } from "react";
import { Icon } from "@ui/index";

export interface TreeNode {
  id: string;
  label: string;
  meta?: string;
  icon?: string;
  children?: TreeNode[];
}

export interface TreeProps {
  nodes: TreeNode[];
  label: string;
  selected: string;
  expanded: Set<string>;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
}

/** WAI-ARIA tree: ↑/↓ move, → expands, ← collapses, roving tabindex. */
export function Tree({ nodes, label, selected, expanded, onSelect, onToggle }: TreeProps) {
  const ref = useRef<HTMLUListElement>(null);
  const flat: Array<{ node: TreeNode; level: number }> = [];
  const walk = (list: TreeNode[], level: number) => list.forEach((n) => { flat.push({ node: n, level }); if (n.children && expanded.has(n.id)) walk(n.children, level + 1); });
  walk(nodes, 0);

  const onKeyDown = (e: KeyboardEvent) => {
    const i = flat.findIndex((f) => f.node.id === selected);
    const cur = flat[i]?.node;
    const focus = (id: string) => { onSelect(id); requestAnimationFrame(() => ref.current?.querySelector<HTMLButtonElement>(`[data-id="${id}"]`)?.focus()); };
    if (e.key === "ArrowDown" && flat[i + 1]) { e.preventDefault(); focus(flat[i + 1].node.id); }
    if (e.key === "ArrowUp" && flat[i - 1]) { e.preventDefault(); focus(flat[i - 1].node.id); }
    if (e.key === "ArrowRight" && cur?.children && !expanded.has(cur.id)) { e.preventDefault(); onToggle(cur.id); }
    if (e.key === "ArrowLeft" && cur?.children && expanded.has(cur.id)) { e.preventDefault(); onToggle(cur.id); }
  };

  const render = (list: TreeNode[], level: number): ReactNode =>
    list.map((n) => {
      const hasKids = Boolean(n.children?.length);
      const open = expanded.has(n.id);
      return (
        <li key={n.id} role="treeitem" aria-level={level + 1} aria-selected={n.id === selected} aria-expanded={hasKids ? open : undefined}>
          <button
            type="button"
            data-id={n.id}
            className="k-tree__row"
            style={{ ["--level" as string]: level }}
            tabIndex={n.id === selected ? 0 : -1}
            onClick={(e) => { if (hasKids && (e.target as HTMLElement).closest(".k-tree__toggle")) onToggle(n.id); else onSelect(n.id); }}
          >
            {hasKids ? <span className="k-tree__toggle"><Icon name="chevron-right" size="sm" /></span> : <span className="k-tree__leaf-spacer" />}
            {n.icon && <Icon name={n.icon} />}
            <span className="k-tree__label">{n.label}</span>
            {n.meta && <span className="k-tree__meta">{n.meta}</span>}
          </button>
          {hasKids && open && <ul role="group">{render(n.children!, level + 1)}</ul>}
        </li>
      );
    });

  return <ul ref={ref} className="k-tree" role="tree" aria-label={label} onKeyDown={onKeyDown}>{render(nodes, 0)}</ul>;
}

export interface MasterDetailProps {
  master: ReactNode;
  /** Optional header above the master list (search, filters). */
  masterToolbar?: ReactNode;
  children: ReactNode;
}

/** List on the left, selected item on the right. Stacks on tablets. */
export function MasterDetail({ master, masterToolbar, children }: MasterDetailProps) {
  return (
    <div className="k-master-detail">
      <div className="k-master-detail__master">
        {masterToolbar && <div className="k-grid__toolbar" style={{ minHeight: 44 }}>{masterToolbar}</div>}
        <div style={{ overflow: "auto", padding: 6 }}>{master}</div>
      </div>
      <div className="k-master-detail__detail">{children}</div>
    </div>
  );
}
