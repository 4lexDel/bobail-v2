// Interface of the game to implement

import { Cell, Player } from "../Bobail/BobailGame";

// <T> game position
export interface GameStrategy {
    evaluateState(state: Cell[][], player: Player): number;
    generateChildren(state: Cell[][], player: Player): Cell[][][];
    isGameOver(state: Cell[][]): boolean;
    getHash(state: Cell[][], player: Player): string;
}

// Class implementing the MinMax algorithm with alpha-beta pruning and transposition table
// <T> game position
export default class MinMaxAlgorithm {
    private transpositionTable: Map<string, number> = new Map();

    constructor(
        private strategy: GameStrategy,
        private maxDepth: number
    ) { }

    /**
     * Search the best move from a position
     */
    public findBestMove(state: Cell[][], player: Player): Cell[][] | null {
        console.log("findBestMove");
        
        let bestEval = player === 1 ? -Infinity : Infinity;
        let bestMove: Cell[][] | null = null;
        const children = this.strategy.generateChildren(state, player);

        for (const child of children) {
            const evalChild = this.minimax(child, this.maxDepth - 1, -Infinity, Infinity, player === 1 ? 2 : 1);
            
            // Make the algorithm more unpredictable
            const randomChoice = Math.random() < 0.5;
            
            let condition = randomChoice ? evalChild <= bestEval : evalChild < bestEval;
            if(player === 1) condition = randomChoice ? evalChild >= bestEval : evalChild > bestEval;

            if (condition) {
                bestEval = evalChild;
                bestMove = child;
            }
        }
        console.log("BEST EVAL", bestEval);
        
        return bestMove;
    }

    /**
     * MinMax algorithm with alpha-beta pruning.
     * @param state Current position
     * @param depth Remaining search depth
     * @param alpha Lower terminal for pruning
     * @param beta Upper terminal for pruning
     * @param player player (1 max ; 2 min)
     */
    private minimax(state: Cell[][], depth: number, alpha: number, beta: number, player: Player): number {
        const hash = this.strategy.getHash(state, player);
        if (this.transpositionTable.has(hash)) {           
            return this.transpositionTable.get(hash)!;
        }

        // Stop condition
        if (depth === 0 || this.strategy.isGameOver(state)) {
            const evalValue = this.strategy.evaluateState(state, player);
            this.transpositionTable.set(hash, evalValue);
            return evalValue;
        }

        let value: number;
        if (player === 1) {
            value = -Infinity;
            for (const child of this.strategy.generateChildren(state, 2)) {
                const childEval = this.minimax(child, depth - 1, alpha, beta, 2);
                value = Math.max(value, childEval);
                alpha = Math.max(alpha, value);
                if (beta <= alpha) break; // Prunning
            }
        } else {
            value = Infinity;
            for (const child of this.strategy.generateChildren(state, 1)) {
                const childEval = this.minimax(child, depth - 1, alpha, beta, 1);
                value = Math.min(value, childEval);
                beta = Math.min(beta, value);
                if (beta <= alpha) break; // Prunning
            }
        }

        // Store the evaluation in the transposition table
        this.transpositionTable.set(hash, value);
        return value;
    }
}