import { useMutation, useQuery } from "@tanstack/react-query";
import { receiptScannerApi } from "../lib/api";
import type {
  ScanResult,
  SaveScannedItemsDto,
  SaveResult,
  ScannedItem,
  CategoryCorrection,
  LearningStats,
} from "../lib/api";

// Hook for scanning a receipt image
export function useScanReceipt() {
  return useMutation<ScanResult, Error, File>({
    mutationFn: (file: File) => receiptScannerApi.scanReceipt(file),
  });
}

// Hook for saving scanned items
export function useSaveScannedItems() {
  return useMutation<SaveResult, Error, SaveScannedItemsDto>({
    mutationFn: (data: SaveScannedItemsDto) =>
      receiptScannerApi.saveItems(data),
  });
}

// Hook for learning from corrections
export function useLearnFromCorrections() {
  return useMutation<{ savedCount: number }, Error, CategoryCorrection[]>({
    mutationFn: (corrections: CategoryCorrection[]) =>
      receiptScannerApi.learnFromCorrections(corrections),
  });
}

// Hook for getting learning stats
export function useLearningStats() {
  return useQuery<LearningStats>({
    queryKey: ["receipt-scanner", "learning-stats"],
    queryFn: () => receiptScannerApi.getLearningStats(),
  });
}

// Hook for parsing text (manual text input)
export function useParseReceiptText() {
  return useMutation<
    {
      items: ScannedItem[];
      inventoryCount: number;
      expenseCount: number;
      unknownCount: number;
    },
    Error,
    string
  >({
    mutationFn: (text: string) => receiptScannerApi.parseText(text),
  });
}
