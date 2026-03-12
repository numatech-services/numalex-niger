"use client";

import { useFormState } from "react-dom";
import { createCabinet } from "@/lib/actions/createCabinet";
import type { ActionState } from "@/lib/actions/types";
import { FormStateBanner } from "./FormStateBanner";

const initialState: ActionState = { ok: true, message: "" };

export function SuperadminCreateCabinetForm() {
  const [state, action] = useFormState(createCabinet, initialState);

  return (
    <form action={action} className="space-y-4">
      <FormStateBanner state={state} />

      <div>
        <label className="text-sm font-medium text-slate-700">Nom du Cabinet</label>
        <input
          name="name"
          placeholder="Ex: Cabinet Maître Diallo"
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:ring-2 focus:ring-slate-900 outline-none"
          required
        />
        {state.fieldErrors?.name && (
          <p className="mt-1 text-xs text-red-500">{state.fieldErrors.name[0]}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-slate-700">Profession</label>
          <select
            name="profession"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 bg-white"
            required
          >
            <option value="avocat">Avocat</option>
            <option value="notaire">Notaire</option>
            <option value="commissaire_justice">Commissaire de Justice</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Ville</label>
          <input
            name="city"
            placeholder="Ex: Niamey"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Téléphone Admin</label>
        <input
          name="adminPhone"
          type="tel"
          placeholder="Ex: +227XXXXXXXX"
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
          required
        />
        {state.fieldErrors?.adminPhone && (
          <p className="mt-1 text-xs text-red-500">{state.fieldErrors.adminPhone[0]}</p>
        )}
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
      >
        Créer le cabinet
      </button>
    </form>
  );
}