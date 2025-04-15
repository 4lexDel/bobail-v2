import { Player, Position } from "../../utils/models";
import AbaloneService from "./AbaloneService";

export type Cell = -2 | -1 | 0 | Player;

export default class AbaloneGame {
    private grid!: Cell[][];
    private currentPlayer!: Player;

    private winner: 0 | Player | null = null;

    constructor() {
        this.initGame();
    }

    public initGame(): void {
        this.initializeGrid();
        this.currentPlayer = 1;

        this.winner = null;
    }

    private initializeGrid(): void {
        // -2  => border
        // -1  => Not a cell (void)
        // 1  => Player 1
        // 2  => Player 2
        // 0  => Empty

        this.grid = [
            [-1, -1, -1, -1, -1, -2, -2, -2, -2, -2, -2],
            [-1, -1, -1, -1, -2, 0, 0, 0, 1, 1, -2],
            [-1, -1, -1, -2, 0, 0, 0, 0, 1, 1, -2],
            [-1, -1, -2, 0, 0, 0, 0, 1, 1, 1, -2],
            [-1, -2, 2, 0, 0, 0, 0, 1, 1, 1, -2],
            [-2, 2, 2, 2, 0, 0, 0, 1, 1, 1, -2],
            [-2, 2, 2, 2, 0, 0, 0, 0, 1, -2, -1],
            [-2, 2, 2, 2, 0, 0, 0, 0, -2, -1, -1],
            [-2, 2, 2, 0, 0, 0, 0, -2, -1, -1, -1],
            [-2, 2, 2, 0, 0, 0, -2, -1, -1, -1, -1],
            [-2, -2, -2, -2, -2, -2, -1, -1, -1, -1, -1],
        ];
    }

    public getGrid() {
        return this.grid;
    }

    public setGrid(grid: Cell[][]) {
        this.grid = grid;
    }

    public getCurrentPlayer() {
        return this.currentPlayer;
    }

    public getWinner() {
        return this.winner;
    }

    public isGameOver() {
        return this.winner !== null;
    }

    public movePiece(from: Position, to: Position): boolean {       
        if (this.isGameOver()) return false;

        if (this.grid[from.x][from.y] !== this.currentPlayer) return false;

        const validMoves = AbaloneService.getAvailableMoves(this.grid, { x: from.x, y: from.y });

        if (!validMoves.some(pos => pos.x === to.x && pos.y === to.y)) return false;

        this.grid = AbaloneService.applyMove(this.grid, { x: from.x, y: from.y }, { x: to.x, y: to.y }) as Cell[][];

        this.checkGameOver();
        this.switchPlayer();        

        return true;
    }

    public switchPlayer(): void {
        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
    }

    public checkGameOver(): void {
        const piecesLost = AbaloneService.countPlayerPiecesLost(this.grid);

        if (piecesLost.player1 >= 6) this.winner = 2;
        else if (piecesLost.player2 >= 6) this.winner = 1;
    }
}
