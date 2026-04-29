import React, { useState } from 'react';
import { useStore, Task, TaskStatus } from '../store';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragStartEvent, 
  DragOverEvent, 
  DragEndEvent 
} from '@dnd-kit/core';
import { 
  SortableContext, 
  verticalListSortingStrategy, 
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MapPin, Calendar, CheckSquare } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

const COLUMNS: TaskStatus[] = ['Belum Dimulai', 'Sedang Dikerjakan', 'Ditunda', 'Selesai'];

function TaskCard({ task, isDragging, canModify = true }: { task: Task, isDragging?: boolean, canModify?: boolean }) {
  const { members, projects, setDashboardTaskToOpen } = useStore();
  const assignee = members.find(m => m.id === task.assigneeId);
  const project = projects.find(p => p.id === task.projectId);

  const getPriorityBadge = (p: string) => {
    switch(p) {
      case 'Urgent': return 'bg-red-50 text-red-600 border border-red-100 font-black uppercase tracking-widest';
      case 'Tinggi': return 'bg-amber-50 text-amber-600 border border-amber-100 font-black uppercase tracking-widest';
      case 'Sedang': return 'bg-indigo-50 text-indigo-600 border border-indigo-100 font-black uppercase tracking-widest';
      case 'Rendah': return 'bg-slate-50 text-slate-500 border border-slate-200 font-black uppercase tracking-widest';
      default: return 'bg-slate-50 text-slate-500 border border-slate-200';
    }
  };

  return (
    <div 
      onClick={() => setDashboardTaskToOpen(task)}
      className={`bg-white p-5 rounded-2xl border border-slate-200 shadow-sm transition-all duration-300 relative group
        ${isDragging ? 'opacity-50 scale-105 shadow-2xl rotate-2 cursor-grabbing z-50 ring-2 ring-indigo-500 border-transparent' : (canModify ? 'hover:shadow-lg hover:border-indigo-100 cursor-pointer active:scale-[0.98]' : 'opacity-80 cursor-pointer')}
      `}
    >
      {!canModify && (
        <div className="absolute top-3 right-3 flex space-x-1" title="Hanya PIC atau Admin yang dapat mengubah">
           <div className="w-2 h-2 rounded-full bg-slate-300"></div>
        </div>
      )}
      <div className="flex justify-between items-start mb-2 gap-2">
        <h4 className="text-sm font-black text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{task.title}</h4>
      </div>
      {project && (
        <div className="text-[10px] text-indigo-600 font-black tracking-[0.1em] uppercase mb-3 bg-indigo-50 inline-block px-2 py-0.5 rounded-md">
          {project.name}
        </div>
      )}
      <p className="text-xs text-slate-500 mb-4 line-clamp-2 font-medium">{task.description}</p>
      
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className={`text-[9px] px-2 py-1 rounded-full ${getPriorityBadge(task.priority)}`}>
          {task.priority}
        </span>
        {task.location && (
          <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-tighter text-slate-400 bg-slate-50 px-2 py-1 rounded-full border border-slate-100">
            <MapPin size={10} className="text-indigo-400" />
            <span className="truncate max-w-[80px]">{task.location}</span>
          </div>
        )}
        {task.checklist && task.checklist.length > 0 && (
          <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-tighter text-slate-400 bg-slate-50 px-2 py-1 rounded-full border border-slate-100">
            <CheckSquare size={10} className="text-emerald-400" />
            <span>{task.checklist.filter(c => c.isCompleted).length}/{task.checklist.length}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-auto">
        {assignee ? (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full border-2 border-white shadow-sm flex items-center justify-center overflow-hidden bg-slate-100">
              <img src={assignee.avatar} alt={assignee.name} title={assignee.name} className="w-full h-full object-cover" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{assignee.name.split(' ')[0]}</span>
          </div>
        ) : (
          <div className="w-6 h-6 rounded-full bg-slate-100" />
        )}
        <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-full border border-slate-100">
          <Calendar size={10} className="text-indigo-400" />
          {task.deadline ? format(new Date(task.deadline), 'dd MMM', { locale: idLocale }) : '-'}
        </div>
      </div>
    </div>
  );
}

function SortableTaskCard({ task, key }: { task: Task, key?: React.Key }) {
  const { currentUser } = useStore();
  const canModify = currentUser?.isAdmin || task.assigneeId === currentUser?.id;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: task.id,
    data: { type: 'Task', task },
    disabled: !canModify
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...(canModify ? listeners : {})}>
      <TaskCard task={task} isDragging={isDragging} canModify={canModify} />
    </div>
  );
}

function KanbanColumn({ status, tasks, key }: { status: TaskStatus, tasks: Task[], key?: React.Key }) {
  const { setNodeRef } = useSortable({
    id: status,
    data: { type: 'Column', status }
  });

  const getHeaderColor = () => {
    switch(status) {
      case 'Selesai': return 'bg-emerald-500';
      case 'Sedang Dikerjakan': return 'bg-indigo-600';
      case 'Ditunda': return 'bg-amber-500';
      case 'Belum Dimulai': default: return 'bg-slate-400';
    }
  };

  const getBgColor = () => {
    switch(status) {
      case 'Selesai': return 'bg-emerald-50/30';
      case 'Sedang Dikerjakan': return 'bg-indigo-50/20';
      case 'Ditunda': return 'bg-amber-50/30';
      case 'Belum Dimulai': default: return 'bg-slate-50/50';
    }
  };

  return (
    <div className={`flex flex-col ${getBgColor()} rounded-3xl w-[320px] max-w-[320px] shrink-0 border border-slate-200 overflow-hidden shadow-sm h-full`}>
      <div className="p-5 border-b border-slate-200 bg-white/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${getHeaderColor()} shadow-[0_0_12px_rgba(0,0,0,0.1)]`} />
          <h3 className="font-black text-slate-900 text-xs uppercase tracking-widest">{status}</h3>
          <span className="ml-auto bg-white border border-slate-200 text-slate-500 text-[10px] font-black px-3 py-1 rounded-full shadow-sm">
            {tasks.length}
          </span>
        </div>
      </div>
      
      <div ref={setNodeRef} className="flex-1 p-4 flex flex-col gap-4 min-h-[150px] overflow-y-auto custom-scrollbar">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <SortableTaskCard key={task.id} task={task} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

export function KanbanBoard() {
  const { tasks, updateTaskStatus } = useStore();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.type === 'Task') {
      setActiveTask(active.data.current.task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    
    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === 'Task';
    const isOverColumn = over.data.current?.type === 'Column';

    if (isActiveTask && isOverColumn) {
      updateTaskStatus(activeId as string, overId as TaskStatus);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;
    
    const isActiveTask = active.data.current?.type === 'Task';
    const isOverColumn = over.data.current?.type === 'Column';
    const isOverTask = over.data.current?.type === 'Task';

    if (isActiveTask && isOverColumn) {
       updateTaskStatus(activeId as string, overId as TaskStatus);
    } else if (isActiveTask && isOverTask) {
       const overTaskStatus = over.data.current?.task.status;
       updateTaskStatus(activeId as string, overTaskStatus);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 shrink-0">
        <h2 className="text-2xl font-black text-slate-900">Kanban Board</h2>
        <p className="text-slate-500 text-sm mt-1">Kelola workflow tugas dengan metode drag & drop yang intuitif.</p>
      </div>

      <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 h-full items-start">
            {COLUMNS.map(status => (
              <KanbanColumn 
                key={status} 
                status={status} 
                tasks={tasks.filter(t => t.status === status)} 
              />
            ))}
          </div>
          
          <DragOverlay>
            {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
