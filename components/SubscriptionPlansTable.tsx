"use client";

import { Edit3, Users, HardDrive, Trash2 } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  monthly_price: number;
  user_limit: number;
  storage_gb: number;
}

export function SubscriptionPlansTable({ plans }: { plans: Plan[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {plans.map((plan) => (
        <div 
          key={plan.id} 
          className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 transition-all hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/5"
        >
          {/* Header du Plan */}
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-blue-600 font-mono italic">
                  {plan.monthly_price.toLocaleString()}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">F/mois</span>
              </div>
            </div>
            <button className="rounded-full bg-slate-50 p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors">
              <Edit3 size={16} />
            </button>
          </div>

          {/* Caractéristiques */}
          <div className="space-y-3 border-t border-slate-50 pt-4">
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                <Users size={14} />
              </div>
              <span className="font-medium">Jusqu'à <b className="text-slate-900">{plan.user_limit} utilisateurs</b></span>
            </div>
            
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                <HardDrive size={14} />
              </div>
              <span className="font-medium"><b className="text-slate-900">{plan.storage_gb} Go</b> de stockage</span>
            </div>
          </div>

          {/* Badge discret */}
          <div className="absolute -right-4 -top-4 h-16 w-16 rotate-12 bg-slate-50 opacity-0 group-hover:opacity-100 transition-all duration-500" />
        </div>
      ))}

      {plans.length === 0 && (
        <div className="col-span-full flex flex-col items-center justify-center py-12 rounded-3xl border-2 border-dashed border-slate-100">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Aucune offre configurée</p>
        </div>
      )}
    </div>
  );
}