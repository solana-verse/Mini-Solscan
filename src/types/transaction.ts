import type { ParsedTransactionWithMeta } from "@solana/web3.js";

export interface TransactionDetails {
  signature: string;
  status: "Success" | "Failed";
  timestamp: string;
  signer: string;
  slot: number;
  fee: number;
  instructions: InstructionDetails[];
}

export interface InstructionDetails {
  programId: string;
  programName: string;
  type: string;
  data?: any;
}

export interface TransactionState {
  transaction: TransactionDetails | null;
  loading: boolean;
  error: string | null;
}

export type SolanaTransaction = ParsedTransactionWithMeta;
