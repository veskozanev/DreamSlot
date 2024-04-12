import machineConfig from '../config/DreamSlotConfig.js';

type LineResult = { line: number[]; payout: number };

interface Config {
    reels: number[][];
    rowsCount: number;
    lines: number[][];
    symbols: { [key: number]: number[] };
}

export class SlotMachine {
    private reel: Reel;
    private payoutCalculator: PayoutCalculator;

    constructor(private config: Config = machineConfig) {
        this.reel = new Reel(config);
        this.payoutCalculator = new PayoutCalculator(config);
    }

    /**
     * Initiates a spin on the slot machine, calculates results and prints them.
     * @returns An object containing the generated screen, line results, and total winnings.
     */
    public spin() {
        const screen = this.reel.generateScreen();
        const lineResults = this.payoutCalculator.calculateLineResults(screen);
        Logger.printResults(screen, lineResults);
        return {
            screen,
            lineResults,
            totalWin: lineResults.reduce((acc, curr) => acc + curr.payout, 0),
        };
    }
}

class Reel {
    constructor(private config: Config) {}

    /**
     * Generates a screen for a slot machine spin.
     * @returns A 2D array representing the symbols shown on the slot machine screen.
     */
    generateScreen(): number[][] {
        const { reels, rowsCount } = this.config;
        // Generate a random start position for each reel to simulate spinning
        const startPositions = reels.map(reel => Math.floor(Math.random() * reel.length));
        // Construct the screen, simulating the circular nature of reels
        const screen = Array.from({ length: rowsCount }, (_, rowIndex) =>
            reels.map((reel, reelIndex) => reel[(startPositions[reelIndex] + rowIndex) % reel.length])
        );

        Logger.logSpinResults(startPositions);
        return screen;
    }
}

class PayoutCalculator {
    private payoutTable: { [key: number]: { [key: number]: number } } = {};

    constructor(private config: Config) {
        this.initializePayoutTable();
    }

    /**
     * Initializes the payout table based on the slot machine's symbol configuration.
     */
    private initializePayoutTable(): void {
        // Populate payout table for quick lookup during payout calculation
        for (const symbol in this.config.symbols) {
            this.payoutTable[symbol] = {};
            const payouts = this.config.symbols[symbol];
            for (let count = 3; count <= payouts.length; count++) {
                this.payoutTable[symbol][count] = payouts[count - 1];
            }
        }
    }

    /**
     * Calculates payout for all lines after a spin.
     * @param screen The current screen of the slot machine after a spin.
     * @returns An array of results for each line, including the symbols and their respective payout.
     */
    calculateLineResults(screen: number[][]): LineResult[] {
        return this.config.lines.map((line, index) => {
            const symbolsOnLine = line.map((rowIndex, reelIndex) => screen[rowIndex][reelIndex]);
            const payout = this.calculatePayout(symbolsOnLine);
            return { line: symbolsOnLine, payout };
        });
    }

    /**
     * Calculates the payout based on the symbols lined up on the slot machine.
     * @param symbols An array of symbols on one line of the slot machine.
     * @returns The payout value for the given line of symbols.
     */
    private calculatePayout(symbols: number[]): number {
        let sameSymbolCount = 1;
        let currentSymbol = symbols[0];

        for (let i = 1; i < symbols.length; i++) {
            if (symbols[i] === currentSymbol) {
                sameSymbolCount++;
            } else {
                break;
            }
        }

        return this.payoutTable[currentSymbol]?.[sameSymbolCount] || 0;
    }
}

class Logger {
    /**
     * Logs the starting positions of reels after a spin.
     * @param startPositions Array of start positions for each reel.
     */
    static logSpinResults(startPositions: number[]) {
        console.log("----------Spin result----------");
        console.log("Reel start positions:", startPositions.join(' '));
    }

    /**
     * Prints the results of a spin to the console.
     * @param screen The screen output of the slot machine spin.
     * @param lineResults Results of each line including payout.
     */
    static printResults(screen: number[][], lineResults: LineResult[]): void {
        screen.forEach((row, index) => {
            console.log(`Row ${index + 1}: `, row.join(' '));
        });
        lineResults.forEach((result, index) => {
            console.log(`Line ${index + 1}: `, result.line.join(' '), `| Payout: ${result.payout}`);
        });
    }
}
