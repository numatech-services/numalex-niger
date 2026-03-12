"use client";

import { useFormStatus, useFormState } from "react-dom";
import { verifyCabinet } from "@/lib/actions/verifyCabinet";
import type { ActionState } from "@/lib/actions/types";
import { FormStateBanner } from "./FormStateBanner";

const initialState: ActionState = { ok: true, message: "" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 transition-all"
    >
      {pending ? "Enregistrement..." : "Enregistrer la décision"}
    </button>
  );
}

export function VerifyCabinetForm({ cabinetId }: { cabinetId: string }) {
  const [state, action] = useFormState(verifyCabinet, initialState);

  return (
    <form action={action} className="space-y-3 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
      <FormStateBanner state={state} />
      
      {/* Champ caché pour transmettre l'ID du cabinet */}
      <input type="hidden" name="cabinetId" value={cabinetId} />

      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Statut de vérification
        </label>
        <select
          name="is_verified" 
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 bg-slate-50 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
        >
          <option value="false">En attente / Suspendu</option>
          <option value="true">Validé (Accès complet)</option>
        </select>
      </div>

      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Notes de conformité
        </label>
        <textarea
          name="verification_notes"
          placeholder="Ex: Documents vérifiés le 10/03..."
          rows={2}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
        />
      </div>

      <div className="flex justify-end pt-2">
        <SubmitButton />
      </div>
    </form>
  );
}