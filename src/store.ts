import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ChecklistItem {
  id: string;
  text: string;
  isCompleted: boolean;
}

export type TaskStatus = 'Belum Dimulai' | 'Sedang Dikerjakan' | 'Selesai' | 'Ditunda' | 'Dibatalkan';
export type TaskPriority = 'Rendah' | 'Sedang' | 'Tinggi' | 'Urgent';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  password?: string;
  isVerified?: boolean;
  role: string;
  department: string;
  avatar: string;
  isOnline: boolean;
  isAdmin?: boolean;
}

export interface Note {
  id: string;
  text: string;
  createdAt: string;
}

export interface Feedback {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assigneeId: string;
  projectId?: string;
  status: TaskStatus;
  priority: TaskPriority;
  location: string;
  deadline: string;
  createdAt: string;
  completedAt?: string;
  checklist?: ChecklistItem[];
  notes?: Note[];
  feedbacks?: Feedback[];
}

interface AppState {
  members: TeamMember[];
  tasks: Task[];
  projects: Project[];
  taskStatusFilter: string;
  setTaskStatusFilter: (status: string) => void;
  dashboardTaskToOpen: Task | null;
  setDashboardTaskToOpen: (task: Task | null) => void;
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addMember: (member: Omit<TeamMember, 'id'>) => string; // Return the new ID
  updateMember: (id: string, member: Partial<TeamMember>) => void;
  deleteMember: (id: string) => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  addNoteToTask: (taskId: string, text: string) => void;
  addFeedbackToTask: (taskId: string, userId: string, text: string) => void;
  currentUser: TeamMember | null;
  login: (email: string, password?: string) => boolean;
  logout: () => void;
}

const initialMembers: TeamMember[] = [
  { id: '1', name: 'Budi Santoso', email: 'budi@example.com', password: 'password123', isVerified: true, role: 'Project Manager', department: 'Management', avatar: 'https://i.pravatar.cc/150?u=1', isOnline: true, isAdmin: true },
  { id: '2', name: 'Siti Aminah', email: 'siti@example.com', password: 'password123', isVerified: true, role: 'Frontend Developer', department: 'Engineering', avatar: 'https://i.pravatar.cc/150?u=2', isOnline: true },
  { id: '3', name: 'Agus Pratama', email: 'agus@example.com', password: 'password123', isVerified: true, role: 'Backend Developer', department: 'Engineering', avatar: 'https://i.pravatar.cc/150?u=3', isOnline: false },
  { id: '4', name: 'Dina Fitriani', email: 'dina@example.com', password: 'password123', isVerified: true, role: 'UI/UX Designer', department: 'Design', avatar: 'https://i.pravatar.cc/150?u=4', isOnline: true },
];

const initialProjects: Project[] = [
  { id: 'p1', name: 'Website Redesign', description: 'Redesain website perusahaan', createdAt: '2023-10-01' },
  { id: 'p2', name: 'Mobile App', description: 'Pengembangan aplikasi mobile baru', createdAt: '2023-10-15' },
];

const initialTasks: Task[] = [
  { id: 't1', title: 'Setup Repository', description: 'Inisialisasi repo dan setup CI/CD', assigneeId: '3', projectId: 'p1', status: 'Selesai', priority: 'Tinggi', location: 'Remote', deadline: '2023-11-01', createdAt: '2023-10-30', completedAt: '2023-10-31T00:00:00.000Z' },
  { id: 't2', title: 'Desain Halaman Login', description: 'Membuat mockup untuk halaman login dan register', assigneeId: '4', projectId: 'p2', status: 'Selesai', priority: 'Sedang', location: 'Gedung A', deadline: '2023-11-02', createdAt: '2023-10-31', completedAt: '2023-11-01T00:00:00.000Z' },
  { id: 't3', title: 'Implementasi API Login', description: 'Integrasi backend login API', assigneeId: '3', projectId: 'p2', status: 'Sedang Dikerjakan', priority: 'Urgent', location: 'Remote', deadline: '2023-11-05', createdAt: '2023-11-01' },
  { id: 't4', title: 'Slicing UI Dashboard', description: 'Konversi desain Figma ke React', assigneeId: '2', projectId: 'p1', status: 'Sedang Dikerjakan', priority: 'Tinggi', location: 'Gedung B', deadline: '2023-11-06', createdAt: '2023-11-02' },
  { id: 't5', title: 'Riset Teknologi Database', description: 'Mencari alternatif DB yang lebih cepat', assigneeId: '1', projectId: 'p1', status: 'Belum Dimulai', priority: 'Rendah', location: 'Remote', deadline: '2023-11-10', createdAt: '2023-11-03' },
  { id: 't6', title: 'Review Code Slicing', description: 'Review struktur komponen UI', assigneeId: '1', projectId: 'p1', status: 'Ditunda', priority: 'Sedang', location: 'Gedung A', deadline: '2023-11-08', createdAt: '2023-11-03' },
];

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      members: initialMembers,
      tasks: initialTasks,
      projects: initialProjects,
      taskStatusFilter: 'Semua',
      setTaskStatusFilter: (status) => set({ taskStatusFilter: status }),
      dashboardTaskToOpen: null,
      setDashboardTaskToOpen: (task) => set({ dashboardTaskToOpen: task }),
      addProject: (project) => set((state) => ({ projects: [...state.projects, { ...project, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString() }] })),
      updateProject: (id, project) => set((state) => ({ projects: state.projects.map((p) => (p.id === id ? { ...p, ...project } : p)) })),
      deleteProject: (id) => set((state) => ({ projects: state.projects.filter((p) => p.id !== id) })),
      addMember: (member) => {
        const id = Math.random().toString(36).substr(2, 9);
        set((state) => ({ members: [...state.members, { ...member, id }] }));
        return id;
      },
      updateMember: (id, member) => set((state) => ({ members: state.members.map((m) => (m.id === id ? { ...m, ...member } : m)) })),
      deleteMember: (id) => set((state) => ({ members: state.members.filter((m) => m.id !== id) })),
      addTask: (task) => set((state) => ({
        tasks: [...state.tasks, { ...task, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString() }],
      })),
      updateTask: (id, task) => set((state) => ({ 
        tasks: state.tasks.map((t) => {
          if (t.id === id) {
            let nextTask = { ...t, ...task };
            
            // If status is forced to Selesai, ensure all checklist items are completed
            if (task.status === 'Selesai' && nextTask.checklist) {
              nextTask.checklist = nextTask.checklist.map(item => ({ ...item, isCompleted: true }));
            }

            const isTerminal = task.status === 'Selesai' || task.status === 'Dibatalkan';
            const wasTerminal = t.status === 'Selesai' || t.status === 'Dibatalkan';
            
            if (isTerminal && !wasTerminal) {
              nextTask.completedAt = new Date().toISOString();
            } else if (task.status && !isTerminal && wasTerminal) {
              nextTask.completedAt = undefined;
            }
            return nextTask;
          }
          return t;
        })
      })),
      deleteTask: (id) => set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),
      currentUser: null,
      login: (email, password) => {
        const user = useStore.getState().members.find(m => m.email === email && (!password || m.password === password));
        if (user) {
          set({ currentUser: user });
          return true;
        }
        return false;
      },
      logout: () => set({ currentUser: null }),
      addNoteToTask: (taskId, text) => set((state) => ({
        tasks: state.tasks.map((t) => t.id === taskId ? { 
          ...t, 
          notes: [...(t.notes || []), { id: Math.random().toString(36).substr(2, 9), text, createdAt: new Date().toISOString() }] 
        } : t)
      })),
      addFeedbackToTask: (taskId, userId, text) => set((state) => ({
        tasks: state.tasks.map((t) => t.id === taskId ? { 
          ...t, 
          feedbacks: [...(t.feedbacks || []), { id: Math.random().toString(36).substr(2, 9), userId, text, createdAt: new Date().toISOString() }] 
        } : t)
      })),
      updateTaskStatus: (id, status) => set((state) => {
        return {
          tasks: state.tasks.map((t) => {
            if (t.id === id) {
              let finalStatus = status;
              let checklist = t.checklist;

              if (status === 'Selesai' && checklist && checklist.length > 0) {
                checklist = checklist.map(item => ({ ...item, isCompleted: true }));
              } else if (checklist && checklist.length > 0) {
                const allCompleted = checklist.every(item => item.isCompleted);
                const anyCompleted = checklist.some(item => item.isCompleted);
                if (!allCompleted && finalStatus === 'Selesai') {
                  finalStatus = 'Sedang Dikerjakan';
                } else if (allCompleted && finalStatus !== 'Selesai') {
                  finalStatus = 'Selesai';
                } else if (anyCompleted && finalStatus === 'Belum Dimulai') {
                  finalStatus = 'Sedang Dikerjakan';
                }
              }

              const nextTask = { ...t, status: finalStatus, checklist };
              const isTerminal = finalStatus === 'Selesai' || finalStatus === 'Dibatalkan';
              if (isTerminal) {
                nextTask.completedAt = t.completedAt || new Date().toISOString();
              } else {
                nextTask.completedAt = undefined;
              }
              return nextTask;
            }
            return t;
          })
        };
      }),
    }),
    {
      name: 'teamtrack-storage',
    }
  )
);
