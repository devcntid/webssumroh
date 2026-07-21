"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { useEffect, useState } from "react";

interface SortableItem {
  id: number;
}

interface SortableListProps<T extends SortableItem> {
  items: T[];
  onReorder: (orderedIds: number[]) => Promise<void> | void;
  renderItem: (item: T) => React.ReactNode;
}

function Row<T extends SortableItem>({
  item,
  children,
}: {
  item: T;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.7 : 1,
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "var(--surface-2)",
        border: "0.5px solid var(--border)",
        borderRadius: 8,
        padding: "8px 10px",
        marginBottom: 6,
      }}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        style={{ cursor: "grab", color: "var(--text-muted)", padding: 4, background: "none", border: "none" }}
        aria-label="Drag to reorder"
      >
        <GripVertical size={14} />
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </div>
  );
}

export function SortableList<T extends SortableItem>({
  items,
  onReorder,
  renderItem,
}: SortableListProps<T>) {
  const [local, setLocal] = useState(items);
  useEffect(() => setLocal(items), [items]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = local.findIndex((i) => i.id === active.id);
    const newIndex = local.findIndex((i) => i.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(local, oldIndex, newIndex);
    const prev = local;
    setLocal(next);
    try {
      await onReorder(next.map((i) => i.id));
    } catch {
      setLocal(prev);
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={local.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        {local.map((item) => (
          <Row key={item.id} item={item}>
            {renderItem(item)}
          </Row>
        ))}
      </SortableContext>
    </DndContext>
  );
}
