import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Badge } from "@/components/ui/badge"
import { percentTone } from "@/features/admissions/domain/admission"
import type { Admission } from "@/features/admissions/domain/types"

function SortableRow({ admission, index }: { admission: Admission; index: number }) {
  const { t } = useTranslation()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: admission.sourceId })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`grid grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-2 border-b border-zinc-100 bg-white px-2.5 py-3 last:border-0 sm:grid-cols-[44px_minmax(0,1fr)_auto] sm:gap-3 sm:px-3 dark:border-zinc-800 dark:bg-zinc-900 ${isDragging ? "z-20 rounded-xl shadow-xl ring-1 ring-zinc-300 dark:ring-zinc-700" : ""}`}
    >
      <button
        type="button"
        aria-label={t("selection.dragLabel", { index: index + 1 })}
        className="flex h-9 w-9 touch-none items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 active:cursor-grabbing dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5" />
      </button>
      <div className="min-w-0">
        <div className="text-xs font-semibold text-zinc-400 dark:text-zinc-500">{index + 1}</div>
        <div className="text-sm font-medium leading-6 sm:text-base">{admission.name}</div>
      </div>
      <Badge variant={percentTone(admission.percent)}>{admission.percent}%</Badge>
    </div>
  )
}

export function SortableChoiceList({ items, onChange }: { items: Admission[]; onChange: (items: Admission[]) => void }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex((item) => item.sourceId === active.id)
    const newIndex = items.findIndex((item) => item.sourceId === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    onChange(arrayMove(items, oldIndex, newIndex))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={items.map((item) => item.sourceId)} strategy={verticalListSortingStrategy}>
        <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
          {items.map((item, index) => <SortableRow key={item.sourceId} admission={item} index={index} />)}
        </div>
      </SortableContext>
    </DndContext>
  )
}
