import { Player, Position } from "../../utils/models";
import { Cell } from "./AbaloneGame";
import { Action, State } from "./AbaloneMontecarloImplementation";

export default class AbaloneService {
  private static directions = [
    { dx: -1, dy: 0 },
    { dx: 1, dy: 0 },
    { dx: 0, dy: -1 },
    { dx: 1, dy: -1 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 1 }
  ];

  private static cloneBoard(board: number[][]): number[][] {
    return board.map(row => [...row]);
  }

  public static isInsideBoard(x: number, y: number, grid: number[][]): boolean {
    return y >= 0 && y < grid[0].length && x >= 0 && x < grid.length && grid[x][y] !== -2;
  };

  public static getAvailableMoves(grid: number[][], origin: Position): Position[] {
    const moves: Position[] = [];
    const player = grid[origin.x][origin.y];

    if (player !== 1 && player !== 2) return moves;

    const opponent = player === 1 ? 2 : 1;

    for (const { dx, dy } of AbaloneService.directions) {
      let line: Position[] = [{ x: origin.x, y: origin.y }];
      let cx = origin.x + dx;
      let cy = origin.y + dy;

      // Try building a line of up to 3 player pieces
      while (AbaloneService.isInsideBoard(cx, cy, grid) && grid[cx][cy] === player && line.length < 3) {
        line.push({ x: cx, y: cy });
        cx += dx;
        cy += dy;
      }

      let opponentCount = 0;
      let ox = cx;
      let oy = cy;

      // Count opponent pieces directly in line
      while (AbaloneService.isInsideBoard(ox, oy, grid) && grid[ox][oy] === opponent && opponentCount < line.length) {
        opponentCount++;
        ox += dx;
        oy += dy;
      }

      // If no opponents and next is empty → it's a move
      if (opponentCount === 0 && AbaloneService.isInsideBoard(cx, cy, grid) && grid[cx][cy] === 0) {
        moves.push({ x: cx, y: cy });
      }

      // If valid push: 1 or 2 opponents, and next cell is empty or out of bounds
      const beyondX = ox;
      const beyondY = oy;
      const beyondIsEmpty = AbaloneService.isInsideBoard(beyondX, beyondY, grid) ? grid[beyondX][beyondY] === 0 : true;

      if (
        opponentCount > 0 &&
        opponentCount < line.length &&
        beyondIsEmpty
      ) {
        moves.push({ x: origin.x + dx * (line.length + opponentCount), y: origin.y + dy * (line.length + opponentCount) });
      }
    }

    return moves;
  }

  public static getDirection(from: Position, to: Position): { dx: number, dy: number } | null {
    for (const dir of AbaloneService.directions) {
      if (from.x + dir.dx === to.x && from.y + dir.dy === to.y) {
        return dir;
      }
    }
    return null;
  }

  public static applyMove(grid: number[][], from: Position, to: Position): number[][] {
    const deltaX = Math.abs(to.x - from.x);
    const deltaY = Math.abs(to.y - from.y);

    if ((deltaX !== 0 && deltaY !== 0 && deltaX !== deltaY) || (deltaX === 0 && deltaY === 0)) return [];

    const newGrid = AbaloneService.cloneBoard(grid);

    const dx = ((to.x - from.x) / deltaX) || 0;
    const dy = ((to.y - from.y) / deltaY) || 0;

    let cx = from.x;
    let cy = from.y;

    let lastValue = newGrid[cx][cy];

    while (cx !== to.x || cy !== to.y) {
      cx += dx;
      cy += dy;

      if (AbaloneService.isInsideBoard(cx, cy, newGrid)) {
        const lastValueTmp = newGrid[cx][cy];
        newGrid[cx][cy] = lastValue;

        lastValue = lastValueTmp;
      }
    }

    newGrid[from.x][from.y] = 0;

    return newGrid;
  }

  public static countPlayerPiecesLost(board: number[][]): { player1: number, player2: number } {
    const piecesLost = { player1: 14, player2: 14 };

    for (let x = 0; x < board.length; x++) {
      for (let y = 0; y < board[0].length; y++) {
        if (board[x][y] === 1) piecesLost.player1--;
        else if (board[x][y] === 2) piecesLost.player2--;
      }
    }

    return piecesLost;
  }

  public static isGameOver(board: number[][]): boolean {
    const piecesLost = AbaloneService.countPlayerPiecesLost(board);

    return (piecesLost.player1 >= 6 || piecesLost.player2 >= 6);
  }

  public static generateActions(state: State): Action[] {
    const actions: Action[] = [];

    for (let x = 0; x < state.board.length; x++) {
      for (let y = 0; y < state.board[0].length; y++) {
        if (state.board[x][y] === state.player) {
          const availableMoves = AbaloneService.getAvailableMoves(state.board, { x, y });
          // Convert the move to action and add it to the current list
          if (availableMoves.length) actions.push(...availableMoves.map((move) => ({ from: { x, y }, to: move })));
        }
      }
    }

    return actions;
  }

  public static applyAction(state: State, action: Action): State {
    const newBoard = AbaloneService.applyMove(state.board, action.from, action.to);

    return { board: newBoard as Cell[][], player: state.player === 1 ? 2 : 1 };
  }

  public static distance(a: Position, b: Position): number {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  public static evaluateBoard(board: number[][], player: Player): number {
    const totalPieces = 14;
    const center: Position = { x: 5, y: 5 };

    const opponent = player === 1 ? 2 : 1;

    let playerCount = 0, opponentCount = 0;
    let centerScore = 0;
    let cohesionScore = 0;
    // let edgePenalty = 0;

    const playerPositions: Position[] = [];

    for (let x = 0; x < board.length; x++) {
        for (let y = 0; y < board[0].length; y++) {
        const cell = board[x][y];
        if (cell === player) {
          playerCount++;
          playerPositions.push({ x, y });

          // Closer to center is better
          centerScore += 10 - 2*AbaloneService.distance({ x, y }, center);

          // // Penalize pieces near the edge
          // if (x <= 1 || x >= 7 || y <= 1 || y >= 7) {
          //   edgePenalty += 5;
          // }
        } else if (cell === opponent) {
          opponentCount++;
        }
      }
    }

    // Cohesion: count number of adjacent friendly neighbors
    for (const { x, y } of playerPositions) {
      for (const { dx, dy } of AbaloneService.directions) {
        const nx = x + dx, ny = y + dy;
        if (AbaloneService.isInsideBoard(nx, ny, board) && board[nx][ny] === player) {
          cohesionScore += 2;
        }
      }
    }

    const playerOff = totalPieces - playerCount;
    const opponentOff = totalPieces - opponentCount;

    const materialScore = (playerCount - opponentCount) * 10;
    const capturedBonus = opponentOff * 100 - playerOff * 100;

    const finalScore =
      materialScore +
      capturedBonus +
      centerScore +
      cohesionScore;// -
      // edgePenalty;

    return finalScore;
  }
}