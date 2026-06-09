"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";

type AnnouncementPriority = "polite" | "assertive";

interface LiveAnnouncerContextType {
  announce: (message: string, priority?: AnnouncementPriority) => void;
}

const LiveAnnouncerContext = createContext<LiveAnnouncerContextType | null>(null);

export function useLiveAnnouncer() {
  const context = useContext(LiveAnnouncerContext);
  if (!context) {
    throw new Error("useLiveAnnouncer must be used within a LiveAnnouncerProvider");
  }
  return context;
}

interface LiveAnnouncerProviderProps {
  children: ReactNode;
}

export function LiveAnnouncerProvider({ children }: LiveAnnouncerProviderProps) {
  const [politeMessage, setPoliteMessage] = useState("");
  const [assertiveMessage, setAssertiveMessage] = useState("");

  const announce = useCallback((message: string, priority: AnnouncementPriority = "polite") => {
    if (priority === "assertive") {
      setAssertiveMessage("");
      setTimeout(() => setAssertiveMessage(message), 50);
    } else {
      setPoliteMessage("");
      setTimeout(() => setPoliteMessage(message), 50);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPoliteMessage("");
      setAssertiveMessage("");
    }, 5000);
    return () => clearTimeout(timeout);
  }, [politeMessage, assertiveMessage]);

  return (
    <LiveAnnouncerContext.Provider value={{ announce }}>
      {children}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {politeMessage}
      </div>
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {assertiveMessage}
      </div>
    </LiveAnnouncerContext.Provider>
  );
}
