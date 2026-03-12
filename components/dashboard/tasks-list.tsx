'use client';

import { useState, useTransition } from 'react';
import { toggleTask, createTask } from '@/lib/actions/tasks';
import { useToast } from '@/components/ui/toast';
// Ajoute Target dans la liste des imports
import { Target } from "lucide-react";

const PRIORITY_DOT: Record<string, string> = {
  urgente: 'bg-red-500',
  haute: 'bg-orange-400',
  normal: 'bg-blue-400',
  basse: 'bg-slate-300',
};

interface Task {
  id: string;
  title: string;
  due_date: string | null;
  priority: string;
  completed: boolean;
  matter: { id: string; title: string } | null;
}

export function TasksList({ tasks: initialTasks }: { tasks: Task[] }) {
  const [isPending, startTransition] = useTransition();
  const [newTitle, setNewTitle] = useState('');
  const { toast } = useToast();

  function handleToggle(taskId: string, completed: boolean) {
    startTransition(async () => {
      const r = await toggleTask(taskId, !completed);
      if (!r.success) toast('error', r.error ?? 'Erreur');
    });
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    
    startTransition(async () => {
      // On passe les champs attendus par ton action createTask
      const r = await createTask({ 
        title: newTitle.trim(),
        priority: 'normal' 
      });

      if (r.success) {
        setNewTitle('');
        toast('success', 'Tâche ajoutée.');
      } else {
        toast('error', r.error ?? 'Erreur de permission (RLS)');
      }
    });
  }

  return (
    <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-sm font-black uppercase tracking-[0.15em] text-slate-400">Tâches prioritaires</h2>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
          {initialTasks.filter(t => !t.completed).length} en cours
        </span>
      </div>

      {/* Formulaire d'ajout rapide */}
      <form onSubmit={handleAdd} className="mb-6 flex gap-2">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Ajouter une tâche…"
          disabled={isPending}
          className="flex-1 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-2.5 text-sm font-medium transition-all focus:border-blue-200 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-50"
        />
        <button 
          type="submit" 
          disabled={isPending || !newTitle.trim()} 
          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-lg font-bold text-white transition-transform hover:scale-105 active:scale-95 disabled:opacity-30"
        >
          +
        </button>
      </form>

      {initialTasks.length > 0 ? (
        <div className="space-y-2">
          {initialTasks.map((t) => (
            <button
              key={t.id}
              onClick={() => handleToggle(t.id, t.completed)}
              disabled={isPending}
              className="group flex w-full items-center gap-4 rounded-[20px] border border-transparent p-3 text-left transition-all hover:border-slate-100 hover:bg-slate-50/50"
            >
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-all ${
                t.completed 
                  ? 'border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-100' 
                  : 'border-slate-200 bg-white group-hover:border-slate-300'
              }`}>
                {t.completed && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </span>
              
              <div className="min-w-0 flex-1">
                <p className={`truncate text-sm font-bold ${t.completed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                  {t.title}
                </p>
                <div className="mt-0.5 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  {t.due_date && <span className="text-blue-500">{fmtDate(t.due_date)}</span>}
                  {t.matter?.title && <span className="truncate">/ {t.matter.title}</span>}
                </div>
              </div>

              <div className={`h-2.5 w-2.5 shrink-0 rounded-full shadow-sm ${PRIORITY_DOT[t.priority] ?? PRIORITY_DOT.normal}`} />
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-300">
             <Target size={20} />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Tout est à jour</p>
        </div>
      )}
    </div>
  );
}

function fmtDate(d: string) {
  try { return new Intl.DateTimeFormat('fr', { day: 'numeric', month: 'short' }).format(new Date(d)); }
  catch { return d; }
}