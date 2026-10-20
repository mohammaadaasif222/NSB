"use client";

import { type ReactNode, useState } from "react";
import { ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import { IconButton } from "./form";

/**
 * A list the admin can reorder by dragging (desktop) or with the arrow buttons (touch and
 * keyboard). The new order shows immediately; `onReorder` saves it and returns false to roll back.
 *
 * `layout="rows"` (the demo admin's look) leaves each item's frame to `children` and hands it the
 * up/down arrows to place itself; the default list draws a grip and the arrows on the left.
 */
export function SortableList<T>({
  items,
  getId,
  getLabel,
  onReorder,
  disabled,
  layout = "list",
  children,
}: {
  items: T[];
  getId: (item: T) => string;
  getLabel: (item: T) => string;
  onReorder: (ids: string[]) => Promise<boolean>;
  disabled?: boolean;
  layout?: "list" | "rows";
  children: (item: T, arrows: ReactNode) => ReactNode;
}) {
  // Local order for optimistic moves; reset whenever the server sends a new list.
  const [source, setSource] = useState(items);
  const [order, setOrder] = useState(items);
  const [dragging, setDragging] = useState<number | null>(null);
  if (items !== source) {
    setSource(items);
    setOrder(items);
  }

  const move = async (from: number, to: number) => {
    if (disabled || from === to || to < 0 || to >= order.length) return;
    const previous = order;
    const next = [...order];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setOrder(next);
    if (!(await onReorder(next.map(getId)))) setOrder(previous);
  };

  const arrows = (item: T, i: number) => (
    <span className="flex flex-col">
      <IconButton label={`Move ${getLabel(item)} up`} disabled={disabled || i === 0} onClick={() => move(i, i - 1)} className="p-0.5">
        <ChevronUp className="size-4" aria-hidden />
      </IconButton>
      <IconButton
        label={`Move ${getLabel(item)} down`}
        disabled={disabled || i === order.length - 1}
        onClick={() => move(i, i + 1)}
        className="p-0.5"
      >
        <ChevronDown className="size-4" aria-hidden />
      </IconButton>
    </span>
  );

  return (
    <ul className={layout === "rows" ? "flex flex-col gap-2.5" : "divide-y divide-zinc-100"}>
      {order.map((item, i) => (
        <li
          key={getId(item)}
          draggable={!disabled}
          // stopPropagation keeps nested lists (sub-categories) independent of their parent list.
          onDragStart={(e) => {
            e.stopPropagation();
            setDragging(i);
            e.dataTransfer.effectAllowed = "move";
          }}
          onDragOver={(e) => {
            if (dragging === null) return;
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={(e) => {
            if (dragging === null) return;
            e.preventDefault();
            e.stopPropagation();
            void move(dragging, i);
            setDragging(null);
          }}
          onDragEnd={(e) => {
            e.stopPropagation();
            setDragging(null);
          }}
          className={
            layout === "rows"
              ? dragging === i
                ? "opacity-50"
                : undefined
              : `flex items-start gap-2 bg-white px-2 py-2 ${dragging === i ? "opacity-50" : ""}`
          }
        >
          {layout === "rows" ? (
            children(item, arrows(item, i))
          ) : (
            <>
              <span className="mt-3 hidden cursor-grab text-zinc-400 sm:block" aria-hidden>
                <GripVertical className="size-4" />
              </span>
              {arrows(item, i)}
              <div className="min-w-0 flex-1">{children(item, null)}</div>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}
