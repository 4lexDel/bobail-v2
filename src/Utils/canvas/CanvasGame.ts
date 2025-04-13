import { CanvasGameBase } from "./CanvasGameBase";

export class CanvasGame extends CanvasGameBase {
    private colorBackground: string = "rgb(120, 120, 120)";
    private pieceHexaColor = [
        "#fd0d34", // red
        "#3c8bda", // neutral blue
        "#ffbe33", // golden
        "#179374", // neutral green
        "#99abc2", // grey
    ];

    public static readonly MOVE_AVAILABLE = 1;
    public static readonly PIECE_SELECTED = 2;
    public static readonly HOVER = 3;
    public static readonly LAST_MOVE = 4;
    private flagHexaColor = [
        { persistent: true, zIndex: 1, hexaColor: "#a8a8a8" }, // Move available
        { persistent: true, zIndex: 2, hexaColor: "#ffcc4f" }, // Piece selected
        { persistent: false, zIndex: -1, hexaColor: "#888888" }, // Hover
        { persistent: true, zIndex: 0, hexaColor: "#585858" }, // Last move
    ];

    private flagGrid!: number[][];

    public constructor(canvas: HTMLCanvasElement, grid: number[][]) {
        super(canvas, grid);
        this.grid = grid;
        this.resetFlagGrid();
        this.init();
    }

    public setGrid(grid: number[][]): void {
        this.grid = grid;
        this.resetFlagGrid();
        this.resize(this.canvas.clientWidth, this.canvas.clientHeight);
    }

    public resetFlagGrid(clearPersistent = true): void {
        (clearPersistent || !this.flagGrid) && (this.flagGrid = new Array(this.grid.length).fill(0).map(() => new Array(this.grid[0].length).fill(0)));

        for (let x = 0; x < this.grid.length; x++) {
            for (let y = 0; y < this.grid[0].length; y++) {
                if (this.flagGrid[x][y] !== 0 && !this.flagHexaColor[this.flagGrid[x][y] - 1].persistent) {
                    this.flagGrid[x][y] = 0;
                }
            }
        }
        this.isRenderNeed = true;
    }

    private init(): void {
        /**---------------START----------------- */
        this.render();
        this.initEvent();
    }

    protected override draw(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.displayGrid();

        this.isRenderNeed = false;
    }

    public editFlagGrid(flagPositions: { x: number; y: number }[], flagId: number): void {
        this.resetFlagGrid(false);
        for (let i = 0; i < flagPositions.length; i++) {
            const flagPosition = flagPositions[i];

            // z-index priority
            const isNewFlagAllowed = this.flagGrid[flagPosition.x][flagPosition.y] == 0 || this.flagHexaColor[flagId - 1].zIndex > this.flagHexaColor[this.flagGrid[flagPosition.x][flagPosition.y] - 1].zIndex;
            if (isNewFlagAllowed) this.flagGrid[flagPosition.x][flagPosition.y] = flagId;
        }
    }

    private displayGrid(): void {
        for (let x = 0; x < this.grid.length; x++) {
            for (let y = 0; y < this.grid[0].length; y++) {
                this.displayCell(x, y);
                this.displayPiece(x, y);
            }
        }
    }

    private displayCell(x: number, y: number): void {
        if (this.flagGrid[x][y] !== 0) {
            this.ctx.fillStyle = this.flagHexaColor[this.flagGrid[x][y] - 1].hexaColor;
            this.ctx.fillRect(this.mx + x * this.d, this.my + y * this.d, this.d, this.d);
            this.displayCellBorder(this.mx + x * this.d, this.my + y * this.d, this.d);
        }
        else {
            this.ctx.fillStyle = this.colorBackground;
            this.ctx.fillRect(this.mx + x * this.d, this.my + y * this.d, this.d, this.d);
            this.displayCellBorder(this.mx + x * this.d, this.my + y * this.d, this.d);
        }
    }

    private displayPiece(x: number, y: number): void {
        if (this.grid[x][y] === 0) return;

        this.ctx.fillStyle = this.pieceHexaColor[this.grid[x][y] - 1];
        this.ctx.beginPath();
        this.ctx.ellipse(
            this.mx + x * this.d + this.d / 2,
            this.my + y * this.d + this.d / 2,
            this.d / 3,
            this.d / 3,
            0,
            0,
            2 * Math.PI
        );
        this.ctx.fill();
        this.ctx.strokeStyle = "rgb(20, 20, 20)";
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        this.displayCellBorder(this.mx + x * this.d, this.my + y * this.d, this.d);
    }

    private displayCellBorder(x: number, y: number, d: number): void {
        this.ctx.strokeStyle = "rgb(100, 100, 100)";
        this.ctx.lineWidth = this.canvas.width <= 650 ? 2 : 4;
        this.ctx.strokeRect(x, y, d, d);
    }
}
