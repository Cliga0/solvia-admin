"use client";

import { ReactNode } from "react";
import { Shield } from "lucide-react";

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-foreground text-background">
            <Shield className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Solvia Admin</h1>
          <p className="text-sm text-muted-foreground">
            Administration Centrale
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
