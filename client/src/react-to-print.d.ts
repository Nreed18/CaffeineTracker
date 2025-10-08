declare module 'react-to-print' {
  import { ReactInstance } from 'react';
  
  export interface UseReactToPrintOptions {
    content: () => ReactInstance | null;
    documentTitle?: string;
    onAfterPrint?: () => void;
    onBeforePrint?: () => void;
    onPrintError?: (errorLocation: string, error: Error) => void;
    removeAfterPrint?: boolean;
  }
  
  export function useReactToPrint(options: UseReactToPrintOptions): () => void;
}
