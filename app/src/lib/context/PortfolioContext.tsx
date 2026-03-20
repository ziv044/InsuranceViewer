"use client";

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
} from "react";
import type {
  AppState,
  ParsedFile,
  ParsedINP,
  ParsedKGM,
  ParsedPNN,
  ParsedHarHabituach,
  FileParseResult,
} from "@/lib/types";
import { parseFile } from "@/lib/parsers";

// Action types
export type PortfolioAction =
  | { type: "PARSE_START" }
  | { type: "PARSE_SUCCESS"; payload: FileParseResult[] }
  | { type: "PARSE_ERROR"; payload: string }
  | { type: "ADD_FILES"; payload: FileParseResult[] }
  | { type: "RESET" };

interface PortfolioState extends AppState {
  isLoading: boolean;
  error: string | null;
}

const initialState: PortfolioState = {
  files: [],
  inpFiles: [],
  kgmFiles: [],
  pnnFiles: [],
  harHabituachFiles: [],
  isLoading: false,
  error: null,
};

function mergeResults(
  prev: PortfolioState,
  results: FileParseResult[],
): Partial<PortfolioState> {
  const successData = results
    .filter((r) => r.success && r.data)
    .map((r) => r.data!);

  return {
    files: [...prev.files, ...results],
    inpFiles: [
      ...prev.inpFiles,
      ...successData.filter((d): d is ParsedINP => d.type === "INP"),
    ],
    kgmFiles: [
      ...prev.kgmFiles,
      ...successData.filter((d): d is ParsedKGM => d.type === "KGM"),
    ],
    pnnFiles: [
      ...prev.pnnFiles,
      ...successData.filter((d): d is ParsedPNN => d.type === "PNN"),
    ],
    harHabituachFiles: [
      ...prev.harHabituachFiles,
      ...successData.filter(
        (d): d is ParsedHarHabituach => d.type === "HAR_HABITUACH",
      ),
    ],
  };
}

function portfolioReducer(
  state: PortfolioState,
  action: PortfolioAction,
): PortfolioState {
  switch (action.type) {
    case "PARSE_START":
      return { ...state, isLoading: true, error: null };
    case "PARSE_SUCCESS":
      return {
        ...state,
        ...mergeResults(state, action.payload),
        isLoading: false,
        error: null,
      };
    case "PARSE_ERROR":
      return { ...state, isLoading: false, error: action.payload };
    case "ADD_FILES":
      return {
        ...state,
        ...mergeResults(state, action.payload),
      };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

interface PortfolioContextType {
  state: PortfolioState;
  dispatch: React.Dispatch<PortfolioAction>;
  addFiles: (files: File[]) => Promise<void>;
  clearAll: () => void;
  isLoading: boolean;
}

const PortfolioContext = createContext<PortfolioContextType>({
  state: initialState,
  dispatch: () => {},
  addFiles: async () => {},
  clearAll: () => {},
  isLoading: false,
});

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(portfolioReducer, initialState);

  const addFiles = useCallback(
    async (files: File[]) => {
      dispatch({ type: "PARSE_START" });
      const results: FileParseResult[] = [];

      for (const file of files) {
        try {
          const data = await parseFile(file);
          results.push({ success: true, data, fileName: file.name });
        } catch (err) {
          results.push({
            success: false,
            error:
              err instanceof Error ? err.message : "שגיאה בקריאת הקובץ",
            fileName: file.name,
          });
        }
      }

      const hasErrors = results.some((r) => !r.success);
      if (hasErrors && results.every((r) => !r.success)) {
        dispatch({ type: "PARSE_ERROR", payload: "שגיאה בעיבוד כל הקבצים" });
      } else {
        dispatch({ type: "PARSE_SUCCESS", payload: results });
      }
    },
    [],
  );

  const clearAll = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  return (
    <PortfolioContext.Provider
      value={{ state, dispatch, addFiles, clearAll, isLoading: state.isLoading }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolioContext() {
  return useContext(PortfolioContext);
}

export default PortfolioContext;
