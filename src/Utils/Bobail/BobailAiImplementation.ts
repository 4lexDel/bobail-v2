import MinMaxAlgorithm, { GameStrategy } from "../MinMax/MinMax";
import { Cell, Player } from "./BobailGame";
import BobailService from "./BobailService";

export default class BobailAlgorithmImplementation implements GameStrategy {
    minMax: MinMaxAlgorithm;
    bobailService: BobailService;

    constructor() {
        this.minMax = new MinMaxAlgorithm(this, 3);
        this.bobailService = new BobailService();
    }

    findBestMove(gamePosition: Cell[][], currentPlayer: Player): Cell[][] | null  {
        console.log(this.generateChildren(gamePosition, currentPlayer));
        
        return this.minMax.findBestMove(gamePosition, currentPlayer);
    }

    evaluateState(grid: Cell[][], currentPlayer: Player): number {
        // const opponent = currentPlayer === 1 ? 2 : 1;
        const bobailPosition = this.bobailService.getBobailPosition(grid);
        if (!bobailPosition) throw new Error("Bobail is missing from the grid");

        let score = 0;
        
        // Bobail advance (closer to own side is better)
        // score += (currentPlayer === 1 ? bobailPosition.y : (4 - bobailPosition.y)) * 10;

        score += [
            [-1000, -20, 0, 20, 1000],
            [1000, 20, 0, -20, -1000],
        ]
        [currentPlayer-1][bobailPosition.y]
        
        // // Count free moves for each piece
        // const playerPositions = this.bobailService.getPlayerPositions(grid, currentPlayer);
        // for (const pos of playerPositions) {
        //     score += this.bobailService.getLinearMoves(grid, pos).length * 5;
        // }
        
        // // Bobail neighbors (control around it)
        // const bobailNeighbors = this.bobailService.getAdjacentPositions(bobailPosition);
        // score += bobailNeighbors.filter(pos => this.bobailService.getPieceAt(grid, pos) === currentPlayer).length * 10;
        // score -= bobailNeighbors.filter(pos => this.bobailService.getPieceAt(grid, pos) === opponent).length * 10;

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
        const bobailMoves = this.bobailService.getAdjacentPositions(bobailPosition).filter(pos => this.bobailService.getPieceAt(grid, pos) === 0);
        
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