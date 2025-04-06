import { Player } from "../../utils/models";

export type Cell = 0 | Player;

export default class Connect4Game {
    private grid!: Cell[][];
    private currentPlayer!: Player;

    private winner: 0 | Player | null = null;

    constructor() {
        this.initGame();
    }

    public initGame(): void {
        this.grid = this.initializeGrid();
        this.currentPlayer = 1;

        this.winner = null;
    }

    private initializeGrid(): Cell[][] {
        return Array.from({ length: 7 }, () => Array(6).fill(0));
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

    public isColumnFull(col: number): boolean {
        return this.grid[col].every((cell) => cell !== 0);
    }

    public isGameOver() {
        return this.winner !== null;
    }

    public movePiece(col: number): boolean {
        if (this.isGameOver()) return false;
        if (this.isColumnFull(col)) return false;

        if (col < 0 || col >= 7) return false;
        const column = this.grid[col];

        for (let i = column.length - 1; i >= 0; i--) {
            if (column[i] === 0) {
                column[i] = this.currentPlayer;
                break;
            }
        }

        this.checkGameOver();
        this.switchPlayer();

        return true;
    }

    public switchPlayer(): void {
        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
    }

    public checkGameOver(): void {
        // Check for horizontal, vertical, and diagonal wins
        if (this.checkWin()) {
            this.winner = this.currentPlayer;
        } else if (this.isGridFull()) {
            this.winner = 0; // Draw
        }
        
    }

    private checkWin() {
        // Check horizontal, vertical, and diagonal wins
        return this.checkHorizontalWin() || this.checkVerticalWin() || this.checkDiagonalWin();
    }

    private checkDiagonalWin() {
        // Check for diagonal wins (bottom-left to top-right and bottom-right to top-left)
        for (let col = 0; col < 4; col++) {
            for (let row = 0; row < 3; row++) {
                if (
                    this.grid[col][row] === this.currentPlayer &&
                    this.grid[col + 1][row + 1] === this.currentPlayer &&
                    this.grid[col + 2][row + 2] === this.currentPlayer &&
                    this.grid[col + 3][row + 3] === this.currentPlayer
                ) {
                    return true;
                }
            }
        }
        for (let col = 3; col < 7; col++) {
            for (let row = 0; row < 3; row++) {
                if (
                    this.grid[col][row] === this.currentPlayer &&
                    this.grid[col - 1][row + 1] === this.currentPlayer &&
                    this.grid[col - 2][row + 2] === this.currentPlayer &&
                    this.grid[col - 3][row + 3] === this.currentPlayer
                ) {
                    return true;
                }
            }
        }
        return false;
    }

    private checkVerticalWin() {
        for (let col = 0; col < 7; col++) {
            for (let row = 0; row < 3; row++) {
                if (
                    this.grid[col][row] === this.currentPlayer &&
                    this.grid[col][row + 1] === this.currentPlayer &&
                    this.grid[col][row + 2] === this.currentPlayer &&
                    this.grid[col][row + 3] === this.currentPlayer
                ) {
                    return true;
                }
            }
        }
        return false;
    }

    private checkHorizontalWin() {
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 4; col++) {
                if (
                    this.grid[col][row] === this.currentPlayer &&
                    this.grid[col + 1][row] === this.currentPlayer &&
                    this.grid[col + 2][row] === this.currentPlayer &&
                    this.grid[col + 3][row] === this.currentPlayer
                ) {
                    return true;
                }
            }
        }
        return false;
    }

    private isGridFull() {
        return this.grid.every(column => column.every(cell => cell !== 0));
    }
}
