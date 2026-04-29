import { useState, useMemo, FormEvent, useEffect } from 'react';
import { useStore, Task, TaskStatus, TaskPriority, ChecklistItem } from '../store';
import { Plus, Edit2, Trash2, Search, Calendar, MapPin, CheckCircle2, ChevronDown, CheckSquare, Square, X, Download, Clock } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

export function TaskManagement() {
  const { currentUser, tasks, members, projects, addTask, updateTask, deleteTask, taskStatusFilter, setTaskStatusFilter, dashboardTaskToOpen, setDashboardTaskToOpen } = useStore();
  
  const exportToCSV = () => {
    const headers = ['ID', 'Judul', 'Proyek', 'PIC (Assignee)', 'Status', 'Prioritas', 'Lokasi', 'Tanggal Dibuat', 'Deadline', 'Realisasi Selesai', 'Durasi (Hari)', 'Keterangan/Kendala', 'Feedback'];
    
    const rows = tasks.map(task => {
      const project = projects.find(p => p.id === task.projectId);
      const assignee = members.find(m => m.id === task.assigneeId);
      const notes = (task.notes || []).map(n => n.text.replace(/"/g, '""')).join('; ');
      const feedbacks = (task.feedbacks || []).map(f => {
        const u = members.find(m => m.id === f.userId);
        return `${u?.name}: ${f.text.replace(/"/g, '""')}`;
      }).join('; ');

      const duration = differenceInDays(task.completedAt ? new Date(task.completedAt) : new Date(), new Date(task.createdAt)) + 1;

      return [
        task.id,
        `"${task.title.replace(/"/g, '""')}"`,
        `"${project?.name.replace(/"/g, '""') || ''}"`,
        `"${assignee?.name.replace(/"/g, '""') || ''}"`,
        task.status,
        task.priority,
        `"${task.location.replace(/"/g, '""')}"`,
        task.createdAt,
        task.deadline,
        task.completedAt || '-',
        duration,
        `"${notes}"`,
        `"${feedbacks}"`
      ];
    });

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `laporan_tugas_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingTaskId, setViewingTaskId] = useState<string | null>(null);
  const viewingTask = tasks.find(t => t.id === viewingTaskId) || null;
  const [newNote, setNewNote] = useState('');
  const [newFeedback, setNewFeedback] = useState('');
  const [newProcess, setNewProcess] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const canModify = (assigneeId: string) => {
    return currentUser?.isAdmin || currentUser?.role === 'Project Manager' || currentUser?.id === assigneeId;
  };

  const canFinishOrStartTask = (assigneeId: string) => {
    return currentUser?.isAdmin || currentUser?.role === 'Project Manager' || currentUser?.id === assigneeId;
  };
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigneeId: '',
    projectId: '',
    status: 'Belum Dimulai' as TaskStatus,
    priority: 'Sedang' as TaskPriority,
    location: '',
    deadline: '',
    checklist: [] as ChecklistItem[],
  });

  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (dashboardTaskToOpen) {
      setViewingTaskId(dashboardTaskToOpen.id);
      setDashboardTaskToOpen(null);
    }
  }, [dashboardTaskToOpen, setDashboardTaskToOpen]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenModal = (task?: Task) => {
    if (task && !canModify(task.assigneeId)) {
      showToast('Akses ditolak: Anda tidak dapat mengedit tugas ini.');
      return;
    }

    if (task) {
      setEditingId(task.id);
      setFormData({
        title: task.title,
        description: task.description,
        assigneeId: task.assigneeId,
        projectId: task.projectId || '',
        status: task.status,
        priority: task.priority,
        location: task.location,
        deadline: task.deadline.split('T')[0], // format for input type="date"
        checklist: task.checklist || [],
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        description: '',
        assigneeId: members.length > 0 ? members[0].id : '',
        projectId: projects.length > 0 ? projects[0].id : '',
        status: 'Belum Dimulai',
        priority: 'Sedang',
        location: '',
        deadline: new Date().toISOString().split('T')[0],
        checklist: [
          {
            id: 'mandatory-finish',
            text: 'Selesai',
            isCompleted: false
          }
        ],
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.assigneeId) return;

    let finalStatus = formData.status;
    if (formData.checklist && formData.checklist.length > 0) {
      const allCompleted = formData.checklist.every(item => item.isCompleted);
      const anyCompleted = formData.checklist.some(item => item.isCompleted);
      if (!allCompleted && finalStatus === 'Selesai') {
        finalStatus = 'Sedang Dikerjakan';
      } else if (allCompleted && finalStatus !== 'Selesai') {
        finalStatus = 'Selesai';
      } else if (anyCompleted && finalStatus === 'Belum Dimulai') {
        finalStatus = 'Sedang Dikerjakan';
      }
    }

    const taskData = { ...formData, status: finalStatus };

    if (editingId) {
      updateTask(editingId, taskData);
      showToast('Tugas berhasil diperbarui');
    } else {
      addTask(taskData);
      showToast('Tugas baru berhasil ditambahkan');
    }
    setIsModalOpen(false);
  };

  const handleDelete = (task: Task) => {
    if (!canModify(task.assigneeId)) {
      showToast('Akses ditolak: Anda tidak dapat menghapus tugas ini.');
      return;
    }
    if (window.confirm(`Yakin ingin menghapus tugas "${task.title}"?`)) {
      deleteTask(task.id);
      showToast('Tugas berhasil dihapus');
    }
  };

  const handleToggleChecklist = (task: Task, checklistId: string) => {
    if (!canFinishOrStartTask(task.assigneeId)) {
      showToast('Akses ditolak: Hanya PIC dan Project Manager yang dapat mengubah status tugas.');
      return;
    }
    if (!task.checklist) return;
    const newChecklist = task.checklist.map(item => 
      item.id === checklistId ? { ...item, isCompleted: !item.isCompleted } : item
    );
    
    let newStatus = task.status;
    const allCompleted = newChecklist.every(item => item.isCompleted);
    const anyCompleted = newChecklist.some(item => item.isCompleted);
    
    if (!allCompleted && newStatus === 'Selesai') {
      newStatus = 'Sedang Dikerjakan';
    } else if (allCompleted && newStatus !== 'Selesai') {
      newStatus = 'Selesai';
    } else if (anyCompleted && newStatus === 'Belum Dimulai') {
      newStatus = 'Sedang Dikerjakan';
    }

    updateTask(task.id, { checklist: newChecklist, status: newStatus });
  };

  const handleAddNote = () => {
    if (!viewingTask || !newNote.trim()) return;
    if (!canFinishOrStartTask(viewingTask.assigneeId)) return;
    useStore.getState().addNoteToTask(viewingTask.id, newNote);
    setNewNote('');
  };

  const handleAddProcessToViewing = () => {
    if (!viewingTask || !newProcess.trim()) return;
    if (!canFinishOrStartTask(viewingTask.assigneeId)) return;
    
    const newItem: ChecklistItem = {
      id: Math.random().toString(36).substr(2, 9),
      text: newProcess.trim(),
      isCompleted: false
    };
    
    const newChecklist = [...(viewingTask.checklist || []), newItem];
    updateTask(viewingTask.id, { checklist: newChecklist });
    setNewProcess('');
  };

  const handleToggleProcessInViewing = (processId: string) => {
    if (!viewingTask) return;
    if (!canFinishOrStartTask(viewingTask.assigneeId)) return;
    
    const newChecklist = (viewingTask.checklist || []).map(item => 
      item.id === processId ? { ...item, isCompleted: !item.isCompleted } : item
    );
    
    let newStatus = viewingTask.status;
    const allCompleted = newChecklist.every(item => item.isCompleted);
    const anyCompleted = newChecklist.some(item => item.isCompleted);
    
    if (!allCompleted && newStatus === 'Selesai') {
      newStatus = 'Sedang Dikerjakan';
    } else if (allCompleted && newStatus !== 'Selesai') {
      newStatus = 'Selesai';
    } else if (anyCompleted && newStatus === 'Belum Dimulai') {
      newStatus = 'Sedang Dikerjakan';
    }

    updateTask(viewingTask.id, { checklist: newChecklist, status: newStatus });
  };

  const handleRemoveProcessFromViewing = (processId: string) => {
    if (!viewingTask) return;
    if (!canFinishOrStartTask(viewingTask.assigneeId)) return;
    
    // Prevent removing mandatory task
    const itemToRemove = (viewingTask.checklist || []).find(item => item.id === processId);
    if (itemToRemove?.text === 'Selesai' || processId === 'mandatory-finish') {
      showToast('Akses ditolak: Daftar ceklis "Selesai" bersifat wajib.');
      return;
    }
    
    const newChecklist = (viewingTask.checklist || []).filter(item => item.id !== processId);
    updateTask(viewingTask.id, { checklist: newChecklist });
  };

  const handleAddFeedback = () => {
    if (!viewingTask || !currentUser || !newFeedback.trim()) return;
    useStore.getState().addFeedbackToTask(viewingTask.id, currentUser.id, newFeedback);
    setNewFeedback('');
  };

  const addChecklistItem = () => {
    const newItem: ChecklistItem = {
      id: Math.random().toString(36).substr(2, 9),
      text: '',
      isCompleted: false
    };
    setFormData({ ...formData, checklist: [...(formData.checklist || []), newItem] });
  };

  const updateChecklistItem = (id: string, text: string) => {
    if (!formData.checklist) return;
    setFormData({
      ...formData,
      checklist: formData.checklist.map(item => {
        if (item.id === id) {
          // If it's the mandatory one, don't allow changing text to something else if it's already 'Selesai'
          if (id === 'mandatory-finish' || item.text === 'Selesai') return item;
          return { ...item, text };
        }
        return item;
      })
    });
  };

  const removeChecklistItem = (id: string) => {
    if (!formData.checklist) return;
    
    // Prevent removing mandatory task
    const itemToRemove = formData.checklist.find(item => item.id === id);
    if (itemToRemove?.text === 'Selesai' || id === 'mandatory-finish') {
      showToast('Akses ditolak: Daftar ceklis "Selesai" bersifat wajib.');
      return;
    }

    setFormData({
      ...formData,
      checklist: formData.checklist.filter(item => item.id !== id)
    });
  };

  const getStatusColor = (status: TaskStatus) => {
    switch(status) {
      case 'Selesai': return 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm shadow-emerald-50';
      case 'Sedang Dikerjakan': return 'bg-indigo-50 text-indigo-600 border-indigo-100 shadow-sm shadow-indigo-50';
      case 'Ditunda': return 'bg-amber-50 text-amber-600 border-amber-100 shadow-sm shadow-amber-50';
      case 'Dibatalkan': return 'bg-red-50 text-red-600 border-red-100 shadow-sm shadow-red-50';
      case 'Belum Dimulai': default: return 'bg-slate-50 text-slate-500 border-slate-200 shadow-sm shadow-slate-50';
    }
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    switch(priority) {
      case 'Urgent': return 'text-red-600 font-black';
      case 'Tinggi': return 'text-amber-600 font-black';
      case 'Sedang': return 'text-indigo-600 font-black';
      case 'Rendah': return 'text-slate-400 font-black';
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          task.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = taskStatusFilter === 'Semua' || task.status === taskStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [tasks, searchQuery, taskStatusFilter]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative pb-10">
      
      {toast && (
        <div className="fixed bottom-6 right-6 bg-white border border-emerald-100 p-4 flex items-center gap-3 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-right-4 z-50">
          <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
            <CheckCircle2 size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Data Berhasil Disimpan</p>
            <p className="text-[10px] text-slate-500">{toast}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Manajemen Tugas</h2>
          <p className="text-slate-500 text-sm mt-1">Organisasi dan delegasi pekerjaan secara efisien.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={exportToCSV}
            className="group bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all shadow-sm shrink-0 active:scale-95"
            title="Download Spreadsheet"
          >
            <Download size={18} className="text-indigo-600 transition-transform group-hover:-translate-y-0.5" />
            <span className="hidden sm:inline">Export Laporan</span>
          </button>
          {(currentUser?.isAdmin || currentUser?.role === 'Project Manager') && (
            <button 
              onClick={() => handleOpenModal()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-full text-sm font-black flex items-center gap-2 transition-all shadow-xl shadow-indigo-100 shrink-0 transform active:scale-95"
            >
              <Plus size={18} />
              <span>Tambah Tugas</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-indigo-600" />
          <input 
            type="text" 
            placeholder="Cari tugas..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-full focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 focus:outline-none transition-all text-sm text-slate-900 placeholder-slate-400 shadow-sm"
          />
        </div>
        <div className="relative min-w-[200px]">
          <select 
            value={taskStatusFilter}
            onChange={(e) => setTaskStatusFilter(e.target.value)}
            className="w-full appearance-none pl-4 pr-10 py-2 bg-white border border-slate-200 rounded-full focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 focus:outline-none transition-all text-sm font-medium text-slate-900 cursor-pointer shadow-sm"
          >
            <option value="Semua">Semua Status</option>
            <option value="Belum Dimulai">Belum Dimulai</option>
            <option value="Sedang Dikerjakan">Sedang Dikerjakan</option>
            <option value="Selesai">Selesai</option>
            <option value="Ditunda">Ditunda</option>
            <option value="Dibatalkan">Dibatalkan</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTasks.map(task => {
          const assignee = members.find(m => m.id === task.assigneeId);
          
          return (
            <div key={task.id} onClick={() => setViewingTaskId(task.id)} className="bg-white border border-slate-200 rounded-4xl p-7 hover:shadow-2xl hover:border-indigo-100 transition-all flex flex-col h-full group cursor-pointer shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-start mb-5">
                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.15em] border shadow-sm ${getStatusColor(task.status)}`}>
                  {task.status}
                </span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                  {canModify(task.assigneeId) && (
                    <>
                      <button onClick={(e) => { e.stopPropagation(); handleOpenModal(task); }} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors shadow-sm" title="Edit Tugas">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(task); }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors shadow-sm" title="Hapus Tugas">
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <h3 className="text-xl font-black text-slate-900 mb-2 leading-tight group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{task.title}</h3>
              {task.projectId && projects.find(p => p.id === task.projectId) && (
                <div className="mb-4 text-[10px] text-indigo-600 uppercase tracking-[0.2em] font-black bg-indigo-50 inline-block px-3 py-1 rounded-lg border border-indigo-100 shadow-sm">
                  {projects.find(p => p.id === task.projectId)?.name}
                </div>
              )}
              <p className="text-sm font-medium text-slate-500 mb-6 line-clamp-2 flex-grow leading-relaxed">{task.description}</p>

              {/* Quick Actions */}
              {(task.status !== 'Selesai' && task.status !== 'Dibatalkan') && canFinishOrStartTask(task.assigneeId) && (
                <div className="mb-6 flex gap-2">
                  {task.status !== 'Sedang Dikerjakan' && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        updateTask(task.id, { status: 'Sedang Dikerjakan' });
                        showToast(`Tugas "${task.title}" mulai dikerjakan`);
                      }}
                      className="flex-1 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-indigo-100 cursor-pointer active:scale-95 text-center"
                    >
                      Kerjakan
                    </button>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 mb-6">
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Dibuat</p>
                  <p className="text-[10px] font-bold text-slate-700">{format(new Date(task.createdAt), 'dd MMM yy')}</p>
                </div>
                <div className="bg-indigo-50 p-2 rounded-xl border border-indigo-100">
                  <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">Target</p>
                  <p className="text-[10px] font-bold text-indigo-700">{format(new Date(task.deadline), 'dd MMM yy')}</p>
                </div>
                {task.completedAt && (
                  <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                    <p className="text-[8px] font-black text-emerald-400 uppercase tracking-widest mb-0.5">Realisasi</p>
                    <p className="text-[10px] font-bold text-emerald-700">{format(new Date(task.completedAt), 'dd MMM yy')}</p>
                  </div>
                )}
                <div className="bg-amber-50 p-2 rounded-xl border border-amber-100">
                  <p className="text-[8px] font-black text-amber-400 uppercase tracking-widest mb-0.5">Durasi</p>
                  <p className="text-[10px] font-bold text-amber-700">
                    {differenceInDays(task.completedAt ? new Date(task.completedAt) : new Date(), new Date(task.createdAt)) + 1} Hari
                  </p>
                </div>
              </div>

              {task.checklist && task.checklist.length > 0 && (
                <div className="mb-6 space-y-2.5 p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                  {task.checklist.slice(0, 3).map(item => (
                    <div key={item.id} className="flex items-start gap-3 group/check">
                      <div className="mt-0.5 shrink-0">
                        {item.isCompleted ? <CheckSquare size={16} className="text-indigo-600" /> : <Square size={16} className="text-slate-300 transition-colors group-hover/check:text-indigo-400" />}
                      </div>
                      <span className={`text-[11px] font-bold uppercase tracking-tight ${item.isCompleted ? 'text-slate-400 line-through' : 'text-slate-600'}`}>
                        {item.text}
                      </span>
                    </div>
                  ))}
                  {task.checklist.length > 3 && (
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-7">+{task.checklist.length - 3} lainnya...</p>
                  )}
                </div>
              )}

              <div className="space-y-4 mt-auto pt-6 border-t border-slate-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                    <MapPin size={14} className="text-indigo-400" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{task.location || 'N/A'}</span>
                  </div>
                  <span className={`text-[10px] uppercase tracking-[0.2em] px-2 py-1 bg-slate-50 rounded-lg border border-slate-200 ${getPriorityBadge(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
                
                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center gap-3">
                    {assignee ? (
                      <>
                        <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm overflow-hidden bg-slate-100">
                          <img src={assignee.avatar} alt={assignee.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xs font-black text-slate-700 uppercase tracking-tighter truncate max-w-[100px]">{assignee.name.split(' ')[0]}</span>
                      </>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic bg-slate-50 px-3 py-1 rounded-full border border-slate-200">Unassigned</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 shadow-inner">
                    <Calendar size={13} className="text-indigo-400" />
                    {task.deadline ? format(new Date(task.deadline), 'dd MMM', { locale: idLocale }) : '-'}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredTasks.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
            <CheckCircle2 size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-900">Tidak ada tugas ditemukan</h3>
            <p className="text-sm text-slate-500 mt-1">Coba ubah filter atau tambah tugas baru.</p>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col border border-slate-200">
            <div className="p-6 border-b border-slate-100 shrink-0">
              <h3 className="text-xl font-bold text-slate-900">
                {editingId ? 'Edit Tugas' : 'Tambah Tugas Baru'}
              </h3>
            </div>
            
            <div className="overflow-y-auto p-6">
              <form id="task-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Nama Tugas</label>
                  <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all placeholder-slate-400 text-slate-900" />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Deskripsi</label>
                  <textarea required rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all resize-none placeholder-slate-400 text-slate-900" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Assign Ke</label>
                    <select required value={formData.assigneeId} onChange={e => setFormData({...formData, assigneeId: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all appearance-none cursor-pointer text-slate-900">
                      <option value="" disabled>Pilih anggota...</option>
                      {members.filter(m => m.role !== 'Project Manager').map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Proyek</label>
                    <select required value={formData.projectId} onChange={e => setFormData({...formData, projectId: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all appearance-none cursor-pointer text-slate-900">
                      <option value="" disabled>Pilih proyek...</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Deadline</label>
                    <input required type="date" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all text-slate-900" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Prioritas</label>
                    <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value as TaskPriority})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all appearance-none cursor-pointer text-slate-900">
                      <option value="Rendah">Rendah</option>
                      <option value="Sedang">Sedang</option>
                      <option value="Tinggi">Tinggi</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Status</label>
                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as TaskStatus})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all appearance-none cursor-pointer text-slate-900">
                      <option value="Belum Dimulai">Belum Dimulai</option>
                      <option value="Sedang Dikerjakan">Sedang Dikerjakan</option>
                      <option value="Selesai">Selesai</option>
                      <option value="Ditunda">Ditunda</option>
                      <option value="Dibatalkan">Dibatalkan</option>
                    </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Lokasi / Posisi</label>
                  <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all placeholder-slate-400 text-slate-900" placeholder="Contoh: Gedung A Lt. 3" />
                </div>

                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Daftar Ceklis (Proses)</label>
                    <button type="button" onClick={addChecklistItem} className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-bold">
                      <Plus size={14} /> Tambah Proses
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.checklist?.map((item, index) => (
                      <div key={item.id} className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={item.isCompleted} 
                          onChange={(e) => {
                            if (!formData.checklist) return;
                            const newChecklist = [...formData.checklist];
                            newChecklist[index].isCompleted = e.target.checked;
                            setFormData({ ...formData, checklist: newChecklist });
                          }}
                          className="w-4 h-4 rounded border-slate-200 bg-slate-50 text-indigo-600 focus:ring-indigo-600"
                        />
                        <input 
                          type="text" 
                          value={item.text} 
                          onChange={(e) => updateChecklistItem(item.id, e.target.value)} 
                          placeholder="Tugas..." 
                          disabled={item.id === 'mandatory-finish' || item.text === 'Selesai'}
                          className={`flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 outline-none text-sm transition-all placeholder-slate-400 text-slate-900 ${item.id === 'mandatory-finish' || item.text === 'Selesai' ? 'font-black text-indigo-600' : ''}`}
                        />
                        {(item.id !== 'mandatory-finish' && item.text !== 'Selesai') && (
                          <button type="button" onClick={() => removeChecklistItem(item.id)} className="text-slate-400 hover:text-red-500 p-1.5 flex-shrink-0">
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-slate-100 shrink-0 mt-auto flex gap-3 bg-slate-50">
               <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors">
                Batal
              </button>
              <button form="task-form" type="submit" className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                Simpan Tugas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal for Feedback & Notes */}
      {viewingTask && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-slate-900">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="p-8 border-b border-slate-100 shrink-0 flex justify-between items-start bg-slate-50/50">
              <div className="flex-1">
                <h3 className="text-2xl font-black text-slate-900 pr-6 leading-tight uppercase tracking-tight">{viewingTask.title}</h3>
                <p className="text-sm text-slate-500 mt-2 font-medium leading-relaxed">{viewingTask.description}</p>
                
                {/* PIC Info */}
                <div className="mt-6 flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm inline-flex">
                  <div className="w-10 h-10 rounded-full border-2 border-indigo-50 overflow-hidden shadow-inner">
                    <img 
                      src={members.find(m => m.id === viewingTask.assigneeId)?.avatar} 
                      alt="PIC" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Penanggung Jawab (PIC)</p>
                    <p className="text-sm font-black text-slate-900 leading-none">
                      {members.find(m => m.id === viewingTask.assigneeId)?.name}
                    </p>
                    <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-tighter mt-1">
                      {members.find(m => m.id === viewingTask.assigneeId)?.role}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-6 text-[9px] font-black uppercase tracking-[0.15em]">
                  <span className={`px-2 py-1 rounded border ${getStatusColor(viewingTask.status)}`}>
                    {viewingTask.status}
                  </span>
                  <span className={`px-2 py-1 rounded bg-white border border-slate-200 ${getPriorityBadge(viewingTask.priority)}`}>
                    {viewingTask.priority}
                  </span>
                  <span className="px-2 py-1 rounded bg-white border border-slate-200 text-slate-500 flex items-center gap-1">
                    <MapPin size={10} /> {viewingTask.location || 'No Location'}
                  </span>
                </div>
              </div>
              <button type="button" onClick={() => setViewingTaskId(null)} className="text-slate-400 hover:text-slate-900 transition-all bg-white p-2 rounded-full border border-slate-200 shadow-sm">
                <X size={20} />
              </button>
            </div>
            
            <div className="overflow-y-auto p-8 space-y-10 flex-1">
              
              {/* Monitoring Dates Section */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
                  <Calendar size={16} className="text-slate-400 mb-2" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Dibuat</p>
                  <p className="text-sm font-bold text-slate-700">{format(new Date(viewingTask.createdAt), 'dd MMMM yyyy', { locale: idLocale })}</p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 shadow-sm flex flex-col items-center text-center">
                  <Calendar size={16} className="text-indigo-400 mb-2" />
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Target Selesai</p>
                  <p className="text-sm font-bold text-indigo-700">{format(new Date(viewingTask.deadline), 'dd MMMM yyyy', { locale: idLocale })}</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 shadow-sm flex flex-col items-center text-center">
                  <CheckCircle2 size={16} className="text-emerald-400 mb-2" />
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Realisasi Selesai</p>
                  <p className="text-sm font-bold text-emerald-700">{viewingTask.completedAt ? format(new Date(viewingTask.completedAt), 'dd MMMM yyyy', { locale: idLocale }) : '-'}</p>
                </div>
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 shadow-sm flex flex-col items-center text-center">
                  <Clock size={16} className="text-amber-400 mb-2" />
                  <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">Durasi Kerja</p>
                  <p className="text-sm font-bold text-amber-700">
                    {differenceInDays(viewingTask.completedAt ? new Date(viewingTask.completedAt) : new Date(), new Date(viewingTask.createdAt)) + 1} Hari
                  </p>
                </div>
              </div>
              
              {/* Process Checklist Section */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-600"></div> Daftar Proses
                </h4>
                
                <div className="grid grid-cols-1 gap-2">
                  {viewingTask.checklist?.map(item => (
                    <div key={item.id} className="flex items-center gap-3 bg-slate-50 border border-slate-100 p-4 rounded-2xl group/item shadow-sm">
                      <button 
                        onClick={() => handleToggleProcessInViewing(item.id)}
                        disabled={!canModify(viewingTask.assigneeId)}
                        className={`transition-all shrink-0 ${item.isCompleted ? 'text-indigo-600' : 'text-slate-300'}`}
                      >
                        {item.isCompleted ? <CheckSquare size={20} /> : <Square size={20} />}
                      </button>
                      <span className={`text-sm font-semibold flex-1 ${item.isCompleted ? 'text-slate-400 line-through' : 'text-slate-700'} ${item.id === 'mandatory-finish' || item.text === 'Selesai' ? 'font-black text-indigo-600' : ''}`}>
                        {item.text}
                        {(item.id === 'mandatory-finish' || item.text === 'Selesai') && <span className="ml-2 text-[8px] bg-indigo-600 text-white px-1.5 py-0.5 rounded uppercase font-black">Wajib</span>}
                      </span>
                      {canModify(viewingTask.assigneeId) && (item.id !== 'mandatory-finish' && item.text !== 'Selesai') && (
                        <button 
                          onClick={() => handleRemoveProcessFromViewing(item.id)}
                          className="opacity-0 group-hover/item:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-all"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  {(!viewingTask.checklist || viewingTask.checklist.length === 0) && (
                    <p className="text-xs text-slate-400 italic py-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-center">Belum ada daftar proses.</p>
                  )}
                </div>

                {canFinishOrStartTask(viewingTask.assigneeId) && (
                  <div className="flex gap-2 bg-indigo-50/50 p-2 rounded-2xl border border-indigo-100">
                    <input 
                      type="text" 
                      value={newProcess}
                      onChange={e => setNewProcess(e.target.value)}
                      placeholder="Tambah proses baru..."
                      className="flex-1 px-4 py-2 bg-white border border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all placeholder-slate-400 text-sm text-slate-700"
                      onKeyDown={e => { if (e.key === 'Enter') handleAddProcessToViewing() }}
                    />
                    <button onClick={handleAddProcessToViewing} className="px-5 py-2 bg-indigo-600 text-white hover:bg-indigo-700 font-bold rounded-xl transition-all text-xs whitespace-nowrap shadow-md shadow-indigo-100">
                      Tambah
                    </button>
                  </div>
                )}
              </div>

              {/* Keterangan / Kendala Section (Notes) */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div> Keterangan / Kendala
                </h4>
                
                <div className="space-y-3">
                  {viewingTask.notes?.map(note => (
                    <div key={note.id} className="bg-red-50 border border-red-100 p-4 rounded-2xl relative overflow-hidden shadow-sm">
                      <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                      <p className="text-sm font-medium text-slate-700 leading-relaxed">{note.text}</p>
                      <span className="text-[10px] font-bold text-slate-400 mt-2 block uppercase tracking-widest">
                        {format(new Date(note.createdAt), 'dd MMM yyyy, HH:mm', { locale: idLocale })}
                      </span>
                    </div>
                  ))}
                  {(!viewingTask.notes || viewingTask.notes.length === 0) && (
                    <p className="text-xs text-slate-400 italic py-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-center">Tidak ada laporan kendala.</p>
                  )}
                </div>

                {canFinishOrStartTask(viewingTask.assigneeId) && (
                  <div className="flex gap-2 bg-red-50/50 p-2 rounded-2xl border border-red-100">
                    <input 
                      type="text" 
                      value={newNote}
                      onChange={e => setNewNote(e.target.value)}
                      placeholder="Tambah keterangan atau kendala..."
                      className="flex-1 px-4 py-2 bg-white border border-red-100 rounded-xl focus:ring-2 focus:ring-red-600/20 focus:border-red-600 outline-none transition-all placeholder-slate-400 text-sm text-slate-700"
                      onKeyDown={e => { if (e.key === 'Enter') handleAddNote() }}
                    />
                    <button onClick={handleAddNote} className="px-5 py-2 bg-red-600 text-white hover:bg-red-700 font-bold rounded-xl transition-all text-xs whitespace-nowrap shadow-md shadow-red-100">
                      Tambah
                    </button>
                  </div>
                )}
              </div>

              {/* Feedback Section */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div> Feedback Tim
                </h4>
                
                <div className="space-y-4">
                  {viewingTask.feedbacks?.map(fb => {
                    const fbUser = members.find(m => m.id === fb.userId);
                    return (
                      <div key={fb.id} className="flex gap-4">
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0">
                          <img src={fbUser?.avatar} alt={fbUser?.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="bg-slate-100 border border-slate-200 p-4 rounded-2xl rounded-tl-none flex-1 shadow-sm">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-black text-slate-900">{fbUser?.name}</span>
                            <span className="text-[10px] font-bold text-slate-400">
                              {format(new Date(fb.createdAt), 'dd MMM yyyy, HH:mm', { locale: idLocale })}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-slate-600 leading-relaxed">{fb.text}</p>
                        </div>
                      </div>
                    );
                  })}
                  {(!viewingTask.feedbacks || viewingTask.feedbacks.length === 0) && (
                    <p className="text-xs text-slate-400 italic py-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-center">Belum ada umpan balik.</p>
                  )}
                </div>

                <div className="flex gap-2 mt-2 bg-amber-50/50 p-2 rounded-2xl border border-amber-100">
                  <input 
                    type="text" 
                    value={newFeedback}
                    onChange={e => setNewFeedback(e.target.value)}
                    placeholder="Tulis umpan balik..."
                    className="flex-1 px-4 py-2 bg-white border border-amber-100 rounded-xl focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600 outline-none transition-all placeholder-slate-400 text-sm text-slate-700"
                    onKeyDown={e => { if (e.key === 'Enter') handleAddFeedback() }}
                  />
                  <button onClick={handleAddFeedback} className="px-6 py-2 bg-amber-600 text-white hover:bg-amber-700 font-bold rounded-xl transition-all text-xs whitespace-nowrap shadow-md shadow-amber-100">
                    Kirim
                  </button>
                </div>
              </div>

            </div>
            
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
              {viewingTask.status !== 'Dibatalkan' && canFinishOrStartTask(viewingTask.assigneeId) && (
                <button 
                  type="button" 
                  onClick={() => {
                    if (window.confirm(`Yakin ingin membatalkan tugas "${viewingTask.title}"?`)) {
                      updateTask(viewingTask.id, { status: 'Dibatalkan' });
                      setViewingTaskId(null);
                      showToast(`Tugas "${viewingTask.title}" telah dibatalkan`);
                    }
                  }} 
                  className="flex-1 px-4 py-2.5 bg-red-50 text-red-600 border border-red-100 font-bold rounded-xl hover:bg-red-100 transition-colors text-sm cursor-pointer active:scale-95"
                >
                  Batalkan Tugas
                </button>
              )}
               <button type="button" onClick={() => setViewingTaskId(null)} className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-500 font-bold rounded-xl hover:bg-white transition-all text-sm shadow-sm">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
