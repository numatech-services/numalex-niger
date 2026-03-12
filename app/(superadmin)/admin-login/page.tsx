"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2 } from "lucide-react"; // Assure-toi d'avoir lucide-react installé

export default function SuperAdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Identifiants incorrects. Veuillez réessayer.");
      setLoading(false);
    } else {
      setIsSuccess(true);
      setLoading(false);

      // Petite pause pour montrer le message de succès (2 secondes ici, tu peux ajuster)
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      router.push("/superadmin");
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
      <div className="w-full max-w-md px-4">
        <form 
          onSubmit={handleLogin} 
          className="bg-white p-10 rounded-[24px] shadow-xl border border-slate-100 transition-all"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center mb-4 shadow-lg">
              <span className="text-white font-black text-xl">N</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">NumaLex Admin</h1>
            <p className="text-slate-500 text-sm mt-1 text-center">
              Gestion de l'écosystème juridique au Niger
            </p>
          </div>

          {/* État de Succès */}
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-6 animate-in fade-in zoom-in duration-300">
              <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
              <p className="text-green-600 font-bold text-lg">Connexion réussie !</p>
              <p className="text-slate-400 text-sm">Préparation de votre dashboard...</p>
            </div>
          ) : (
            <div className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm font-medium animate-in slide-in-from-top-2">
                  {error}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase ml-1">Email</label>
                <input
                  type="email"
                  placeholder="admin@numatechservices.net"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all text-slate-900"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase ml-1">Mot de passe</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all text-slate-900"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button 
                disabled={loading}
                className="w-full bg-slate-900 text-white p-4 rounded-xl font-bold hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200 mt-4 disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Vérification...
                  </>
                ) : (
                  "Accéder à l'administration"
                )}
              </button>
            </div>
          )}
          
          <div className="mt-8 text-center">
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
              Propulsé par Numatech Services
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}