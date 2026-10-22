"use client";

import { useEffect, useState } from "react";
import { Icon } from "./bits";
import { AREAS, ICON } from "./content";

/** Area picker in the header. Display only for now: listings are not filtered by area. */
export function LocationMenu() {
  const [open, setOpen] = useState(false);
  const [area, setArea] = useState(AREAS[0]);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);

  return (
    <div className="loc">
      <button
        type="button"
        className="lb"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
      >
        <Icon d={ICON.pin} size={16} />
        <span>{area}</span>
        <Icon d={ICON.chevronDown} size={14} />
      </button>
      <div className={`lmn${open ? " open" : ""}`}>
        {AREAS.map((a) => (
          <button
            key={a}
            type="button"
            className={a === area ? "on" : undefined}
            onClick={() => {
              setArea(a);
              setOpen(false);
            }}
          >
            {a}
          </button>
        ))}
      </div>
    </div>
  );
}
