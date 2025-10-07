"use client";

import { useGetTasks } from "@/hooks/useTasks";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  UniqueIdentifier,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useEffect, useMemo, useRef, useState } from "react";
import { Socket, io } from "socket.io-client";
import { ColumnData, Task } from "../lib/task";

import DroppableColumn from "./DroppableColumn";
import ExportForm from "./exportForm";
import Form from "./Form";
import SortableItem from "./sortableItem";
import { Spinner } from "./ui/spinner";



const COLUMN_KEYS = ["Por hacer", "En progreso", "Completado"] as const;


const SOCKET_URL = "http://localhost:3000/kanban";

const emptyColumns = (): ColumnData =>
  COLUMN_KEYS.reduce((acc, k) => {
    acc[k] = [];
    return acc;
  }, {} as ColumnData);

const TableStacks = ({ isLoading }: { isLoading: boolean }) => {
  const { data, mutate } = useGetTasks();

  const [columns, setColumns] = useState<ColumnData>(emptyColumns());
  const [activeId, setActiveId] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5
      },
      showConstraintCue: true
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })

  );

  // -----------------------------
  // Conexión Socket.IO (una sola)
  // -----------------------------
  useEffect(() => {
    mutate()
    if (!socketRef.current) {
      const s = io(SOCKET_URL, { transports: ["websocket"] });
      socketRef.current = s;

      s.on("connect", () => console.log("WS connected:", s.id));
      s.on("connect_error", (err) =>
        console.warn("WS connect_error:", err.message)
      );
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);


  useEffect(() => {
    // normalizar entrada a un array
    const incoming = (data as any)?.data ?? (data as any)?.tasks ?? data;
    const tasks: Task[] = Array.isArray(incoming) ? incoming : [];

    if (!tasks.length) return;

    const grouped: ColumnData = emptyColumns();
    tasks.forEach((t) => {
      if (grouped[t.columnId]) grouped[t.columnId].push(t);
    });

    (Object.keys(grouped) as (keyof ColumnData)[]).forEach((col) => {
      grouped[col].sort((a, b) => {
        const pa = a.position ?? Number.MAX_SAFE_INTEGER;
        const pb = b.position ?? Number.MAX_SAFE_INTEGER;
        if (pa !== pb) return pa - pb;
        const ca = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const cb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return ca - cb;
      });
    });

    setColumns(grouped);
  }, [data]);

  // -----------------------------------------
  // Tiempo real: taskUpdated → insertar por position
  // -----------------------------------------
  useEffect(() => {
    const s = socketRef.current;
    if (!s) return;

    const onUpdated = (updatedTask: Task) => {
      setColumns((prev) => {
        // eliminar de cualquier columna
        const copy: ColumnData = Object.fromEntries(
          Object.entries(prev).map(([k, arr]) => [k, arr.filter((t) => t._id !== updatedTask._id)])
        ) as ColumnData;

        const col = updatedTask.columnId;
        const arr = [...(copy[col] ?? [])];

        if (
          typeof updatedTask.position === "number" &&
          updatedTask.position >= 0 &&
          updatedTask.position <= arr.length
        ) {
          arr.splice(updatedTask.position, 0, updatedTask);
        } else {
          arr.push(updatedTask);
        }

        copy[col] = arr;
        return copy;
      });
    };

    s.on("taskUpdated", onUpdated);
    return () => {
      s.off("taskUpdated", onUpdated);
    };
  }, []);

  // -----------------------------------------
  // Tiempo real: columnReordered → reemplazar columna
  // -----------------------------------------
  useEffect(() => {
    const s = socketRef.current;
    if (!s) return;

    const onColumnReordered = (data: { columnId: string; tasks: Task[] }) => {
      setColumns((prev) => ({ ...prev, [data.columnId]: data.tasks }));
    };

    s.on("columnReordered", onColumnReordered);
    return () => {
      s.off("columnReordered", onColumnReordered);
    };
  }, []);

  // -----------------------------------------
  // DnD handlers
  // -----------------------------------------
  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const s = socketRef.current;
    const draggedId = String(active.id);
    const overId = String(over.id);

    // columna origen
    const sourceColumnId = Object.keys(columns).find((col) =>
      columns[col].some((t) => t._id === draggedId)
    );
    if (!sourceColumnId) return;

    const isOverColumn = over.data?.current?.type === "column";
    // columna destino
    const targetColumnId = isOverColumn
      ? overId
      : Object.keys(columns).find((col) => columns[col].some((t) => t._id === overId));

    if (!targetColumnId) return;

    // === 1) Reordenar dentro de la misma columna ===
    if (sourceColumnId === targetColumnId) {
      const tasks = [...columns[sourceColumnId]];
      const oldIndex = tasks.findIndex((t) => t._id === draggedId);
      const newIndex = isOverColumn
        ? tasks.length - 1 // sobre zona libre → al final
        : tasks.findIndex((t) => t._id === overId);

      if (oldIndex < 0 || newIndex < 0) return;

      const newTasks = arrayMove(tasks, oldIndex, newIndex);

      // UI optimista
      setColumns((prev) => ({ ...prev, [sourceColumnId]: newTasks }));

      // Persistencia: recalcular positions 0..n-1
      const payload = newTasks.map((t, idx) => ({ taskId: t._id, position: idx }));
      s?.emit("reorderColumn", { columnId: sourceColumnId, items: payload });
      return;
    }

    // === 2) Mover ENTRE columnas ===
    const activeTask = columns[sourceColumnId].find((t) => t._id === draggedId);
    if (!activeTask) return;

    const targetArr = [...(columns[targetColumnId] ?? [])];

    // índice destino
    let targetIndex: number;
    if (isOverColumn) {
      // soltaste en la “columna”
      targetIndex = targetArr.length === 0 ? 0 : targetArr.length;
    } else {
      // soltaste sobre una task → insertar antes de esa task
      const idx = targetArr.findIndex((t) => t._id === overId);
      targetIndex = idx === -1 ? targetArr.length : idx;
    }

    // UI optimista
    const newSource = columns[sourceColumnId].filter((t) => t._id !== draggedId);
    const moved: Task = { ...activeTask, columnId: targetColumnId, position: targetIndex };
    const newTarget = [...targetArr];
    newTarget.splice(targetIndex, 0, moved);

    setColumns((prev) => ({
      ...prev,
      [sourceColumnId]: newSource,
      [targetColumnId]: newTarget,
    }));

    // Persistencia mínima: task con nueva columna + position inicial
    s?.emit("updateTask", {
      taskId: draggedId,
      updatedData: { columnId: targetColumnId, position: targetIndex },
    });

    // Compactar positions 0..n-1 en ambas columnas
    const sourcePayload = newSource.map((t, idx) => ({ taskId: t._id, position: idx }));
    const targetPayload = newTarget.map((t, idx) => ({ taskId: t._id, position: idx }));

    s?.emit("reorderColumn", { columnId: sourceColumnId, items: sourcePayload });
    s?.emit("reorderColumn", { columnId: targetColumnId, items: targetPayload });
  }

  const activeTask: Task | undefined = useMemo(() => {
    if (!activeId) return undefined;
    const key = Object.keys(columns).find((col) =>
      columns[col].some((t) => t._id === activeId)
    );
    return key ? columns[key].find((t) => t._id === activeId) : undefined;
  }, [activeId, columns]);



  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-wrap justify-center gap-4 text-white">
        {Object.keys(columns).map((colKey) => {
          const colTasks = columns[colKey] ?? [];
          const items: UniqueIdentifier[] = colTasks.map((t) => t._id || "");

          return (
            <DroppableColumn key={colKey} id={colKey}>
              <h2 className="font-bold mb-2 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${colKey === "Por hacer" ? "bg-gray-600" : colKey === "En progreso" ? "bg-yellow-400" : "bg-green-600"}`}></div>
                <span className="ml-2">{colKey} ({colTasks.length})</span>
              </h2>

              <SortableContext items={items} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {isLoading ? (
                    <Spinner />
                  ) : (
                    colTasks.map((task) => (
                      <SortableItem handle key={task._id} id={task._id} task={task} />
                    ))
                  )}
                </div>
              </SortableContext>

              {colKey === "Por hacer" && (
                <div className="mt-2">
                  <Form />
                </div>
              )}
            </DroppableColumn>
          );
        })}
      </div>

      <DragOverlay>
        {activeId && activeTask ? (
          <div style={{ width: 240 }}>
            <SortableItem id={activeTask._id} task={activeTask} handle={true} />
          </div>
        ) : null}
      </DragOverlay>

      <ExportForm columns={columns} />
    </DndContext>
  );
};

export default TableStacks;
