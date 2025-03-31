import MinMaxAlgorithm, { GameStrategy } from "../MinMax/MinMax";
import { Cell, Player } from "./BobailGame";
import BobailService from "./BobailService";

export default class BobailAlgorithmImplementation implements GameStrategy {
    minMax: MinMaxAlgorithm;
    bobailService: BobailService;

    constructor() {
        const depth = 6;
        console.log("Depth max = ", depth);
        
        this.minMax = new MinMaxAlgorithm(this, depth);
        this.bobailService = new BobailService();
    }

    findBestMove(gamePosition: Cell[][], currentPlayer: Player): Cell[][] | null  {
        const startTime = performance.now();
        const bestMove = this.minMax.findBestMove(gamePosition, currentPlayer);
        const endTime = performance.now();
        console.log(`Execution time: ${endTime - startTime} ms`);
        
        return bestMove;
    }

    evaluateState(grid: Cell[][], currentPlayer: Player): number {
        // const opponent = currentPlayer === 1 ? 2 : 1;
        const bobailPosition = this.bobailService.getBobailPosition(grid);
        if (!bobailPosition) throw new Error("Bobail is missing from the grid");

        let score = 0;
        
        // Bobail advance (closer to own side is better)
        score += [-1000, -50, 0, 50, 1000][bobailPosition.y]

        // Piece advance
        const playerPositions = this.bobailService.getPlayerPositions(grid, currentPlayer);
        const pieceStrategyPlayer = [
            [2, 2, 0, -2, -2],
            [2, 3, 0, -3, -2],
            [2, 3, 0, -3, -2],
            [2, 3, 0, -3, -2],
            [2, 2, 0, -2, -2]
        ];

        for (const pos of playerPositions) {
            score += pieceStrategyPlayer[pos.x][pos.y] * 2;
        }
        
        // Count free moves for each piece
        let nbCombination = 0;
        for (const pos of playerPositions) {
            nbCombination += this.bobailService.getLinearMoves(grid, pos).length;
        }
                
        score += (currentPlayer === 1 ? nbCombination : -nbCombination) / 4;
        
        // Bobail neighbors (control around it)
        if(this.bobailService.isWithinBounds({x: bobailPosition.x-1, y: bobailPosition.y+1}) && grid[bobailPosition.x-1][bobailPosition.y+1] !== 0) score -= 10;
        if(this.bobailService.isWithinBounds({x: bobailPosition.x, y: bobailPosition.y+1}) && grid[bobailPosition.x][bobailPosition.y+1] !== 0) score -= 10;
        if(this.bobailService.isWithinBounds({x: bobailPosition.x+1, y: bobailPosition.y+1}) && grid[bobailPosition.x+1][bobailPosition.y+1] !== 0) score -= 10;

        if(this.bobailService.isWithinBounds({x: bobailPosition.x-1, y: bobailPosition.y-1}) && grid[bobailPosition.x-1][bobailPosition.y-1] !== 0) score += 10;
        if(this.bobailService.isWithinBounds({x: bobailPosition.x, y: bobailPosition.y-1}) && grid[bobailPosition.x][bobailPosition.y-1] !== 0) score += 10;
        if(this.bobailService.isWithinBounds({x: bobailPosition.x+1, y: bobailPosition.y-1}) && grid[bobailPosition.x+1][bobailPosition.y-1] !== 0) score += 10;

        // If game over, give max or min score
        // if (this.bobailService.isGameOver(grid)) {///////////////////////////////////////////////
        //     return currentPlayer === 1 ? -1000 : 1000;
        // }
        
        return score;
    }

    generateChildren(grid: Cell[][], currentPlayer: Player): Cell[][][] {
        const children: Cell[][][] = [];
        // const opponent = currentPlayer === 1 ? 2 : 1;
        const bobailPosition = this.bobailService.getBobailPosition(grid);
        if (!bobailPosition) throw new Error("Bobail is missing from the grid");

        // Generate all possible Bobail moves
        const bobailMoves = this.bobailService.getAdjacentPositions(bobailPosition)
            .filter(pos => this.bobailService.getPieceAt(grid, pos) === 0)
            .sort((a, b) => currentPlayer === 1 ? a.y - b.y : b.y - a.y);               // Basic heuristic
        
        for (const bobailMove of bobailMoves) {
            const newGridBobail = grid.map(row => [...row]);
            newGridBobail[bobailPosition.x][bobailPosition.y] = 0;
            newGridBobail[bobailMove.x][bobailMove.y] = 3;
            
            // Generate all possible piece moves for current player
            const playerPositions = this.bobailService.getPlayerPositions(newGridBobail, currentPlayer);
            for (const piece of playerPositions) {
                const pieceMoves = this.bobailService.getLinearMoves(newGridBobail, piece);
                for (const move of pieceMoves) {
                    const newGrid = newGridBobail.map(row => [...row]);
                    newGrid[piece.x][piece.y] = 0;
                    newGrid[move.x][move.y] = currentPlayer;
                    
                    children.push(newGrid);
                }
            }
        }
        
        return children;
    }

    isGameOver(grid: Cell[][]): boolean {
        return this.bobailService.isGameOver(grid);
    }

    getHash(grid: Cell[][], currentPlayer: Player): string {
        return `${currentPlayer}-${JSON.stringify(grid)}`;
    }
}