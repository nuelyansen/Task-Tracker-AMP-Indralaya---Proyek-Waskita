import { useState, useMemo } from 'react';
import { useStore, TaskStatus, TaskPriority } from '../store';
import { ChevronLeft, ChevronRight, CheckCircle, Clock, FileText, MapPin } from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, addMonths, subMonths } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

export function MonthlyReport() {
  const { tasks, members } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());

  const firstDayOfMonth = startOfMonth(currentDate);
  const lastDayOfMonth = endOfMonth(currentDate);

  const monthTasks = useMemo(() => {
    return tasks.filter(task => {
      if (!task.deadline) return false;
      const taskDate = parseISO(task.deadline);
      return isWithinInterval(taskDate, { start: firstDayOfMonth, end: lastDayOfMonth });
    });
  }, [tasks, firstDayOfMonth, lastDayOfMonth]);

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const totalTasks = monthTasks.length;
  const completedTasks = monthTasks.filter(t => t.status === 'Selesai').length;
  const inProgressTasks = monthTasks.filter(t => t.status === 'Sedang Dikerjakan').length;

  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const getStatusColor = (status: TaskStatus) => {
    switch(status) {
      case 'Selesai': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Sedang Dikerjakan': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'Ditunda': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Belum Dimulai': default: return 'bg-red-50 text-red-600 border-red-100';
    }
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    switch(priority) {
      case 'Urgent': return 'bg-red-50 text-red-600 border border-red-100 font-black uppercase tracking-widest';
      case 'Tinggi': return 'bg-amber-50 text-amber-600 border border-amber-100 font-black uppercase tracking-widest';
      case 'Sedang': return 'bg-indigo-50 text-indigo-600 border border-indigo-100 font-black uppercase tracking-widest';
      case 'Rendah': return 'bg-slate-50 text-slate-500 border border-slate-200 font-black uppercase tracking-widest';
      default: return 'bg-slate-50 text-slate-500 border border-slate-200';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Laporan Bulanan</h2>
          <p className="text-slate-500 text-sm mt-1">Review performa tim dalam rentang waktu bulanan.</p>
        </div>
        
        <div className="flex items-center bg-white rounded-full border border-slate-200 p-1.5 shadow-sm">
          <button onClick={prevMonth} className="p-2 hover:bg-slate-50 rounded-full transition-all text-slate-400 hover:text-indigo-600">
            <ChevronLeft size={20} />
          </button>
          <div className="px-6 text-sm font-black text-slate-900 min-w-[180px] text-center uppercase tracking-widest">
            {format(currentDate, 'MMMM yyyy', { locale: idLocale })}
          </div>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-50 rounded-full transition-all text-slate-400 hover:text-indigo-600">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-slate-400">Total Tugas</p>
              <h3 className="text-2xl font-black text-slate-900">{totalTasks}</h3>
            </div>
            <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 shadow-inner">
              <FileText size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-emerald-600">Selesai</p>
              <h3 className="text-2xl font-black text-slate-900">{completedTasks}</h3>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 shadow-inner">
              <CheckCircle size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-amber-600">Proses</p>
              <h3 className="text-2xl font-black text-slate-900">{inProgressTasks}</h3>
            </div>
            <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 shadow-inner">
              <Clock size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-indigo-600">Progress</p>
              <h3 className="text-2xl font-black text-slate-900">{progressPercentage}%</h3>
            </div>
            <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 shadow-inner">
              <CheckCircle size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-4xl p-8 shadow-sm">
        <h3 className="font-black text-xl text-slate-900 mb-8 flex items-center gap-3">
          <div className="w-2 h-8 bg-indigo-600 rounded-full"></div>
          Daftar Pekerjaan
        </h3>
        
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="text-[10px] text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                <th className="pb-6 font-black px-4">Nama Tugas</th>
                <th className="pb-6 font-black px-4">Tenggat Waktu</th>
                <th className="pb-6 font-black px-4">Penanggung Jawab</th>
                <th className="pb-6 font-black px-4 text-center">Status</th>
                <th className="pb-6 font-black px-4 text-center">Prioritas</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {monthTasks.map(task => {
                const assignee = members.find(m => m.id === task.assigneeId);
                return (
                  <tr key={task.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                    <td className="py-6 px-4">
                      <div className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{task.title}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-2 mt-2 tracking-widest">
                        <MapPin size={10} className="text-indigo-400" />
                        {task.location || 'N/A'}
                      </div>
                    </td>
                    <td className="py-6 px-4">
                      <span className="text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                        {task.deadline ? format(new Date(task.deadline), 'dd MMM yyyy', { locale: idLocale }) : '-'}
                      </span>
                    </td>
                    <td className="py-6 px-4">
                       <div className="flex items-center gap-3">
                         {assignee ? (
                           <>
                            <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm overflow-hidden bg-slate-100">
                              <img src={assignee.avatar} alt={assignee.name} className="w-full h-full object-cover" />
                            </div>
                            <span className="text-xs font-bold text-slate-700">{assignee.name}</span>
                           </>
                         ) : (
                           <span className="text-xs text-slate-400 italic font-medium">Unassigned</span>
                         )}
                       </div>
                    </td>
                    <td className="py-6 px-4 text-center">
                      <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full border shadow-sm ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="py-6 px-4 text-center">
                      <span className={`text-[10px] font-black px-4 py-1.5 rounded-full shadow-sm ${getPriorityBadge(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {monthTasks.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <FileText size={48} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Tidak ada data untuk bulan ini</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
