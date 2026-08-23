import type { KeyboardEvent } from "react";
import type { HandsWorkspaceSection } from "@/lib/handsWorkspace";

const sections: ReadonlyArray<{ id: HandsWorkspaceSection; label: string }> = [
  { id: "explore", label: "Explorar" },
  { id: "review", label: "Revisar" },
  { id: "track", label: "Acompanhar" },
];

export function HandsWorkspaceNav({ active, onChange, pendingCount = 0, activeTracking = false }: {
  active: HandsWorkspaceSection;
  onChange: (section: HandsWorkspaceSection) => void;
  pendingCount?: number;
  activeTracking?: boolean;
}) {
  function move(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? sections.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + sections.length) % sections.length;
    const next = sections[nextIndex];
    onChange(next.id);
    document.getElementById(`hands-tab-${next.id}`)?.focus();
  }

  return <nav className="hands-workspace-nav" aria-label="Áreas de mãos">
    <div role="tablist" aria-label="Organizar mãos pela sua intenção">
      {sections.map((section, index) => <button
        id={`hands-tab-${section.id}`}
        key={section.id}
        type="button"
        role="tab"
        aria-selected={active === section.id}
        aria-controls={`hands-panel-${section.id}`}
        tabIndex={active === section.id ? 0 : -1}
        onClick={() => onChange(section.id)}
        onKeyDown={(event) => move(event, index)}
      ><span>{section.label}</span>{section.id === "explore" && pendingCount > 0 && <small>{pendingCount} pendentes</small>}{section.id === "track" && activeTracking && <small>1 ativo</small>}</button>)}
    </div>
  </nav>;
}
