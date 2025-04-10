import { Player } from "../../utils/models";
import ReversiService from "./ReversiService";

export type Cell = 0 | Player;

export default class ReversiGame {
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
        this.grid = Array.from({ length: 8 }, () => Array(8).fill(0));

        // Initial position
        this.grid[3][3] = 2;
        this.grid[3][4] = 1;
        this.grid[4][4] = 2;
        this.grid[4][3] = 1;
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

    public movePiece(x: number, y: number): boolean {
        if (this.isGameOver()) return false;
        if (!ReversiService.isValidMove(this.grid, x, y, this.currentPlayer)) return false;

        this.grid = ReversiService.applyMove(this.grid, this.currentPlayer, { x, y }) as Cell[][];

        this.checkGameOver();
    
        // If the opponent cant play
        if (ReversiService.getAvailableMoves(this.grid, this.currentPlayer === 1 ? 2 : 1).length) {
            this.switchPlayer();
        }

        return true;
    }

    public switchPlayer(): void {
        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
    }

    public checkGameOver(): void {
        if(ReversiService.isGameOver(this.grid)) {
            this.winner = ReversiService.getCurrentWinner(this.grid) as 0 | Player | null;
        }    
    }
}
