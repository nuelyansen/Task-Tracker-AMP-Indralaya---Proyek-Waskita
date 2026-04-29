import { LayoutDashboard, Users, FolderKanban, CheckSquare, Trello, CalendarDays, X } from 'lucide-react';
import type { TabType } from '../App';

interface SidebarProps {
  currentTab: TabType;
  setCurrentTab: (tab: TabType) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function Sidebar({ currentTab, setCurrentTab, isOpen, setIsOpen }: SidebarProps) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tim', label: 'Tim', icon: Users },
    { id: 'proyek', label: 'Proyek', icon: FolderKanban },
    { id: 'tugas', label: 'Tugas', icon: CheckSquare },
    { id: 'kanban', label: 'Kanban', icon: Trello },
    { id: 'laporan', label: 'Laporan Bulanan', icon: CalendarDays },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar sidebar */}
      <aside className={`
        fixed md:relative inset-y-0 left-0 z-50
        bg-white border-r border-slate-200 flex flex-col
        transition-all duration-300 ease-in-out overflow-hidden
        ${isOpen ? 'w-64 translate-x-0 opacity-100' : 'w-0 -translate-x-full md:translate-x-0 opacity-0 pointer-events-none'}
      `}>
        <div className="h-16 flex items-center px-6 border-b border-slate-200 shrink-0 justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg">
              TT
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900">Task Tracker</span>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="md:hidden p-1 rounded-md hover:bg-slate-100 text-slate-500"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setCurrentTab(tab.id as TabType);
                setIsOpen(false);
              }}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                ${currentTab === tab.id 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'}
              `}
            >
              <tab.icon size={18} className={currentTab === tab.id ? 'opacity-100' : 'opacity-60'} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-auto p-4 border-t border-slate-100 uppercase tracking-widest text-[10px] font-bold text-slate-400">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <p className="mb-2">Workspace</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-xs">
                HK
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 truncate w-32 normal-case tracking-normal">PT Hakaaston</p>
                <p className="text-[10px] text-slate-500 normal-case tracking-normal">Enterprise Plan</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
