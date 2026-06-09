"use client";

import { createContext, useContext } from "react";
import { type UseFormReturn, type FieldValues } from "react-hook-form";

const FormContext = createContext<UseFormReturn<FieldValues> | null>(null);

export function FormProvider<T extends FieldValues>({
  children,
  ...form
}: UseFormReturn<T> & { children: React.ReactNode }) {
  return (
    <FormContext.Provider value={form as UseFormReturn<FieldValues>}>
      {children}
    </FormContext.Provider>
  );
}

export function useFormContext<T extends FieldValues = FieldValues>(): UseFormReturn<T> {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("useFormContext must be used within a FormProvider");
  }
  return context as UseFormReturn<T>;
}

export { FormProvider as Form };
