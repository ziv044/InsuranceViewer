"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { AppState, FileParseResult, ParsedINP, ParsedKGM, ParsedPNN, ParsedHarHabituach } from "./types";
import { parseFile } from "./parsers";

interface AppContextType {
  state: AppState;
  addFiles: (files: File[]) => Promise<void>;
  clearAll: () => void;
  isLoading: boolean;
}

const initialState: AppState = {
  files: [],
  inpFiles: [],
  kgmFiles: [],
  pnnFiles: [],
  harHabituachFiles: [],
};

const AppContext = createContext<AppContextType>({
  state: initialState,
  addFiles: async () => {},
  clearAll: () => {},
  isLoading: false,
});

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);
  const [isLoading, setIsLoading] = useState(false);

  const addFiles = useCallback(async (files: File[]) => {
    setIsLoading(true);
    const results: FileParseResult[] = [];

    for (const file of files) {
      try {
        const data = await parseFile(file);
        results.push({ success: true, data, fileName: file.name });
      } catch (err) {
        results.push({
          success: false,
          error: err instanceof Error ? err.message : "שגיאה בקריאת הקובץ",
          fileName: file.name,
        });
      }
    }

    setState((prev) => {
      const allFiles = [...prev.files, ...results];
      const successData = results.filter((r) => r.success && r.data).map((r) => r.data!);

      return {
        files: allFiles,
        inpFiles: [...prev.inpFiles, ...successData.filter((d): d is ParsedINP => d.type === "INP")],
        kgmFiles: [...prev.kgmFiles, ...successData.filter((d): d is ParsedKGM => d.type === "KGM")],
        pnnFiles: [...prev.pnnFiles, ...successData.filter((d): d is ParsedPNN => d.type === "PNN")],
        harHabituachFiles: [...prev.harHabituachFiles, ...successData.filter((d): d is ParsedHarHabituach => d.type === "HAR_HABITUACH")],
      };
    });

    setIsLoading(false);
  }, []);

  const clearAll = useCallback(() => {
    setState(initialState);
  }, []);

  return (
    <AppContext.Provider value={{ state, addFiles, clearAll, isLoading }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
