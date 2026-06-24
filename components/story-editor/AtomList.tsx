'use client';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Atom } from '@/types/atoms';
import AtomCard from './AtomCard';

interface AtomListProps {
  atoms: Atom[];
  onUpdate: (id: string, updates: Partial<Atom>) => Promise<void>;
  onPublish: (id: string, sendPush: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onReorder: (activeId: string, overId: string) => Promise<void>;
}

export default function AtomList({ atoms, onUpdate, onPublish, onDelete, onReorder }: AtomListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      onReorder(active.id as string, over.id as string);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={atoms.map(a => a.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4">
          {atoms.map((atom) => (
            <AtomCard
              key={atom.id}
              atom={atom}
              onUpdate={onUpdate}
              onPublish={onPublish}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
