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

  private static cloneBoard(board: number[][]): number[][] {
    return board.map(row => [...row]);
  }

  public static isInsideBoard(x: number, y: number, grid: number[][]): boolean {
    return y >= 0 && y < grid[0].length && x >= 0 && x < grid.length && grid[x][y] !== -1;
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

  public static applyMove2(grid: number[][], from: Position, to: Position): number[][] {
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

  public static applyMove(board: number[][], from: Position, to: Position): number[][] {
    const player = board[from.x][from.y];
    if (player !== 1 && player !== 2) return board;

    const dir = AbaloneService.getDirection(from, to);
    if (!dir) return board; // not adjacent or invalid direction

    const newBoard = AbaloneService.cloneBoard(board);

    // Build moving line (backwards from `from` in reverse direction)
    const movingLine: Position[] = [from];
    let bx = from.x - dir.dx;
    let by = from.y - dir.dy;
    while (
      AbaloneService.isInsideBoard(bx, by, board) &&
      board[bx][by] === player &&
      movingLine.length < 3
    ) {
      movingLine.unshift({ x: bx, y: by });
      bx -= dir.dx;
      by -= dir.dy;
    }

    // Count pushed opponent pieces
    const opponent = player === 1 ? 2 : 1;
    const frontX = to.x;
    const frontY = to.y;
    const pushLine: Position[] = [];

    let cx = frontX;
    let cy = frontY;
    while (AbaloneService.isInsideBoard(cx, cy, board) && board[cx][cy] === opponent) {
      pushLine.push({ x: cx, y: cy });
      cx += dir.dx;
      cy += dir.dy;
    }

    const finalDest = { x: cx, y: cy };
    const canPush = (
      pushLine.length > 0 &&
      pushLine.length < movingLine.length &&
      (!AbaloneService.isInsideBoard(finalDest.x, finalDest.y, board) || board[finalDest.x][finalDest.y] === 0)
    );

    // Apply push if valid
    if (canPush) {
      // If the last piece is pushed off the board (void), remove it
      if (AbaloneService.isInsideBoard(finalDest.x, finalDest.y, board)) {
        newBoard[finalDest.x][finalDest.y] = opponent;
      }
      // Move the push line forward
      for (let i = pushLine.length - 1; i >= 0; i--) {
        const fromPos = pushLine[i];
        const toPos = {
          x: fromPos.x + dir.dx,
          y: fromPos.y + dir.dy
        };
        if (AbaloneService.isInsideBoard(toPos.x, toPos.y, board)) {
          newBoard[toPos.x][toPos.y] = opponent;
        }
        newBoard[fromPos.x][fromPos.y] = 0;
      }
    }

    // If target is empty and no push needed, it's a regular move
    if (board[to.x][to.y] === 0 || canPush) {
      // Move the line
      for (let i = movingLine.length - 1; i >= 0; i--) {
        const fromPos = movingLine[i];
        const toPos = {
          x: fromPos.x + dir.dx,
          y: fromPos.y + dir.dy
        };
        if (AbaloneService.isInsideBoard(toPos.x, toPos.y, board)) {
          newBoard[toPos.x][toPos.y] = player;
        }
        newBoard[fromPos.x][fromPos.y] = 0;
      }
    }

    return newBoard;
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