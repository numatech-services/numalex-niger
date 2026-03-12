// lib/actions/types.ts
export interface ActionState {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string[]>;
}