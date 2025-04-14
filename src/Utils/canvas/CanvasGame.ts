import { CanvasGameBase } from "./CanvasGameBase";
import GridDisplayTool from "./GridDisplayTool";
import HexagonDisplayTool from "./HexagonDisplayTool";

export class CanvasGame extends CanvasGameBase {
    public static readonly MOVE_AVAILABLE = 1;
    public static readonly PIECE_SELECTED = 2;
    public static readonly HOVER = 3;
    public static readonly LAST_MOVE = 4;

    public constructor(canvas: HTMLCanvasElement, grid: number[][], displayMode: "GRID" | "HEXAGON" = "GRID") {
        super(canvas, grid, displayMode);

        if (displayMode === "GRID") this.displayTool = new GridDisplayTool(this);
        else this.displayTool = new HexagonDisplayTool(this);

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
        this.displayTool.displayGrid();

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
}
