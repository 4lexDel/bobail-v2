import MinMaxAlgorithm, { GameStrategy } from "../MinMax/MinMax";
import { Cell, Player } from "./BobailGame";
import BobailService from "./BobailService";

export default class BobailAlgorithmImplementation implements GameStrategy {
    minMax: MinMaxAlgorithm;
    bobailService: BobailService;

    constructor() {
        const depth = 3;
        console.log("Depth max = ", depth);

        this.minMax = new MinMaxAlgorithm(this, depth);
        this.bobailService = new BobailService();
    }

    findBestMove(gamePosition: Cell[][], currentPlayer: Player): Cell[][] | null {
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
        score += [-1000, -70, 0, 70, 1000][bobailPosition.y]

        // Piece advance
        const playerPositions = this.bobailService.getPlayerPositions(grid, currentPlayer);
        const opponentPositions = this.bobailService.getPlayerPositions(grid, currentPlayer === 1 ? 2 : 1);

        const pieceStrategyPlayer = [
            [2, 3, 0, -3, -2],
            [2, 4, 0, -4, -2],
            [2, 4, 0, -4, -2],
            [2, 4, 0, -4, -2],
            [2, 3, 0, -3, -2]
        ];

        for (const pos of playerPositions) {
            score += pieceStrategyPlayer[pos.x][pos.y] * 2;
        }

        for (const pos of opponentPositions) {
            score += pieceStrategyPlayer[pos.x][pos.y] * 2;
        }

        // Count free moves for each piece
        const nbCombinationPlayerA = playerPositions
        .reduce((sum, pos) => sum + this.bobailService.getLinearMoves(grid, pos).length, 0);
    
        const nbCombinationPlayerB = opponentPositions
        .reduce((sum, pos) => sum + this.bobailService.getLinearMoves(grid, pos).length, 0);
    
        score += ((currentPlayer === 1 ? 1 : -1) * (nbCombinationPlayerA - nbCombinationPlayerB)) / 4;

        // Bobail neighbors (control around it)
        const offsets = [
            { dx: -1, dy: 1 }, { dx: 0, dy: 1 }, { dx: 1, dy: 1 },
            { dx: -1, dy: -1 }, { dx: 0, dy: -1 }, { dx: 1, dy: -1 }
        ];

        for (const { dx, dy } of offsets) {
            const x = bobailPosition.x + dx;
            const y = bobailPosition.y + dy;
            if (this.bobailService.isWithinBounds({ x, y }) && grid[x][y] !== 0) {
                score += (dy === 1 ? -20 : 20);
            }
        }
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
        let bobailMoves = this.bobailService.getAdjacentPositions(bobailPosition)
            .filter(pos => this.bobailService.getPieceAt(grid, pos) === 0);

        // Remove the backward movement if the bobail can move forward
        // const newBobailMove = bobailMoves.filter((pos) => {
        //     if (currentPlayer === 1) return pos.y > bobailPosition.y;
        //     return pos.y < bobailPosition.y;
        // })

        // if (newBobailMove.length >= 2) bobailMoves = newBobailMove;

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

        return children.sort((a, b) => this.sortChildren(a, b, currentPlayer));
    }

    sortChildren(childA: Cell[][], childB: Cell[][], currentPlayer: Player): number {
        const bobailPositionA = this.bobailService.getBobailPosition(childA);
        const bobailPositionB = this.bobailService.getBobailPosition(childB);

        if (!bobailPositionA || !bobailPositionB) return 0;

        if (bobailPositionA.y > bobailPositionB.y) return currentPlayer === 1 ? 1 : -1;

        const piecesA = this.bobailService.getPlayerPositions(childA, currentPlayer);
        const piecesB = this.bobailService.getPlayerPositions(childB, currentPlayer);

        const yTotalA = piecesA.reduce((sum, piece) => sum + piece.y, 0);
        const yTotalB = piecesB.reduce((sum, piece) => sum + piece.y, 0);

        return (yTotalA < yTotalB ? 1 : -1) * (currentPlayer === 1 ? 1 : -1);
    }

    isGameOver(grid: Cell[][]): boolean {
        return this.bobailService.isGameOver(grid);
    }

    getHash(grid: Cell[][], currentPlayer: Player): string {
        return `${currentPlayer}-${JSON.stringify(grid)}`;
    }
}