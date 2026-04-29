import { Menu, Bell, Search, LogOut } from 'lucide-react';
import type { TabType } from '../App';
import { useStore } from '../store';

interface TopbarProps {
  toggleSidebar: () => void;
  currentTab: TabType;
}

export function Topbar({ toggleSidebar, currentTab }: TopbarProps) {
  const { currentUser, logout } = useStore();

  const getTabTitle = (tab: TabType) => {
    switch (tab) {
      case 'dashboard': return 'Dashboard Overview';
      case 'tim': return 'Manajemen Tim';
      case 'proyek': return 'Manajemen Proyek';
      case 'tugas': return 'Daftar Tugas';
      case 'kanban': return 'Kanban Board';
      case 'laporan': return 'Laporan Bulanan';
      default: return 'Dashboard';
    }
  };

  return (
    <header className="h-16 flex items-center justify-between px-4 lg:px-8 shrink-0 z-10 relative bg-white/50 backdrop-blur-md border-b border-slate-200/50">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-md text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-xl font-black text-slate-900 tracking-tight">
          {getTabTitle(currentTab)}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex relative group">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600" />
          <input 
            type="text" 
            placeholder="Cari sesuatu..." 
            className="pl-9 pr-4 py-2 w-64 bg-white border border-slate-200 rounded-full text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all shadow-sm"
          />
        </div>
        
        <button className="relative p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors hidden md:block">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 border-2 border-white"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="flex flex-col items-end hidden sm:flex text-right pr-1">
            <span className="text-sm font-bold text-slate-900 leading-none">{currentUser?.name}</span>
            <span className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">{currentUser?.role} {currentUser?.isAdmin && '(Admin)'}</span>
          </div>
          <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 shadow-sm">
            <img src={currentUser?.avatar || "https://i.pravatar.cc/150"} alt="User" className="w-full h-full object-cover" />
          </div>
          <button 
            onClick={logout}
            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors ml-1"
            title="Keluar"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
