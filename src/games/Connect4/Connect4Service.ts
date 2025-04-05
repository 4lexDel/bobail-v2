import { Player } from "../../utils/models";
import { State } from "./Connect4MontecarloImplementation";

export default class Connect4Service {
    public static ROWS = 6;
    public static COLS = 7;

    public static checkDirection(board: number[][], row: number, col: number, dRow: number, dCol: number, player: Player): boolean {
        for (let i = 0; i < 4; i++) {
          const r = row + i * dRow;
          const c = col + i * dCol;
          if (r < 0 || r >= Connect4Service.ROWS || c < 0 || c >= Connect4Service.COLS || board[r][c] !== player) {
            return false;
          }
        }
        return true;
      }

      public static getWinner(state: State): Player | 0 {
        for (let row = 0; row < Connect4Service.ROWS; row++) {
          for (let col = 0; col < Connect4Service.COLS; col++) {
            const player = state.board[row][col];
            if (player !== 0) {
              if (
                Connect4Service.checkDirection(state.board, row, col, 1, 0, player) ||
                Connect4Service.checkDirection(state.board, row, col, 0, 1, player) ||
                Connect4Service.checkDirection(state.board, row, col, 1, 1, player) ||
                Connect4Service.checkDirection(state.board, row, col, 1, -1, player)
              ) {
                return player;
              }
            }
          }
        }
        return 0;
      }
}