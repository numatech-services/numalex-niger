"use client";

import { useFormStatus, useFormState } from "react-dom";
import { upsertSubscriptionPlan } from "@/lib/actions/upsertSubscriptionPlan";
import type { ActionState } from "@/lib/actions/types";
import { FormStateBanner } from "./FormStateBanner";
import { CreditCard, Users, HardDrive, Sparkles } from "lucide-react";

const initialState: ActionState = { ok: true, message: "" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-black uppercase tracking-widest text-white hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-100 active:scale-95"
    >
      <Sparkles size={16} />
      {pending ? "Traitement..." : "Créer / Mettre à jour le plan"}
    </button>
  );
}

export function SubscriptionPlanForm() {
  const [state, action] = useFormState(upsertSubscriptionPlan, initialState);

  return (
    <form action={action} className="space-y-6 bg-white p-8 rounded-[24px] border border-slate-100 shadow-sm">
      <FormStateBanner state={state} />
      
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
          Nom de l'offre commerciale
        </label>
        <div className="relative">
          <input
            name="name"
            placeholder="Ex: NumaLex Business"
            className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 px-4 py-4 text-slate-700 font-bold focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all placeholder:text-slate-300"
            required
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        {/* PRIX */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 ml-1">
            <CreditCard size={12} className="text-blue-500" />
            Prix (FCFA/mois)
          </label>
          <input
            name="monthly_price"
            type="number"
            min={0}
            className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 px-4 py-3 text-sm font-mono font-bold text-blue-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="50000"
            required
          />
        </div>

        {/* UTILISATEURS */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 ml-1">
            <Users size={12} className="text-blue-500" />
            Limite Users
          </label>
          <input
            name="user_limit"
            type="number"
            min={1}
            className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="5"
            required
          />
        </div>

        {/* STOCKAGE */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 ml-1">
            <HardDrive size={12} className="text-blue-500" />
            Stockage (Go)
          </label>
          <input
            name="storage_gb"
            type="number"
            min={1}
            className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="20"
            required
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <SubmitButton />
      </div>
    </form>
  );
}