import { GameBase } from "./GameBase.js";

export class Game extends GameBase {
    private pieceHexaColor: string[] = [];
    private flagHexaColor: string[] = [];
    private colorBackground: string = "rgb(120, 120, 120)";

    private flagGrid: number[][] = Array.from({ length: 5 }, () => Array(5).fill(0));

    public onCellClicked!: (x: number, y: number) => void;

    public constructor(canvas: HTMLCanvasElement, grid: number[][]) {
        super(canvas, grid);
        this.grid = grid;
        this.resetFlagGrid();
        this.init(grid);
    }

    public setGrid(grid: number[][]): void {
        this.grid = grid;
        this.resetFlagGrid();
    }

    public resetFlagGrid(): void {
        this.flagGrid = Array.from({ length: 5 }, () => Array(5).fill(0));
        this.isRenderNeed = true;
    } 

    private init(grid: number[][]): void {
        this.pieceHexaColor = [
            "#fd0d34", // red
            "#3c8bda", // neutral blue
            "#ffbe33", // golden
            "#179374", // neutral green
            "#99abc2", // grey
        ];
        this.flagHexaColor = [
            "#a8a8a8", // Move available
            "#ffcc4f", // Piece selected
        ];

        this.grid = grid;

        /*----------------Draw settings----------*/
        this.FPS = 20;
        this.prevTick = 0;

        /**---------------START----------------- */
        this.isRenderNeed = true;
        this.draw();

        this.initEvent();
    }

    private initEvent(): void {
        this.onMouseDown(() => this.mouseAction());
    }

    private mouseAction(): void {
        let x = Math.floor((this.mouseX - this.mx) / this.d);
        let y = Math.floor((this.mouseY - this.my) / this.d);

        if (x < 0 || x >= this.grid.length || y < 0 || y >= this.grid[0].length) {
            return;
        }

        this.updateCell(x, y);
    }

    private updateCell(x: number, y: number): void {
        this.onCellClicked(x, y);

        this.isRenderNeed = true;
    }

    private draw(): void {
        /*------------------------------FPS-----------------------------*/
        window.requestAnimationFrame(() => this.draw());

        let now = Math.round(this.FPS * Date.now() / 1000);
        if (now === this.prevTick) return;
        this.prevTick = now;
        /*--------------------------RENDER------------------------------*/
        if (!this.isRenderNeed) return; // Use to avoid too much rendering
        
        this.drawProcess();
    }

    private drawProcess(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.displayGrid();

        this.isRenderNeed = false;
    }

    public drawFlagGrid({ origin, flagPositions }: { origin: { x: number; y: number }; flagPositions: { x: number; y: number }[] }): void {
        this.resetFlagGrid();

        for (let i = 0; i < flagPositions.length; i++) {
            const flagPosition = flagPositions[i];
            this.flagGrid[flagPosition.x][flagPosition.y] = 1;
        }

        this.flagGrid[origin.x][origin.y] = 2;

        this.isRenderNeed = true;
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
            this.ctx.fillStyle = this.flagHexaColor[this.flagGrid[x][y] - 1];
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
        if(this.grid[x][y] === 0) return;

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
        this.ctx.lineWidth = 3;
        this.ctx.stroke();

        this.displayCellBorder(this.mx + x * this.d, this.my + y * this.d, this.d);
    }

    private displayCellBorder(x: number, y: number, d: number): void {
        this.ctx.strokeStyle = "rgb(100, 100, 100)";
        this.ctx.lineWidth = 4;
        this.ctx.strokeRect(x, y, d, d);
    }
}
