import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class RngService {
  generateDiceRoll(serverSeed: string, clientSeed: string, nonce: number): number {
    const hash = this.generateHash(serverSeed, clientSeed, nonce);
    return this.hashToFloat(hash) * 100; // 0-100
  }

  generateCrashPoint(serverSeed: string, clientSeed: string, nonce: number): number {
    const hash = this.generateHash(serverSeed, clientSeed, nonce);
    const float = this.hashToFloat(hash);
    
    // Crash point calculation (simplified)
    // Higher float = higher crash point
    const e = 1000000000000;
    const h = Math.floor((float * (e - 1)) / 1);
    return Math.max(1.00, (100 * e - h) / (e - h) / 100);
  }

  /**
   * Generate mine positions using deterministic HMAC-SHA256 and Fisher-Yates shuffle.
   * This ensures provable fairness - the same seeds + nonce always produce the same board.
   * Algorithm version: mines-v1
   */
  generateMines(gridSize: number, mines: number, serverSeed: string, clientSeed: string, nonce: number, algorithmVersion: string = 'mines-v1'): number[] {
    // Create all board positions (0 to gridSize-1)
    const positions = Array.from({ length: gridSize }, (_, i) => i);
    
    // Deterministic Fisher-Yates shuffle using HMAC-SHA256
    for (let i = positions.length - 1; i > 0; i--) {
      // Generate deterministic random number using HMAC-SHA256
      const randomValue = this.generateHmacInt(serverSeed, clientSeed, nonce, algorithmVersion, i, 0, i);
      const j = randomValue;
      
      // Swap positions[i] and positions[j]
      const temp = positions[i];
      positions[i] = positions[j];
      positions[j] = temp;
    }
    
    // First 'mines' positions are mines, rest are safe
    return positions.slice(0, mines);
  }

  /**
   * Generate a deterministic integer using HMAC-SHA256 for provable fairness.
   * This is cryptographically stronger than simple hash concatenation.
   */
  private generateHmacInt(
    serverSeed: string,
    clientSeed: string,
    nonce: number,
    algorithmVersion: string,
    additionalContext: number,
    min: number,
    max: number
  ): number {
    // HMAC-SHA256 for cryptographic commitment
    const hmac = crypto.createHmac('sha256', serverSeed);
    const data = `${algorithmVersion}:${clientSeed}:${nonce}:${additionalContext}`;
    hmac.update(data);
    const hash = hmac.digest('hex');
    
    // Convert hash to integer in range [min, max]
    const float = this.hashToFloat(hash);
    const span = max - min + 1;
    return min + Math.floor(float * span);
  }

  generatePlinkoPath(
    rows: number,
    serverSeed: string,
    clientSeed: string,
    nonce: number,
  ): { path: number[]; slot: number } {
    const hash = this.generateHash(serverSeed, clientSeed, nonce);
    const path: number[] = [];
    let rights = 0;

    for (let i = 0; i < rows; i++) {
      const byte = parseInt(hash.substring((i % 32) * 2, (i % 32) * 2 + 2), 16);
      const step = byte % 2; // 0 = left, 1 = right
      path.push(step);
      rights += step;
    }

    // Final slot index is number of rights (0..rows)
    return { path, slot: rights };
  }

  generateCoinflip(serverSeed: string, clientSeed: string, nonce: number): 'heads' | 'tails' {
    const hash = this.generateHash(serverSeed, clientSeed, nonce);
    const float = this.hashToFloat(hash);
    return float < 0.5 ? 'heads' : 'tails';
  }

  generateLimboMultiplier(serverSeed: string, clientSeed: string, nonce: number, rtp: number): number {
    const hash = this.generateHash(serverSeed, clientSeed, nonce);
    // Avoid division by zero; clamp to small epsilon.
    const float = Math.max(0.0000001, this.hashToFloat(hash));
    const raw = (1 / float) * (rtp || 0.95);
    // Keep within sane bounds.
    return Math.max(1.0, Math.min(raw, 10000));
  }

  generateInt(serverSeed: string, clientSeed: string, nonce: number, min: number, max: number): number {
    const hash = this.generateHash(serverSeed, clientSeed, nonce);
    const float = this.hashToFloat(hash);
    const span = max - min + 1;
    return min + Math.floor(float * span);
  }

  generateRouletteNumber(serverSeed: string, clientSeed: string, nonce: number): number {
    return this.generateInt(serverSeed, clientSeed, nonce, 0, 36);
  }

  generateWheelIndex(serverSeed: string, clientSeed: string, nonce: number, segments: number): number {
    return this.generateInt(serverSeed, clientSeed, nonce, 0, Math.max(0, segments - 1));
  }

  generateSlotsGrid(
    serverSeed: string,
    clientSeed: string,
    nonce: number,
    reels: number = 5,
    rows: number = 3,
    symbols: string[] = ['A', 'K', 'Q', 'J', '10', '9', '★'],
  ): string[][] {
    const grid: string[][] = Array.from({ length: rows }, () => Array.from({ length: reels }, () => 'A'));
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < reels; c++) {
        const idx = this.generateInt(serverSeed, clientSeed, nonce + r * 100 + c, 0, symbols.length - 1);
        grid[r][c] = symbols[idx];
      }
    }
    return grid;
  }

  generateShuffledDeck(serverSeed: string, clientSeed: string, nonce: number): string[] {
    const deck: string[] = [];
    const suits = ['S', 'H', 'D', 'C'];
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    for (const s of suits) {
      for (const r of ranks) deck.push(`${r}${s}`);
    }

    // Deterministic Fisher–Yates using seeded ints.
    const arr = deck.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = this.generateInt(serverSeed, clientSeed, nonce + (arr.length - i), 0, i);
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  sampleUniqueNumbers(
    serverSeed: string,
    clientSeed: string,
    nonce: number,
    count: number,
    min: number,
    max: number,
  ): number[] {
    const set = new Set<number>();
    let i = 0;
    while (set.size < count) {
      const n = this.generateInt(serverSeed, clientSeed, nonce + i, min, max);
      set.add(n);
      i += 1;
    }
    return Array.from(set);
  }

  private generateHash(serverSeed: string, clientSeed: string, nonce: number): string {
    const data = `${serverSeed}:${clientSeed}:${nonce}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  private hashToFloat(hash: string): number {
    // Take first 8 characters and convert to float between 0 and 1
    const substring = hash.substring(0, 8);
    const int = parseInt(substring, 16);
    return int / 0xffffffff;
  }
}
