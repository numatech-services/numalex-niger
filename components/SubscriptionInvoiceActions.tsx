"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { ActionState } from "@/lib/actions/types";
import {
  markSubscriptionInvoicePaid,
  voidSubscriptionInvoice
} from "@/lib/actions/updateSubscriptionInvoice";
import { FormStateBanner } from "./FormStateBanner";

const initialState: ActionState = { ok: true, message: "" };

function SubmitButton({ label, variant = "primary" }: { label: string, variant?: "primary" | "outline" }) {
  const { pending } = useFormStatus();
  const baseStyles = "w-full rounded-lg px-3 py-2 text-[10px] font-bold uppercase tracking-wider transition-all disabled:opacity-50";
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-800",
    outline: "border border-slate-300 text-slate-600 hover:bg-slate-50"
  };

  return (
    <button type="submit" disabled={pending} className={`${baseStyles} ${variants[variant]}`}>
      {pending ? "Chargement..." : label}
    </button>
  );
}

export function SubscriptionInvoiceActions({ invoiceId }: { invoiceId: string }) {
  const [paidState, paidAction] = useFormState(markSubscriptionInvoicePaid, initialState);
  const [voidState, voidAction] = useFormState(voidSubscriptionInvoice, initialState);

  return (
    <div className="flex flex-col gap-4 min-w-[140px]">
      {/* SECTION PAIEMENT */}
      <form action={paidAction} className="space-y-2 border-b border-slate-100 pb-3">
        <FormStateBanner state={paidState} />
        <input type="hidden" name="invoiceId" value={invoiceId} />
        
        <div className="space-y-1">
          <select
            name="method"
            required
            className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-[11px] focus:ring-1 focus:ring-slate-900 outline-none"
          >
            <option value="airtel_money">Airtel Money</option>
            <option value="moov_money">Moov Money</option>
            <option value="cash">Espèces (Cash)</option>
            <option value="transfer">Virement Bancaire</option>
          </select>
          
          <input
            name="reference"
            placeholder="N° Transaction / Ref"
            className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-[11px] focus:ring-1 focus:ring-slate-900 outline-none"
          />
        </div>
        
        <SubmitButton label="Valider Paiement" />
      </form>

      {/* SECTION ANNULATION */}
      <form action={voidAction}>
        <input type="hidden" name="invoiceId" value={invoiceId} />
        <FormStateBanner state={voidState} />
        <SubmitButton label="Annuler Facture" variant="outline" />
      </form>
    </div>
  );
}