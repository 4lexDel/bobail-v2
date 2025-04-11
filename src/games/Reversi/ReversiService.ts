import { Player, Position } from "../../utils/models";
import { Cell } from "./ReversiGame";

export default class ReversiService {
  public static directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],          [0, 1],
    [1, -1],  [1, 0], [1, 1]
  ];

  public static positionWeights: number[][] = [
    [100, -20, 10, 5, 5, 10, -20, 100],
    [-20, -50, -2, -2, -2, -2, -50, -20],
    [10, -2, 5, 1, 1, 5, -2, 10],
    [5, -2, 1, 0, 0, 1, -2, 5],
    [5, -2, 1, 0, 0, 1, -2, 5],
    [10, -2, 5, 1, 1, 5, -2, 10],
    [-20, -50, -2, -2, -2, -2, -50, -20],
    [100, -20, 10, 5, 5, 10, -20, 100],
  ];

  public static isValidMove(board: number[][] | Cell[][], x: number, y: number, player: number | Player): boolean {
    const opponent = player === 1 ? 2 : 1;
    if (board[x][y] !== 0) return false;

    for (const [dx, dy] of ReversiService.directions) {
      let mx = x + dx;
      let my = y + dy;
      let hasOpponentBetween = false;

      while (mx >= 0 && mx < 8 && my >= 0 && my < 8) {
        if (board[mx][my] === opponent) {
          hasOpponentBetween = true;
        } else if (board[mx][my] === player) {
          if (hasOpponentBetween) return true;
          break;
        } else {
          break;
        }
        mx += dx;
        my += dy;
      }
    }

    return false;
  }

  public static getAvailableMoves(board: number[][] | Cell[][], player: number | Player): Position[] {
    const moves: Position[] = [];
    
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        if (ReversiService.isValidMove(board, x, y, player)) {
          moves.push({ x, y });
        }
      }
    }
  
    return moves;
  }

  public static applyMove(board: number[][] | Cell[][], player: number, move: Position): number[][] | Cell[][] {
    const opponent = player === 1 ? 2 : 1;
    const newBoard = board.map(row => [...row]); // Deep copy board
  
    newBoard[move.x][move.y] = player;
  
    for (const [dx, dy] of ReversiService.directions) {
      let x = move.x + dx;
      let y = move.y + dy;
      const piecesToFlip: Position[] = [];
  
      while (x >= 0 && x < 8 && y >= 0 && y < 8) {
        if (newBoard[x][y] === opponent) {
          piecesToFlip.push({ x, y });
        } else if (newBoard[x][y] === player) {
          for (const piece of piecesToFlip) {
            newBoard[piece.x][piece.y] = player;
          }
          break;
        } else {
          break;
        }
        x += dx;
        y += dy;
      }
    }
  
    return newBoard;
  }

  public static isGameOver(grid: number[][]): boolean {
    return (!ReversiService.getAvailableMoves(grid, 1).length && !ReversiService.getAvailableMoves(grid, 2).length);
  }

  public static getCurrentWinner(board: number[][] | Cell[][]): number {
    let player1Count = 0;
    let player2Count = 0;
  
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (board[row][col] === 1) player1Count++;
        if (board[row][col] === 2) player2Count++;
      }
    }
  
    if (player1Count > player2Count) return 1;
    if (player2Count > player1Count) return 2;
    return 0; // Draw
  }

  public static evaluatePosition(board: number[][] | Cell[][], currentPlayer: number | Player): number {
    let score = 0;
  
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (board[row][col] === currentPlayer) {
          score += ReversiService.positionWeights[row][col];
        } else if (board[row][col] !== 0) {
          score -= ReversiService.positionWeights[row][col];
        }
      }
    }

    return score;
  }
}