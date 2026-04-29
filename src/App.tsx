/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { Dashboard } from './pages/Dashboard';
import { TeamManagement } from './pages/TeamManagement';
import { TaskManagement } from './pages/TaskManagement';
import { KanbanBoard } from './pages/KanbanBoard';
import { MonthlyReport } from './pages/MonthlyReport';
import { Login } from './pages/Login';
import { ProjectManagement } from './pages/ProjectManagement';
import { useStore } from './store';

export type TabType = 'dashboard' | 'tim' | 'proyek' | 'tugas' | 'kanban' | 'laporan';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const { currentUser, dashboardTaskToOpen } = useStore();

  useEffect(() => {
    if (dashboardTaskToOpen && currentTab !== 'tugas') {
      setCurrentTab('tugas');
    }
  }, [dashboardTaskToOpen, currentTab]);

  if (!currentUser) {
    return <Login />;
  }

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard': return <Dashboard setCurrentTab={setCurrentTab} />;
      case 'tim': return <TeamManagement />;
      case 'proyek': return <ProjectManagement />;
      case 'tugas': return <TaskManagement />;
      case 'kanban': return <KanbanBoard />;
      case 'laporan': return <MonthlyReport />;
      default: return <Dashboard setCurrentTab={setCurrentTab} />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 font-sans overflow-hidden relative">
      {/* Background Decoration */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-indigo-100 rounded-full blur-[120px] opacity-60 pointer-events-none"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-blue-50 rounded-full blur-[120px] opacity-40 pointer-events-none"></div>

      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
      />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden z-10">
        <Topbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} currentTab={currentTab} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

