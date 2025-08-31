import { Connection, clusterApiUrl } from "@solana/web3.js";
import type {
  TransactionDetails,
  InstructionDetails,
  SolanaTransaction,
} from "../types/transaction";
import type { NetworkConfig } from "../contexts/NetworkContext";

// Known program mappings for better display
const PROGRAM_NAMES: Record<string, string> = {
  "11111111111111111111111111111111": "System Program",
  TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA: "Token Program",
  ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL: "Associated Token Program",
  So1endDq2YkqhipRh3WViPa8hdiSpxWy6z3Z6tMCpAo: "Solend Program",
  srmqPiKhxpFqkQNFNHqNhJBNMT3CjPgE1nD2CdgF7q5: "Serum DEX",
  ComputeBudget111111111111111111111111111111: "Compute Budget Program",
};

export class SolanaService {
  /**
   * Creates a connection based on the network configuration
   */
  static createConnection(network: NetworkConfig): Connection {
    if (network.type === "custom") {
      return new Connection(network.url, "confirmed");
    }

    // Use clusterApiUrl for standard networks
    const clusterName =
      network.type === "mainnet-beta"
        ? "mainnet-beta"
        : network.type === "testnet"
        ? "testnet"
        : "devnet";
    return new Connection(clusterApiUrl(clusterName), "confirmed");
  }

  /**
   * Fetches and parses a transaction by signature
   */
  static async getTransaction(
    signature: string,
    network: NetworkConfig
  ): Promise<TransactionDetails> {
    try {
      // Validate signature format
      if (!signature || signature.length < 80 || signature.length > 90) {
        throw new Error("Invalid transaction signature format");
      }

      // Create connection for the specified network
      const connection = this.createConnection(network);

      // Fetch transaction from Solana
      const transactionResult = await connection.getParsedTransaction(
        signature,
        { maxSupportedTransactionVersion: 0 }
      );

      if (!transactionResult) {
        throw new Error("Transaction not found on the selected network");
      }

      const transaction: SolanaTransaction = transactionResult;

      // Parse transaction details
      return this.parseTransaction(signature, transaction);
    } catch (error) {
      console.error("Error fetching transaction:", error);

      if (error instanceof Error) {
        throw error;
      }

      throw new Error(
        "Failed to fetch transaction. Please check the signature and try again."
      );
    }
  }

  /**
   * Parses raw transaction data into our TransactionDetails format
   */
  private static parseTransaction(
    signature: string,
    transaction: SolanaTransaction
  ): TransactionDetails {
    const meta = transaction.meta;
    const message = transaction.transaction.message;

    // Determine transaction status
    const status: "Success" | "Failed" = meta?.err ? "Failed" : "Success";

    // Get timestamp
    const timestamp = transaction.blockTime
      ? new Date(transaction.blockTime * 1000).toLocaleString()
      : "Unknown";

    // Get the main signer (fee payer)
    const signer = message.accountKeys[0]?.pubkey?.toString() || "Unknown";

    // Get transaction fee
    const fee = meta?.fee || 0;

    // Get slot
    const slot = transaction.slot;

    // Parse instructions
    const instructions = this.parseInstructions(transaction);

    return {
      signature,
      status,
      timestamp,
      signer,
      slot,
      fee,
      instructions,
    };
  }

  /**
   * Parses transaction instructions
   */
  private static parseInstructions(
    transaction: SolanaTransaction
  ): InstructionDetails[] {
    const instructions: InstructionDetails[] = [];

    // Parse main instructions
    transaction.transaction.message.instructions.forEach(
      (instruction, index) => {
        let programId = "Unknown";

        // Handle different instruction types
        if (
          "programIdIndex" in instruction &&
          typeof instruction.programIdIndex === "number"
        ) {
          programId =
            transaction.transaction.message.accountKeys[
              instruction.programIdIndex
            ]?.pubkey?.toString() || "Unknown";
        } else if ("programId" in instruction) {
          programId = instruction.programId.toString();
        }

        const programName = PROGRAM_NAMES[programId] || "Unknown Program";

        instructions.push({
          programId,
          programName,
          type: `Instruction #${index + 1}`,
          data: instruction,
        });
      }
    );

    // Parse inner instructions if they exist
    if (transaction.meta?.innerInstructions) {
      transaction.meta.innerInstructions.forEach(
        (innerInstGroup, groupIndex) => {
          innerInstGroup.instructions.forEach((innerInst, instIndex) => {
            let programId = "Unknown";

            // Handle different instruction types
            if (
              "programIdIndex" in innerInst &&
              typeof innerInst.programIdIndex === "number"
            ) {
              programId =
                transaction.transaction.message.accountKeys[
                  innerInst.programIdIndex
                ]?.pubkey?.toString() || "Unknown";
            } else if ("programId" in innerInst) {
              programId = innerInst.programId.toString();
            }

            const programName = PROGRAM_NAMES[programId] || "Unknown Program";

            instructions.push({
              programId,
              programName,
              type: `Inner Instruction #${groupIndex + 1}.${instIndex + 1}`,
              data: innerInst,
            });
          });
        }
      );
    }

    return instructions;
  }

  /**
   * Truncates long strings for display
   */
  static truncateAddress(address: string, chars: number = 8): string {
    if (address.length <= chars * 2) return address;
    return `${address.slice(0, chars)}...${address.slice(-chars)}`;
  }

  /**
   * Formats SOL amounts
   */
  static formatSol(lamports: number): string {
    return (lamports / 1e9).toFixed(9);
  }
}
