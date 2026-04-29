import { useState, FormEvent } from 'react';
import { useStore, TeamMember, Task, TaskStatus } from '../store';
import { Plus, Edit2, Trash2, UserPlus, CheckCircle2, Users, X, MapPin, Calendar, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

export function TeamManagement() {
  const { currentUser, members, addMember, updateMember, deleteMember, tasks, setDashboardTaskToOpen, projects } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingTasks, setViewingTasks] = useState<{ member: TeamMember, status: TaskStatus | 'Semua' } | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    department: '',
    avatar: '',
    isOnline: true,
    isAdmin: false
  });

  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenModal = (member?: TeamMember) => {
    // Project Manager or Admin can manage team
    const canManage = currentUser?.isAdmin || currentUser?.role === 'Project Manager';
    if (!canManage) {
      showToast('Akses ditolak: Hanya Admin atau Project Manager yang dapat mengelola anggota.');
      return;
    }

    if (member) {
      setEditingId(member.id);
      setFormData({
        name: member.name,
        role: member.role,
        department: member.department,
        avatar: member.avatar,
        isOnline: member.isOnline,
        isAdmin: member.isAdmin || false
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', role: '', department: '', avatar: '', isOnline: true, isAdmin: false });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.role) return;

    const finalAvatar = formData.avatar || `https://i.pravatar.cc/150?u=${Math.random()}`;

    if (editingId) {
      updateMember(editingId, { ...formData, avatar: finalAvatar });
      showToast('Anggota tim berhasil diperbarui');
    } else {
      addMember({ ...formData, avatar: finalAvatar });
      showToast('Anggota tim berhasil ditambahkan');
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    const canManage = currentUser?.isAdmin || currentUser?.role === 'Project Manager';
    if (!canManage) {
      showToast('Akses ditolak: Hanya Admin atau Project Manager yang dapat menghapus anggota.');
      return;
    }
    if (window.confirm(`Yakin ingin menghapus ${name} dari tim?`)) {
      deleteMember(id);
      showToast('Anggota tim berhasil dihapus');
    }
  };

  const getMemberStats = (memberId: string) => {
    const memberTasks = tasks.filter(t => t.assigneeId === memberId);

    return {
      selesai: memberTasks.filter(t => t.status === 'Selesai').length,
      proses: memberTasks.filter(t => t.status === 'Sedang Dikerjakan').length,
      belumMulai: memberTasks.filter(t => t.status === 'Belum Dimulai').length,
      ditunda: memberTasks.filter(t => t.status === 'Ditunda').length,
      total: memberTasks.length
    };
  };

  const handleStatClick = (member: TeamMember, status: TaskStatus | 'Semua') => {
    setViewingTasks({ member, status });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative pb-10">
      
      {toast && (
        <div className="fixed bottom-6 right-6 bg-white border border-emerald-100 p-4 flex items-center gap-3 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-right-4 z-50">
          <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
            <CheckCircle2 size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Notifikasi</p>
            <p className="text-[10px] text-slate-500">{toast}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Manajemen Tim</h2>
          <p className="text-slate-500 text-sm mt-1">Kelola data dan hak akses anggota tim.</p>
        </div>
        {(currentUser?.isAdmin || currentUser?.role === 'Project Manager') && (
          <button 
            onClick={() => handleOpenModal()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-100"
          >
            <UserPlus size={18} />
            <span>Tambah Anggota</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map(member => {
          const mStats = getMemberStats(member.id);
          const isPM = member.role === 'Project Manager';
          
          return (
            <div key={member.id} className="bg-white border border-slate-200 rounded-3xl p-6 hover:shadow-xl hover:border-indigo-100 transition-all group shadow-sm flex flex-col h-full">
              <div className="flex justify-between items-start mb-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-2 border-indigo-50 p-1 shadow-sm">
                    <img src={member.avatar} alt={member.name} className="w-full h-full rounded-full object-cover" />
                  </div>
                  <div className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-4 border-white ${member.isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`} title={member.isOnline ? "Online" : "Offline"}></div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                  {(currentUser?.isAdmin || currentUser?.role === 'Project Manager') && (
                    <>
                      <button onClick={() => handleOpenModal(member)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors shadow-sm">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(member.id, member.name)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors shadow-sm">
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="overflow-hidden flex-1">
                  <h3 className="text-lg font-black text-slate-900 truncate flex items-center gap-1.5 flex-wrap">
                    {member.name} 
                    {member.isAdmin && <span className="text-[8px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-black tracking-widest uppercase shadow-sm">Admin</span>}
                    {isPM && <span className="text-[8px] bg-amber-500 text-white px-2 py-0.5 rounded-full font-black tracking-widest uppercase shadow-sm">PM</span>}
                  </h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{member.role}</p>
                </div>
                {!isPM && mStats.total > 0 && (
                  <div 
                    onClick={() => handleStatClick(member, 'Semua')}
                    className="text-right shrink-0 bg-indigo-50/50 px-4 py-2 rounded-2xl border border-indigo-100 cursor-pointer hover:bg-indigo-100 transition-colors"
                  >
                    <div className="text-xl font-black text-indigo-600 leading-none">{Math.round((mStats.selesai / mStats.total) * 100)}%</div>
                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-[0.25em] mt-1.5">Selesai</div>
                   </div>
                )}
              </div>
              
              <div className="pt-6 border-t border-slate-100 space-y-6 mt-auto">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Departemen</p>
                  <p className="text-sm font-bold text-slate-700 bg-slate-50 inline-block px-3 py-1 rounded-lg border border-slate-100">{member.department || 'N/A'}</p>
                </div>

                {!isPM && (
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Statistik Kerja</p>
                    <div className="grid grid-cols-4 gap-2">
                      <div 
                        onClick={() => handleStatClick(member, 'Selesai')}
                        className="text-center bg-emerald-50 border border-emerald-100 rounded-xl p-2.5 shadow-sm cursor-pointer hover:bg-emerald-100 transition-all active:scale-95"
                      >
                        <div className="text-sm font-black text-emerald-600">{mStats.selesai}</div>
                        <div className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mt-1">Selesai</div>
                      </div>
                      <div 
                        onClick={() => handleStatClick(member, 'Sedang Dikerjakan')}
                        className="text-center bg-amber-50 border border-amber-100 rounded-xl p-2.5 shadow-sm cursor-pointer hover:bg-amber-100 transition-all active:scale-95"
                      >
                        <div className="text-sm font-black text-amber-600">{mStats.proses}</div>
                        <div className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mt-1">Proses</div>
                      </div>
                      <div className="text-center bg-slate-50 border border-slate-200 rounded-xl p-2.5 shadow-sm opacity-60">
                        <div className="text-sm font-black text-slate-500">{mStats.belumMulai}</div>
                        <div className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mt-1">Belum</div>
                      </div>
                      <div className="text-center bg-red-50 border border-red-100 rounded-xl p-2.5 shadow-sm opacity-60">
                        <div className="text-sm font-black text-red-600">{mStats.ditunda}</div>
                        <div className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mt-1">Ditunda</div>
                      </div>
                    </div>
                  </div>
                )}
                {isPM && (
                  <div className="py-4 px-6 bg-slate-50 rounded-2xl border border-slate-100 border-dashed text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">Manager tidak masuk dalam hitungan kinerja tim</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-900">
                {editingId ? 'Edit Anggota' : 'Tambah Anggota Tim'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900 transition-all">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Nama Lengkap</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all placeholder-slate-400 text-slate-900 font-bold" placeholder="Misal: Budi Santoso" />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Jabatan / Role</label>
                <input required type="text" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all placeholder-slate-400 text-slate-900 font-bold" placeholder="Misal: Frontend Developer" />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Departemen</label>
                <input type="text" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all placeholder-slate-400 text-slate-900 font-bold" placeholder="Misal: Engineering" />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">URL Foto Profil</label>
                <input type="url" value={formData.avatar} onChange={e => setFormData({...formData, avatar: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all placeholder-slate-400 text-slate-900 font-bold" placeholder="https://..." />
              </div>
              <div className="flex flex-wrap items-center gap-6 pt-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      checked={formData.isOnline} 
                      onChange={e => setFormData({...formData, isOnline: e.target.checked})} 
                      className="sr-only"
                    />
                    <div className={`w-10 h-6 rounded-full transition-colors ${formData.isOnline ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.isOnline ? 'translate-x-4' : ''}`}></div>
                  </div>
                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Status Online</span>
                </label>
                
                {currentUser?.isAdmin && (
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        checked={formData.isAdmin} 
                        onChange={e => setFormData({...formData, isAdmin: e.target.checked})} 
                        className="sr-only"
                      />
                      <div className={`w-10 h-6 rounded-full transition-colors ${formData.isAdmin ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
                      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.isAdmin ? 'translate-x-4' : ''}`}></div>
                    </div>
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Akses Admin</span>
                  </label>
                )}
              </div>

              <div className="flex gap-4 pt-6 mt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-500 font-bold rounded-2xl hover:bg-slate-50 transition-all text-sm">
                  Batal
                </button>
                <button type="submit" className="flex-1 px-4 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all text-sm shadow-lg shadow-indigo-100 transform active:scale-95">
                  Simpan Anggota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Tasks View Modal */}
      {viewingTasks && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-4xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 flex flex-col max-h-[85vh]">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border-2 border-white shadow-sm overflow-hidden">
                  <img src={viewingTasks.member.avatar} alt={viewingTasks.member.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">{viewingTasks.member.name}</h3>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    {viewingTasks.status === 'Semua' ? 'Seluruh Tugas' : `Tugas ${viewingTasks.status}`}
                  </p>
                </div>
              </div>
              <button onClick={() => setViewingTasks(null)} className="text-slate-400 hover:text-slate-900 transition-all bg-white p-2 rounded-2xl border border-slate-200 shadow-sm hover:rotate-90">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar">
              {tasks
                .filter(t => t.assigneeId === viewingTasks.member.id && (viewingTasks.status === 'Semua' || t.status === viewingTasks.status))
                .map(task => {
                  const project = projects.find(p => p.id === task.projectId);
                  return (
                    <div 
                      key={task.id}
                      onClick={() => {
                        setDashboardTaskToOpen(task);
                      }}
                      className="p-5 bg-white border border-slate-200 rounded-3xl hover:border-indigo-600 hover:shadow-xl transition-all group cursor-pointer relative pr-12"
                    >
                      <div className="absolute top-1/2 -translate-y-1/2 right-4 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1">
                        <ExternalLink size={20} className="text-indigo-600" />
                      </div>
                      <div className="flex justify-between items-start gap-4 mb-3">
                        <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{task.title}</h4>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border whitespace-nowrap shadow-sm
                          ${task.status === 'Selesai' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                            task.status === 'Sedang Dikerjakan' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 
                            'bg-slate-50 text-slate-400 border-slate-200'}
                        `}>
                          {task.status}
                        </span>
                      </div>
                      
                      <p className="text-sm text-slate-500 line-clamp-2 mb-4 font-medium">{task.description}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-50">
                        {project && (
                          <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded-lg">
                            {project.name}
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <MapPin size={12} className="text-indigo-400" />
                          {task.location || 'N/A'}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <Calendar size={12} className="text-indigo-400" />
                          {task.deadline ? format(new Date(task.deadline), 'dd MMM yyyy', { locale: idLocale }) : '-'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              
              {tasks.filter(t => t.assigneeId === viewingTasks.member.id && (viewingTasks.status === 'Semua' || t.status === viewingTasks.status)).length === 0 && (
                <div className="text-center py-16 bg-slate-50 rounded-4xl border border-dashed border-slate-200">
                  <p className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Tidak ada tugas</p>
                </div>
              )}
            </div>
            
            <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button 
                onClick={() => setViewingTasks(null)}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl transition-all text-sm shadow-xl shadow-indigo-100"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
