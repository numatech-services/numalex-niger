import { z } from "zod";

export const cabinetSchema = z.object({
  name: z
    .string()
    .min(2, "Le nom du cabinet doit contenir au moins 2 caractères")
    .max(100),
  adminPhone: z
    .string()
    .min(8, "Le numéro de téléphone n'est pas valide")
    .regex(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/, "Format de téléphone invalide"),
  profession: z.enum(["avocat", "notaire", "commissaire_justice"], {
    errorMap: () => ({ message: "Veuillez choisir une profession valide" }),
  }),
  city: z.string().optional(),
  address: z.string().optional(),
  type: z.string().default("standard"),
});

export type CabinetSchema = z.infer<typeof cabinetSchema>;