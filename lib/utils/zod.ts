import { ZodError } from "zod";

/**
 * Transforme une ZodError en un objet simple utilisable par les formulaires.
 * Exemple : { name: ["Trop court"], adminPhone: ["Invalide"] }
 */
export function toFieldErrors(error: ZodError) {
  return error.flatten().fieldErrors as Record<string, string[]>;
}