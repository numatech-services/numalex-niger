import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = createClient();

    // 1. Vérification de la clé secrète (définie dans ton .env.local)
    const apiKey = request.headers.get("x-superadmin-key");
    if (!apiKey || apiKey !== process.env.SUPERADMIN_SETUP_KEY) {
      return NextResponse.json(
        { ok: false, message: "Accès refusé : Clé incorrecte" },
        { status: 403 }
      );
    }

    const phone = process.env.SUPERADMIN_PHONE;
    if (!phone) {
      return NextResponse.json(
        { ok: false, message: "SUPERADMIN_PHONE non défini dans les variables d'environnement" },
        { status: 400 }
      );
    }

    // 2. Vérifier ou créer le cabinet "Numatech" (ta plateforme)
    // On utilise .maybeSingle() pour ne pas planter si rien n'est trouvé
    let { data: platformCabinet } = await supabase
      .from("cabinets")
      .select("id")
      .eq("name", "Numatech")
      .maybeSingle();

    if (!platformCabinet) {
      const { data: newCabinet, error: cabError } = await supabase
        .from("cabinets")
        .insert([
          { 
            id: crypto.randomUUID(), 
            name: "Numatech", 
            slug: "numatech",
            profession: "avocat" // Valeur par défaut requise par ta contrainte
          }
        ])
        .select()
        .single();

      if (cabError) throw new Error(`Erreur création cabinet plateforme: ${cabError.message}`);
      platformCabinet = newCabinet;
    }

    // 3. Vérifier si l'utilisateur existe déjà avec ce numéro
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("phone", phone)
      .maybeSingle();

    if (!profile) {
      return NextResponse.json(
        { ok: false, message: "Utilisateur introuvable. Connectez-vous d'abord à l'application pour créer votre compte profile." },
        { status: 404 }
      );
    }

    if (profile.role === "superadmin") {
      return NextResponse.json({ ok: true, message: "Vous êtes déjà Superadmin" });
    }

    // 4. Promouvoir l'utilisateur au rang de Superadmin
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        role: "superadmin",
        cabinet_id: platformCabinet.id,
        full_name: "Super Admin NumaLex"
      })
      .eq("id", profile.id);

    if (updateError) throw new Error(`Erreur promotion: ${updateError.message}`);

    return NextResponse.json({ ok: true, message: "Félicitations ! Vous êtes maintenant Superadmin." });

  } catch (error) {
    console.error("[SEED_ERROR] - route.ts:84", error);
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Erreur inconnue"
      },
      { status: 500 }
    );
  }
}