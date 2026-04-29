import { useState, FormEvent } from 'react';
import { useStore, Project } from '../store';
import { Plus, Edit2, Trash2, Folder, X, Calendar, User, Clock, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

export function ProjectManagement() {
  const { currentUser, projects, tasks, members, addProject, updateProject, deleteProject, setDashboardTaskToOpen } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenModal = (project?: Project) => {
    const canManage = currentUser?.isAdmin || currentUser?.role === 'Project Manager';
    if (!canManage) {
      showToast('Akses ditolak: Hanya Admin atau Project Manager yang dapat mengelola proyek.');
      return;
    }

    if (project) {
      setEditingId(project.id);
      setFormData({
        name: project.name,
        description: project.description
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const canManage = currentUser?.isAdmin || currentUser?.role === 'Project Manager';
    if (!canManage) return;

    if (editingId) {
      updateProject(editingId, formData);
      showToast('Proyek berhasil diperbarui');
    } else {
      addProject(formData);
      showToast('Proyek berhasil ditambahkan');
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    const canManage = currentUser?.isAdmin || currentUser?.role === 'Project Manager';
    if (!canManage) {
      showToast('Akses ditolak: Hanya Admin atau Project Manager yang dapat menghapus proyek.');
      return;
    }
    if (window.confirm(`Yakin ingin menghapus ${name}? Tugas yang terkait mungkin akan kehilangan referensi proyek.`)) {
      deleteProject(id);
      showToast('Proyek berhasil dihapus');
    }
  };

  const getProjectStats = (projectId: string) => {
    const projectTasks = tasks.filter(t => t.projectId === projectId);
    let totalProgress = 0;
    
    projectTasks.forEach(task => {
      if (task.status === 'Selesai') {
        totalProgress += 100;
      } else if (task.status === 'Sedang Dikerjakan') {
        if (task.checklist && task.checklist.length > 0) {
          const completedItems = task.checklist.filter(item => item.isCompleted).length;
          totalProgress += (completedItems / task.checklist.length) * 100;
        } else {
          totalProgress += 50;
        }
      }
    });

    return {
      total: projectTasks.length,
      averageProgress: projectTasks.length > 0 ? Math.round(totalProgress / projectTasks.length) : 0
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Manajemen Proyek</h2>
          <p className="text-slate-500 text-sm mt-1">Kelola dan pantau seluruh proyek aktif.</p>
        </div>
        {(currentUser?.isAdmin || currentUser?.role === 'Project Manager') && (
          <button 
            onClick={() => handleOpenModal()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-100"
          >
            <Plus size={18} />
            <span>Tambah Proyek</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => {
          const stats = getProjectStats(project.id);
          
          return (
            <div 
              key={project.id} 
              onClick={() => setViewingProject(project)}
              className="bg-white rounded-3xl p-7 border border-slate-200 hover:shadow-xl hover:border-indigo-100 transition-all flex flex-col h-full group cursor-pointer shadow-sm relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                  <Folder size={28} />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                  {currentUser?.isAdmin && (
                    <>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleOpenModal(project); }} 
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors shadow-sm"
                        title="Edit Proyek"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(project.id, project.name); }} 
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors shadow-sm"
                        title="Hapus Proyek"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex-1 mb-6">
                <h3 className="text-xl font-black text-slate-900 mb-2 truncate group-hover:text-indigo-600 transition-colors">{project.name}</h3>
                <p className="text-sm text-slate-500 line-clamp-2 font-medium">{project.description}</p>
                <div className="text-[10px] font-black text-slate-400 mt-4 uppercase tracking-[0.2em] bg-slate-50 inline-block px-2 py-1 rounded-md">
                  Sejak {format(new Date(project.createdAt), 'dd MMM yyyy', { locale: idLocale })}
                </div>
              </div>
              
              <div className="mt-auto pt-6 border-t border-slate-100">
                <div className="flex justify-between items-center mb-3">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress Keseluruhan</div>
                  <div className="text-sm font-black text-indigo-600">{stats.averageProgress}%</div>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner p-0.5">
                  <div 
                    className="h-full bg-indigo-600 rounded-full transition-all duration-1000 ease-out shadow-lg shadow-indigo-100"
                    style={{ width: `${stats.averageProgress}%` }}
                  />
                </div>
                <div className="mt-4 text-[10px] font-black text-slate-400 flex items-center gap-2 uppercase tracking-[0.1em]">
                  <span className="w-5 h-5 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-black">{stats.total}</span>
                  Total Tugas
                </div>
              </div>
            </div>
          );
        })}

        {projects.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-500 bg-white/5 rounded-3xl border border-white/10 border-dashed">
            <Folder size={48} className="mb-4 opacity-50" />
            <p>Belum ada proyek ditambahkan.</p>
          </div>
        )}
      </div>

      {/* Project Tasks Modal */}
      {viewingProject && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-4xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh] border border-slate-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-start shrink-0 bg-slate-50/50">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-100">
                    <Folder size={20} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">{viewingProject.name}</h3>
                </div>
                <p className="text-sm font-medium text-slate-500">{viewingProject.description}</p>
              </div>
              <button 
                onClick={() => setViewingProject(null)} 
                className="text-slate-400 hover:text-slate-900 transition-all bg-white p-2 rounded-2xl border border-slate-200 shadow-sm hover:rotate-90"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="overflow-y-auto p-8 space-y-6 custom-scrollbar">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-4">Daftar Tugas ({tasks.filter(t => t.projectId === viewingProject.id).length})</h4>
              
              <div className="space-y-4">
                {tasks.filter(t => t.projectId === viewingProject.id).length > 0 ? (
                  tasks.filter(t => t.projectId === viewingProject.id).map(task => {
                    const assignee = members.find(m => m.id === task.assigneeId);
                    
                    const getStatusColor = (status: string) => {
                      switch(status) {
                        case 'Selesai': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
                        case 'Sedang Dikerjakan': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
                        case 'Ditunda': return 'bg-amber-50 text-amber-600 border-amber-100';
                        default: return 'bg-slate-50 text-slate-500 border-slate-200';
                      }
                    };

                    return (
                      <div 
                        key={task.id} 
                        onClick={() => {
                          setDashboardTaskToOpen(task);
                          setViewingProject(null);
                        }}
                        className="bg-white border border-slate-200 p-5 rounded-3xl hover:border-indigo-600 hover:shadow-xl transition-all cursor-pointer group/task relative"
                      >
                        <div className="flex justify-between items-start gap-4 mb-4">
                          <h5 className="font-bold text-slate-900 group-hover/task:text-indigo-600 transition-colors leading-tight">{task.title}</h5>
                          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border whitespace-nowrap shadow-sm ${getStatusColor(task.status)}`}>
                            {task.status}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-6">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full border border-slate-100 overflow-hidden shrink-0 shadow-sm">
                              <img src={assignee?.avatar} alt={assignee?.name} className="w-full h-full object-cover" />
                            </div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{assignee?.name}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-slate-400">
                            <Calendar size={14} className="shrink-0 text-slate-300" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{task.deadline}</span>
                          </div>
                        </div>

                        {task.checklist && task.checklist.length > 0 && (
                          <div className="mt-5 pt-4 border-t border-slate-50">
                            <div className="flex justify-between text-[10px] mb-2 font-black uppercase tracking-widest text-slate-400">
                              <span>Progress</span>
                              <span className="text-indigo-600">{Math.round((task.checklist.filter(i => i.isCompleted).length / task.checklist.length) * 100)}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                              <div 
                                className="h-full bg-indigo-600 transition-all duration-1000 shadow-lg shadow-indigo-100"
                                style={{ width: `${(task.checklist.filter(i => i.isCompleted).length / task.checklist.length) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    <p className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Belum ada tugas</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-8 border-t border-slate-100 bg-slate-50/50 shrink-0 flex justify-end">
              <button 
                onClick={() => setViewingProject(null)}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl transition-all text-sm shadow-xl shadow-indigo-100 transform active:scale-95"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-4xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-900">{editingId ? 'Edit Proyek' : 'Tambah Proyek'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900 transition-all hover:rotate-90">
                <X size={20} />
              </button>
            </div>
            
            <form id="project-form" onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Nama Proyek</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all placeholder-slate-400"
                  placeholder="Nama proyek Anda"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Deskripsi Singkat</label>
                <textarea 
                  required
                  rows={4}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all min-h-[120px] placeholder-slate-400 resize-none"
                  placeholder="Apa tujuan proyek ini?"
                />
              </div>
            </form>
            
            <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex gap-4">
              <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3.5 bg-white border border-slate-200 text-slate-500 font-black rounded-2xl hover:bg-slate-50 transition-all text-sm uppercase tracking-widest">
                Batal
              </button>
              <button form="project-form" type="submit" className="flex-1 px-4 py-3.5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 text-sm uppercase tracking-widest transform active:scale-95">
                Simpan Proyek
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-8 right-8 bg-white border border-emerald-100 p-4 flex items-center gap-4 rounded-3xl shadow-2xl animate-in fade-in slide-in-from-right-8 z-50">
          <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-100">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-sm font-black text-slate-900">Berhasil!</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{toast}</p>
          </div>
        </div>
      )}
    </div>
  );
}
