"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import ReduxProvider from "../providers/reduxProvider";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ReduxProvider>
      <SessionProvider>
        {children}
      </SessionProvider>
    </ReduxProvider>
  );
}
