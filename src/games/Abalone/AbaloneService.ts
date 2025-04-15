import { Position } from "../../utils/models";

export default class AbaloneService {
  private static directions = [
    { dx: -1, dy: 0 },
    { dx: 1, dy: 0 },
    { dx: 0, dy: -1 },
    { dx: 1, dy: -1 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 1 }
  ];

  public static isInsideBoard(x: number, y: number, grid: number[][]): boolean {
    return y >= 0 && y < grid.length && x >= 0 && x < grid[y].length && grid[x][y] !== -1;
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
  // public static isGameOver(board: number[][] | Cell[][]) {
  //   // return (AbaloneService.isGridFull(board) || AbaloneService.checkWin(board, 1) || AbaloneService.checkWin(board, 2));
  // }

  // public static generateActions(state: State): Action[] {
  //   // const actions: Action[] = [];
  //   // for (let col = 0; col < 7; col++) {
  //   //   if (state.board[col][0] === 0) {
  //   //     actions.push({ column: col });
  //   //   }
  //   // }
  //   // return actions;
  // }

  // public static applyAction(state: State, action: Action): State {
  //   // const newBoard = state.board.map(col => [...col]);

  //   // if (!action || action.column < 0 || action.column >= 7) return { board: newBoard, player: state.player };

  //   // const column = action.column;
  //   // for (let row = 5; row >= 0; row--) {
  //   //   if (newBoard[column][row] === 0) {
  //   //     newBoard[column][row] = state.player;
  //   //     break;
  //   //   }
  //   // }
  //   // return { board: newBoard, player: state.player === 1 ? 2 : 1 };
  // }
}