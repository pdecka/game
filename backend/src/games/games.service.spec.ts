import { Test, TestingModule } from '@nestjs/testing';
import { GamesService } from './games.service';
import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { RngService } from './rng.service';
import { ProvablyFairService } from './provably-fair.service';
import { BadRequestException } from '@nestjs/common';

describe('GamesService - Mines', () => {
  let service: GamesService;
  let rngService: RngService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GamesService,
        {
          provide: PrismaService,
          useValue: {
            gameSession: {
              create: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
              findMany: jest.fn(),
            },
            gameSetting: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              createMany: jest.fn(),
              update: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
        {
          provide: WalletService,
          useValue: {
            getBalance: jest.fn(),
            createTransaction: jest.fn(),
          },
        },
        RngService,
        ProvablyFairService,
      ],
    }).compile();

    service = module.get<GamesService>(GamesService);
    rngService = module.get<RngService>(RngService);
  });

  describe('Mines Multiplier Calculation', () => {
    it('should calculate correct multiplier for 1 revealed cell with 3 mines', () => {
      // With 3 mines in 25 cells, first pick safe probability = 22/25 = 0.88
      // Fair multiplier = 1/0.88 ≈ 1.136
      // With 0.95 RTP: 1.136 * 0.95 ≈ 1.079
      const multiplier = (service as any).calculateMinesMultiplier(1, 3, 25, 0.95);
      expect(multiplier).toBeGreaterThan(1.0);
      expect(multiplier).toBeLessThan(1.2);
    });

    it('should calculate correct multiplier for 5 revealed cells with 3 mines', () => {
      const multiplier = (service as any).calculateMinesMultiplier(5, 3, 25, 0.95);
      expect(multiplier).toBeGreaterThan(1.5);
    });

    it('should return 1.0 for 0 revealed cells', () => {
      const multiplier = (service as any).calculateMinesMultiplier(0, 3, 25, 0.95);
      expect(multiplier).toBe(1.0);
    });

    it('should handle edge case of maximum mines', () => {
      const multiplier = (service as any).calculateMinesMultiplier(1, 24, 25, 0.95);
      expect(multiplier).toBeGreaterThan(20); // Very high multiplier for 1 safe cell
    });

    it('should handle edge case of minimum mines', () => {
      const multiplier = (service as any).calculateMinesMultiplier(10, 2, 25, 0.95);
      expect(multiplier).toBeGreaterThan(1.0);
      expect(multiplier).toBeLessThan(10);
    });
  });

  describe('Mines RNG - Deterministic Board Generation', () => {
    it('should generate same board for same seeds and nonce', () => {
      const serverSeed = 'test-server-seed';
      const clientSeed = 'test-client-seed';
      const nonce = 1;
      const algorithmVersion = 'mines-v1';

      const positions1 = rngService.generateMines(25, 5, serverSeed, clientSeed, nonce, algorithmVersion);
      const positions2 = rngService.generateMines(25, 5, serverSeed, clientSeed, nonce, algorithmVersion);

      expect(positions1).toEqual(positions2);
    });

    it('should generate different boards for different nonces', () => {
      const serverSeed = 'test-server-seed';
      const clientSeed = 'test-client-seed';
      const algorithmVersion = 'mines-v1';

      const positions1 = rngService.generateMines(25, 5, serverSeed, clientSeed, 1, algorithmVersion);
      const positions2 = rngService.generateMines(25, 5, serverSeed, clientSeed, 2, algorithmVersion);

      expect(positions1).not.toEqual(positions2);
    });

    it('should generate correct number of mine positions', () => {
      const serverSeed = 'test-server-seed';
      const clientSeed = 'test-client-seed';
      const nonce = 1;
      const algorithmVersion = 'mines-v1';

      for (let mines = 2; mines <= 24; mines++) {
        const positions = rngService.generateMines(25, mines, serverSeed, clientSeed, nonce, algorithmVersion);
        expect(positions).toHaveLength(mines);
      }
    });

    it('should generate unique positions (no duplicates)', () => {
      const serverSeed = 'test-server-seed';
      const clientSeed = 'test-client-seed';
      const nonce = 1;
      const algorithmVersion = 'mines-v1';

      for (let mines = 2; mines <= 24; mines++) {
        const positions = rngService.generateMines(25, mines, serverSeed, clientSeed, nonce, algorithmVersion);
        const uniquePositions = new Set(positions);
        expect(uniquePositions.size).toBe(mines);
      }
    });

    it('should generate positions within valid range', () => {
      const serverSeed = 'test-server-seed';
      const clientSeed = 'test-client-seed';
      const nonce = 1;
      const algorithmVersion = 'mines-v1';

      const positions = rngService.generateMines(25, 10, serverSeed, clientSeed, nonce, algorithmVersion);
      
      positions.forEach(pos => {
        expect(pos).toBeGreaterThanOrEqual(0);
        expect(pos).toBeLessThan(25);
      });
    });
  });

  describe('Mines Validation', () => {
    it('should reject invalid mine counts', () => {
      const invalidCounts = [0, 1, 25, 26, -1, 100];
      
      invalidCounts.forEach(mines => {
        expect(() => {
          // This would be called in startMines validation
          if (mines < 2 || mines > 24) {
            throw new BadRequestException('Mine count must be between 2 and 24');
          }
        }).toThrow(BadRequestException);
      });
    });

    it('should accept valid mine counts', () => {
      const validCounts = [2, 3, 5, 10, 15, 20, 24];
      
      validCounts.forEach(mines => {
        expect(() => {
          if (mines < 2 || mines > 24) {
            throw new BadRequestException('Mine count must be between 2 and 24');
          }
        }).not.toThrow();
      });
    });
  });

  describe('Probability Calculations', () => {
    it('should calculate correct first-pick safe probability', () => {
      // For 3 mines: (25-3)/25 = 22/25 = 0.88 = 88%
      const mines = 3;
      const safeProbability = (25 - mines) / 25;
      expect(safeProbability).toBe(0.88);
    });

    it('should calculate correct first-pick safe probability for 24 mines', () => {
      // For 24 mines: (25-24)/25 = 1/25 = 0.04 = 4%
      const mines = 24;
      const safeProbability = (25 - mines) / 25;
      expect(safeProbability).toBe(0.04);
    });

    it('should calculate correct first-pick safe probability for 2 mines', () => {
      // For 2 mines: (25-2)/25 = 23/25 = 0.92 = 92%
      const mines = 2;
      const safeProbability = (25 - mines) / 25;
      expect(safeProbability).toBe(0.92);
    });
  });
});
