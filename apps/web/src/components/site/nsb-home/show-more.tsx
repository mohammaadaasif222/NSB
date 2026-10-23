"use client";

import { type ReactNode, useState } from "react";
import { Icon } from "./bits";
import { ICON } from "./content";

/**
 * Phone-only "Show more" under a grid: home.css hides the grid's items after the sixth until it
 * is tapped. Wider screens show every item and no button.
 */
export function ShowMore({ children, hiddenCount }: { children: ReactNode; hiddenCount: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="more" data-expanded={open}>
      {children}
      {hiddenCount > 0 && (
        <button type="button" className="smb" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          {open ? "Show less" : `Show more (${hiddenCount})`}
          <Icon d={ICON.chevronDown} size={16} />
        </button>
      )}
    </div>
  );
}
