"use server";

import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/utils/session";
import type { ActionState } from "@/lib/actions/types";
import { revalidatePath } from "next/cache";

// On adapte les méthodes pour inclure Moov Money (très utilisé au Niger)
function normalizeMethod(value: string) {
  const allowed = ["cash", "transfer", "airtel_money", "moov_money"];
  return allowed.includes(value) ? value : "airtel_money";
}

export async function markSubscriptionInvoicePaid(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const supabase = createClient();
    const actor = await getSessionUser();

    if (actor?.role !== "superadmin") {
      return { ok: false, message: "Accès interdit" };
    }

    const invoiceId = formData.get("invoiceId") as string;
    const method = normalizeMethod(formData.get("method") as string);
    const reference = formData.get("reference") as string;

    if (!invoiceId) return { ok: false, message: "ID de facture manquant" };

    // 1. Récupérer la facture
    const { data: invoice, error: fetchError } = await supabase
      .from("subscription_invoices")
      .select("*")
      .eq("id", invoiceId)
      .single();

    if (fetchError || !invoice) return { ok: false, message: "Facture introuvable" };

    // 2. Mettre à jour la facture en mode "Payée"
    const { error: updateError } = await supabase
      .from("subscription_invoices")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        payment_method: method,
        reference: reference || null
      })
      .eq("id", invoiceId);

    if (updateError) throw new Error("Erreur mise à jour facture: " + updateError.message);

    // 3. Enregistrer le paiement dans l'historique des paiements
    await supabase.from("subscription_payments").insert({
      cabinet_id: invoice.cabinet_id,
      invoice_id: invoice.id,
      amount: invoice.amount,
      method: method,
      reference: reference,
      status: "confirmed",
      processed_at: new Date().toISOString()
    });

    // 4. Notification & SMS (Logique simplifiée pour Supabase)
    const { data: adminProfile } = await supabase
      .from("profiles")
      .select("phone, id")
      .eq("cabinet_id", invoice.cabinet_id)
      .eq("role", "admin_cabinet")
      .maybeSingle();

    const amountFormatted = new Intl.NumberFormat("fr-FR").format(invoice.amount);
    const message = `NumaLex: Paiement SaaS confirme (${amountFormatted} FCFA). Merci pour votre confiance.`;

    // Insertion notification table
    await supabase.from("notifications").insert({
      cabinet_id: invoice.cabinet_id,
      profile_id: adminProfile?.id,
      type: "invoice",
      title: "Paiement confirmé",
      content: message
    });

    // Note: L'envoi SMS réel se ferait ici via ton service (ex: AfricasTalking ou autre)
    // if (adminProfile?.phone) await sendSms({ to: adminProfile.phone, message });

    revalidatePath("/superadmin");
    return { ok: true, message: "Paiement validé avec succès" };

  } catch (error) {
    console.error("[markPaid] - updateSubscriptionInvoice.ts:92", error);
    return { ok: false, message: "Erreur lors de la validation" };
  }
}

export async function voidSubscriptionInvoice(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const supabase = createClient();
    const actor = await getSessionUser();

    if (actor?.role !== "superadmin") return { ok: false, message: "Accès interdit" };

    const invoiceId = formData.get("invoiceId") as string;
    if (!invoiceId) return { ok: false, message: "ID manquant" };

    const { error } = await supabase
      .from("subscription_invoices")
      .update({ status: "void" })
      .eq("id", invoiceId);

    if (error) throw error;

    revalidatePath("/superadmin");
    return { ok: true, message: "Facture annulée (Void)" };
  } catch (error) {
    return { ok: false, message: "Erreur lors de l'annulation" };
  }
}