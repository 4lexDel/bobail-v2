import { Player } from "../../utils/models";

export type Cell = -1 | 0 | Player;

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
        this.grid = [
            [-1, -1, -1, -1, 0, 0, 0, 1, 1], //-1  => vide
            [-1, -1, -1, 0, 0, 0, 0, 1, 1], // 1  => Player 1
            [-1, -1, 0, 0, 0, 0, 1, 1, 1], // 2  => Player 2
            [-1, 2, 0, 0, 0, 0, 1, 1, 1], // 0  => Neutre
            [2, 2, 2, 0, 0, 0, 1, 1, 1],
            [2, 2, 2, 0, 0, 0, 0, 1, -1],
            [2, 2, 2, 0, 0, 0, 0, -1, -1],
            [2, 2, 0, 0, 0, 0, -1, -1, -1],
            [2, 2, 0, 0, 0, -1, -1, -1, -1],
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

    public movePiece(col: number): boolean {
        if (this.isGameOver()) return false;

        // Logic

        this.checkGameOver();
        this.switchPlayer();

        return true;
    }

    public switchPlayer(): void {
        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
    }

    public checkGameOver(): void {
        // logic
    }
}
