import { Player, Position } from "../../utils/models";
import { Cell } from "./BobailGame";

export default class BobailService {
    public static getPlayerPositions(grid: Cell[][], player: Player): Position[] {
        const positions: Position[] = [];
        for (let x = 0; x < 5; x++) {
            for (let y = 0; y < 5; y++) {
                if (grid[x][y] === player) {
                    positions.push({ x, y });
                }
            }
        }
        return positions;
    }

    public static getBobailPosition(grid: Cell[][]): Position | null {
        for (let x = 0; x < 5; x++) {
            for (let y = 0; y < 5; y++) {
                if (grid[x][y] === 3) {
                    return { x, y };
                }
            }
        }
        return null;
    }

    public static isWithinBounds(position: Position): boolean {
        return position.x >= 0 && position.x < 5 && position.y >= 0 && position.y < 5;
    }

    public static getAdjacentPositions(position: Position): Position[] {
        const directions = [
            { x: -1, y: -1 }, { x: -1, y: 0 }, { x: -1, y: 1 },
            { x: 0, y: -1 }, { x: 0, y: 1 },
            { x: 1, y: -1 }, { x: 1, y: 0 }, { x: 1, y: 1 },
        ];
        return directions
            .map(dir => ({ x: position.x + dir.x, y: position.y + dir.y }))
            .filter(this.isWithinBounds.bind(this));
    }

    public static getPieceAt(grid: Cell[][], position: Position): Cell {
        return grid[position.x][position.y];
    }

    public static getLinearMoves(grid: Cell[][], position: Position): Position[] {
        const moves: Position[] = [];
        const directions = [
            { x: -1, y: -1 }, { x: -1, y: 0 }, { x: -1, y: 1 },
            { x: 0, y: -1 }, { x: 0, y: 1 },
            { x: 1, y: -1 }, { x: 1, y: 0 }, { x: 1, y: 1 },
        ];
        for (const dir of directions) {
            let x = position.x + dir.x;
            let y = position.y + dir.y;

            let pathSearched = false;
            while (this.isWithinBounds({ x, y }) && this.getPieceAt(grid, { x, y }) === 0) {
                x += dir.x;
                y += dir.y;
                pathSearched = true;
            }
            pathSearched && moves.push({ x: x - dir.x, y: y - dir.y });
        }
        return moves;
    }

    public static isGameOver(grid: Cell[][]): boolean {
        const bobailPosition = BobailService.getBobailPosition(grid);
        if(!bobailPosition) throw new Error("Bobail required on the grid");

        // Edge winning condition
        if(bobailPosition.y === 4 || bobailPosition.y === 0) return true

        const adjacentPositions = BobailService.getAdjacentPositions(bobailPosition).filter((pos) => this.getPieceAt(grid, pos) === 0);
        // Stuck winning condition
        if(!adjacentPositions.length) return true;

        return false;
    }
}