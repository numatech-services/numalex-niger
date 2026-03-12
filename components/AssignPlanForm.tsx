"use client";

import { useFormStatus, useFormState } from "react-dom";
import type { ActionState } from "@/lib/actions/types";
import { assignPlan } from "@/lib/actions/assignPlan";
import { FormStateBanner } from "./FormStateBanner";
import { CheckCircle2, ChevronRight, Zap } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-white hover:bg-blue-600 disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-slate-200"
    >
      {pending ? (
        "Activation..."
      ) : (
        <>
          Assigner <ChevronRight size={14} />
        </>
      )}
    </button>
  );
}

export function AssignPlanForm({
  cabinetId,
  plans
}: {
  cabinetId: string;
  plans: Array<{ id: string; name: string }>;
}) {
  const [state, action] = useFormState(assignPlan, { ok: true, message: "" });

  return (
    <form 
      action={action} 
      className="group mt-4 space-y-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-5 transition-all hover:border-blue-300 hover:bg-white"
    >
      {/* Affichage des messages d'erreur ou de succès */}
      <FormStateBanner state={state as ActionState} />
      
      <input type="hidden" name="cabinetId" value={cabinetId} />
      
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-1">
          <Zap size={12} className="text-blue-500" />
          Forfait NumaLex
        </label>
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <select
              name="planId"
              required
              defaultValue=""
              className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-600 transition-all cursor-pointer"
            >
              <option value="" disabled>Choisir un forfait...</option>
              {plans?.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
               <ChevronRight size={14} className="rotate-90" />
            </div>
          </div>
          
          <SubmitButton />
        </div>
      </div>

      {state?.ok && state.message && (
        <div className="flex items-center gap-2 text-[10px] font-bold text-green-600 animate-in fade-in slide-in-from-top-1 px-1">
          <CheckCircle2 size={12} />
          {state.message}
        </div>
      )}
    </form>
  );
}