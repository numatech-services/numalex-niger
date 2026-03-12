"use client";

import type { ActionState } from "@/lib/actions/types";

interface FormStateBannerProps {
  state: ActionState;
}

export function FormStateBanner({ state }: FormStateBannerProps) {
  // On n'affiche rien s'il n'y a pas de message
  if (!state.message) return null;

  return (
    <div
      className={`rounded-lg p-4 text-sm font-medium ${
        state.ok
          ? "bg-green-50 text-green-700 border border-green-200"
          : "bg-red-50 text-red-700 border border-red-200"
      }`}
    >
      <div className="flex items-center gap-2">
        {state.ok ? (
          // Icône de succès (Check)
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          // Icône d'erreur (X)
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
        <span>{state.message}</span>
      </div>
    </div>
  );
}