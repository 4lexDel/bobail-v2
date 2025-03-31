type Player = 1 | 2;
type Cell = 0 | Player | 3;
type Position = { x: number; y: number };

export default class BobailGame {
    private board: Cell[][];
    private currentPlayer: Player;
    private bobailMoved = true;

    constructor() {
        this.board = this.initializeBoard();
        this.currentPlayer = 1;
    }

    private initializeBoard(): Cell[][] {
        const board: Cell[][] = Array.from({ length: 5 }, () => Array(5).fill(0));
        for (let i = 0; i < 5; i++) {
            board[i][0] = 2;
            board[i][4] = 1;
        }
        board[2][2] = 3;
        return board;
    }

    public getBoard() {
        return this.board;
    }

    public getCurrentPlayer() {
        return this.currentPlayer;
    }

    public getBobailMoved() {
        return this.bobailMoved;
    }

    private isWithinBounds(position: Position): boolean {
        return position.x >= 0 && position.x < 5 && position.y >= 0 && position.y < 5;
    }

    private getPieceAt(position: Position): Cell {
        return this.board[position.x][position.y];
    }

    private setPieceAt(position: Position, piece: Cell): void {
        this.board[position.x][position.y] = piece;
    }

    private getBobailPosition(): Position | null {
        for (let x = 0; x < 5; x++) {
            for (let y = 0; y < 5; y++) {
                if (this.board[x][y] === 3) {
                    return { x, y };
                }
            }
        }
        return null;
    }

    private getPlayerPositions(player: Player): Position[] {
        const positions: Position[] = [];
        for (let x = 0; x < 5; x++) {
            for (let y = 0; y < 5; y++) {
                if (this.board[x][y] === player) {
                    positions.push({ x, y });
                }
            }
        }
        return positions;
    }

    private getAdjacentPositions(position: Position): Position[] {
        const directions = [
            { x: -1, y: -1 }, { x: -1, y: 0 }, { x: -1, y: 1 },
            { x: 0, y: -1 }, { x: 0, y: 1 },
            { x: 1, y: -1 }, { x: 1, y: 0 }, { x: 1, y: 1 },
        ];
        return directions
            .map(dir => ({ x: position.x + dir.x, y: position.y + dir.y }))
            .filter(this.isWithinBounds.bind(this));
    }

    private getLinearMoves(position: Position): Position[] {
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
            while (this.isWithinBounds({ x, y }) && this.getPieceAt({ x, y }) === 0) {
                x += dir.x;
                y += dir.y;
                pathSearched = true;
            }
            pathSearched && moves.push({ x: x - dir.x, y: y - dir.y });
        }
        return moves;
    }

    public getAvailableBobailMoves(origin: {x: number, y: number}): Position[] | null {
        if (this.getPieceAt(origin) !== 3) return null;
        return this.getAdjacentPositions(origin).filter(pos => this.getPieceAt(pos) === 0);
    }

    public getAvailablePieceMoves(origin: {x: number, y: number}): Position[] | null {
        if (this.getPieceAt(origin) !== this.currentPlayer) return null;
        return this.getLinearMoves(origin);
    }

    public moveBobail(to: Position): boolean {
        if (this.bobailMoved) return false;

        const bobailPosition = this.getBobailPosition();
        if (!bobailPosition) {
            throw new Error('Bobail introuvable sur le plateau.');
        }
        const validMoves = this.getAdjacentPositions(bobailPosition).filter(pos => this.getPieceAt(pos) === 0);

        if (!validMoves.some(pos => pos.x === to.x && pos.y === to.y)) {
            return false; // Déplacement invalide
        }

        this.setPieceAt(bobailPosition, 0);
        this.setPieceAt(to, 3);
        this.switchPlayer();
        return true;
    }

    public movePiece(from: Position, to: Position): boolean {
        if (!this.bobailMoved) return false;

        if (this.getPieceAt(from) !== this.currentPlayer) {
            return false; // Le joueur essaie de déplacer une pièce qui ne lui appartient pas
        }

        const validMoves = this.getLinearMoves(from);
        if (!validMoves.some(pos => pos.x === to.x && pos.y === to.y)) {
            return false; // Déplacement invalide
        }

        this.setPieceAt(from, 0);
        this.setPieceAt(to, this.currentPlayer);
        this.switchPlayer();
        return true;
    }

    private switchPlayer(): void {
        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
    }

    public printBoard(): void {
        console.log(this.board.map(row => row.map(cell => cell ?? '.').join(' ')).join('\n'));
    }
}
