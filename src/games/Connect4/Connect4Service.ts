import { Cell } from "./Connect4Game";
import { Action, State } from "./Connect4MontecarloImplementation";

export default class Connect4Service {
  public static checkGameOver(grid: number[][], currentPlayer: number): number | null {
    // Check for horizontal, vertical, and diagonal wins
    if (this.checkWin(grid, currentPlayer)) {
      return currentPlayer;
    } else if (this.isGridFull(grid)) {
      return 0; // Draw
    }
    return null; // Game not over
  }

  public static checkWin(grid: number[][], currentPlayer: number): boolean {
    // Check horizontal, vertical, and diagonal wins
    return (
      this.checkHorizontalWin(grid, currentPlayer) ||
      this.checkVerticalWin(grid, currentPlayer) ||
      this.checkDiagonalWin(grid, currentPlayer)
    );
  }

  public static checkDiagonalWin(grid: number[][], currentPlayer: number): boolean {
    // Check for diagonal wins (bottom-left to top-right and bottom-right to top-left)
    for (let col = 0; col < 4; col++) {
      for (let row = 0; row < 3; row++) {
        if (
          grid[col][row] === currentPlayer &&
          grid[col + 1][row + 1] === currentPlayer &&
          grid[col + 2][row + 2] === currentPlayer &&
          grid[col + 3][row + 3] === currentPlayer
        ) {
          return true;
        }
      }
    }
    for (let col = 3; col < 7; col++) {
      for (let row = 0; row < 3; row++) {
        if (
          grid[col][row] === currentPlayer &&
          grid[col - 1][row + 1] === currentPlayer &&
          grid[col - 2][row + 2] === currentPlayer &&
          grid[col - 3][row + 3] === currentPlayer
        ) {
          return true;
        }
      }
    }
    return false;
  }

  public static checkVerticalWin(grid: number[][], currentPlayer: number): boolean {
    for (let col = 0; col < 7; col++) {
      for (let row = 0; row < 3; row++) {
        if (
          grid[col][row] === currentPlayer &&
          grid[col][row + 1] === currentPlayer &&
          grid[col][row + 2] === currentPlayer &&
          grid[col][row + 3] === currentPlayer
        ) {
          return true;
        }
      }
    }
    return false;
  }

  public static checkHorizontalWin(grid: number[][], currentPlayer: number): boolean {
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 4; col++) {
        if (
          grid[col][row] === currentPlayer &&
          grid[col + 1][row] === currentPlayer &&
          grid[col + 2][row] === currentPlayer &&
          grid[col + 3][row] === currentPlayer
        ) {
          return true;
        }
      }
    }
    return false;
  }

  public static isGridFull(grid: number[][]): boolean {
    return grid.every(column => column.every(cell => cell !== 0));
  }

  public static isGameOver(board: number[][] | Cell[][]) {
    return (Connect4Service.isGridFull(board) || Connect4Service.checkWin(board, 1) || Connect4Service.checkWin(board, 2));
  }

  public static generateActions(state: State): Action[] {
    const actions: Action[] = [];
    for (let col = 0; col < 7; col++) {
      if (state.board[col][0] === 0) {
        actions.push({ column: col });
      }
    }
    return actions;
  }

  public static applyAction(state: State, action: Action): State {
    const newBoard = state.board.map(col => [...col]);

    if (!action || action.column < 0 || action.column >= 7) return { board: newBoard, player: state.player };

    const column = action.column;
    for (let row = 5; row >= 0; row--) {
      if (newBoard[column][row] === 0) {
        newBoard[column][row] = state.player;
        break;
      }
    }
    return { board: newBoard, player: state.player === 1 ? 2 : 1 };
  }
}