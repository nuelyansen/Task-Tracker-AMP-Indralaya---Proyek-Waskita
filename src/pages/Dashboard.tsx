import { useStore, TaskStatus } from '../store';
import { FolderKanban, CheckCircle, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import type { TabType } from '../App';

interface DashboardProps {
  setCurrentTab?: (tab: TabType) => void;
}

export function Dashboard({ setCurrentTab }: DashboardProps) {
  const { members, tasks, projects, setTaskStatusFilter, setDashboardTaskToOpen } = useStore();

  const totalProjects = projects.length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Selesai').length;
  const inProgressTasks = tasks.filter(t => t.status === 'Sedang Dikerjakan').length;
  const unstartedTasks = tasks.filter(t => t.status === 'Belum Dimulai').length;
  const delayedTasks = tasks.filter(t => t.status === 'Ditunda').length;

  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleStatClick = (tabToNavigate: TabType, statusFilter?: string) => {
    if (statusFilter) setTaskStatusFilter(statusFilter);
    setCurrentTab?.(tabToNavigate);
  };

  const handletaskClick = (task: any) => {
    setDashboardTaskToOpen(task);
    setCurrentTab?.('tugas');
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

  const stats = [
    { label: 'Total Proyek', value: totalProjects, icon: FolderKanban, color: 'bg-indigo-50 text-indigo-600', borderColor: 'border-slate-200', onClick: () => handleStatClick('proyek') },
    { label: 'Total Tugas', value: totalTasks, icon: CheckCircle, color: 'bg-blue-50 text-blue-600', borderColor: 'border-slate-200', onClick: () => handleStatClick('tugas', 'Semua') },
    { label: 'Selesai', value: completedTasks, icon: CheckCircle, color: 'bg-emerald-50 text-emerald-600', borderColor: 'border-slate-200', onClick: () => handleStatClick('tugas', 'Selesai') },
    { label: 'Proses', value: inProgressTasks, icon: Clock, color: 'bg-amber-50 text-amber-600', borderColor: 'border-slate-200', onClick: () => handleStatClick('tugas', 'Sedang Dikerjakan') },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div 
            key={i} 
            onClick={stat.onClick}
            className={`bg-white p-6 rounded-3xl border border-slate-200 cursor-pointer hover:shadow-lg hover:border-indigo-100 transition-all shadow-sm`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 text-slate-400`}>{stat.label}</p>
                <h3 className={`text-2xl font-black text-slate-900`}>{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-2xl ${stat.color} shadow-inner`}>
                <stat.icon size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        {/* Progress Overview Section */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-2">Progress Keseluruhan</h3>
          
          <div className="space-y-8">
            <div className="relative">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Tugas Selesai</span>
                <span className="text-sm font-black text-indigo-600">{progressPercentage}%</span>
              </div>
              <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-indigo-600 transition-all duration-1000 ease-out rounded-full shadow-lg shadow-indigo-200" 
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
              <div className="text-center cursor-pointer hover:bg-slate-50 p-4 rounded-2xl transition-all" onClick={() => handleStatClick('tugas', 'Belum Dimulai')}>
                <div className="text-3xl font-black text-slate-300 mb-1">{unstartedTasks}</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Belum Dimulai</div>
              </div>
              <div className="text-center cursor-pointer hover:bg-slate-50 p-4 rounded-2xl transition-all" onClick={() => handleStatClick('tugas', 'Sedang Dikerjakan')}>
                <div className="text-3xl font-black text-amber-500 mb-1">{inProgressTasks}</div>
                <div className="text-xs font-bold text-amber-500 uppercase tracking-widest opacity-80">Sedang Proses</div>
              </div>
              <div className="text-center cursor-pointer hover:bg-slate-50 p-4 rounded-2xl transition-all" onClick={() => handleStatClick('tugas', 'Selesai')}>
                <div className="text-3xl font-black text-emerald-500 mb-1">{completedTasks}</div>
                <div className="text-xs font-bold text-emerald-500 uppercase tracking-widest opacity-80">Selesai</div>
              </div>
              <div className="text-center cursor-pointer hover:bg-slate-50 p-4 rounded-2xl transition-all" onClick={() => handleStatClick('tugas', 'Ditunda')}>
                <div className="text-3xl font-black text-slate-400 mb-1">{delayedTasks}</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ditunda</div>
              </div>
            </div>
          </div>
        </div>

        {/* Priority Status Section */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-2">
            <AlertCircle size={20} className="text-indigo-600" />
            Prioritas Tugas
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {['Urgent', 'Tinggi', 'Sedang', 'Rendah'].map(priority => {
               const priorityTasks = tasks.filter(t => t.priority === priority && t.status !== 'Selesai');
               
               let colors = '';
               switch(priority) {
                 case 'Urgent': colors = 'bg-red-50 text-red-600 border-red-100'; break;
                 case 'Tinggi': colors = 'bg-amber-50 text-amber-600 border-amber-100'; break;
                 case 'Sedang': colors = 'bg-indigo-50 text-indigo-600 border-indigo-100'; break;
                 case 'Rendah': colors = 'bg-slate-50 text-slate-500 border-slate-200'; break;
               }

               return (
                 <div key={priority} className="bg-slate-50/50 border border-slate-200 rounded-3xl flex flex-col h-full overflow-hidden">
                   <div className={`px-4 py-3 border-b border-slate-200 font-black text-[10px] uppercase tracking-widest ${colors} flex justify-between items-center`}>
                     <span>{priority}</span>
                     <span className="bg-white/50 px-2.5 py-0.5 rounded-full text-[10px] shadow-sm">
                       {priorityTasks.length}
                     </span>
                   </div>
                   <div className="p-3 space-y-2 flex-grow max-h-[400px] overflow-y-auto custom-scrollbar">
                     {priorityTasks.map(task => {
                       const assignee = members.find(m => m.id === task.assigneeId);
                       const project = projects.find(p => p.id === task.projectId);
                       return (
                         <div 
                           key={task.id} 
                           onClick={() => handletaskClick(task)}
                           className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer"
                         >
                           <p className="font-bold text-xs text-slate-800 line-clamp-2 mb-1">{task.title}</p>
                           {project && (
                             <div className="text-[9px] text-indigo-600 font-bold tracking-widest uppercase mb-3 line-clamp-1 opacity-70">
                               {project.name}
                             </div>
                           )}
                           <div className="flex items-center gap-2 mt-auto">
                             {assignee ? (
                               <div className="flex items-center gap-2">
                                 <div className="w-5 h-5 rounded-full border border-slate-100 overflow-hidden shrink-0">
                                   <img src={assignee.avatar} alt={assignee.name} className="w-full h-full object-cover" />
                                 </div>
                                 <span className="text-[10px] font-bold text-slate-500 truncate max-w-[100px]">{assignee.name}</span>
                               </div>
                             ) : (
                               <span className="text-[10px] text-slate-400 italic font-medium">Unassigned</span>
                             )}
                           </div>
                         </div>
                       );
                     })}
                     {priorityTasks.length === 0 && (
                       <div className="text-center py-8 text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                         Kosong
                       </div>
                     )}
                   </div>
                 </div>
               );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-2">
          <TrendingUp size={20} className="text-indigo-600" />
          Kinerja Tim
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {members.filter(m => m.role !== 'Project Manager').map(member => {
            const mStats = getMemberStats(member.id);
            return (
              <div key={member.id} className="bg-slate-50/50 rounded-3xl border border-slate-200 p-6 hover:shadow-lg hover:border-indigo-100 transition-all cursor-pointer group" onClick={() => handleStatClick('tim')}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full border-2 border-white shadow-md overflow-hidden shrink-0 transition-transform group-hover:scale-110">
                    <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="overflow-hidden flex-1">
                    <h4 className="font-bold text-slate-900 truncate">{member.name}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{member.role}</p>
                  </div>
                  {mStats.total > 0 && (
                    <div className="text-right shrink-0">
                      <div className="text-lg font-black text-indigo-600">{Math.round((mStats.selesai / mStats.total) * 100)}%</div>
                      <div className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em]">Selesai</div>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-4 gap-3">
                  <div className="text-center bg-white rounded-2xl p-2.5 shadow-sm border border-slate-100">
                    <div className="text-sm font-black text-emerald-600">{mStats.selesai}</div>
                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mt-0.5">Selesai</div>
                  </div>
                  <div className="text-center bg-white rounded-2xl p-2.5 shadow-sm border border-slate-100">
                    <div className="text-sm font-black text-amber-500">{mStats.proses}</div>
                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mt-0.5">Proses</div>
                  </div>
                  <div className="text-center bg-white rounded-2xl p-2.5 shadow-sm border border-slate-100">
                    <div className="text-sm font-black text-slate-400">{mStats.belumMulai}</div>
                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mt-0.5">Belum</div>
                  </div>
                  <div className="text-center bg-white rounded-2xl p-2.5 shadow-sm border border-slate-100">
                    <div className="text-sm font-black text-red-500">{mStats.ditunda}</div>
                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mt-0.5">Ditunda</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {members.length === 0 && (
          <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              Belum ada anggota tim
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
