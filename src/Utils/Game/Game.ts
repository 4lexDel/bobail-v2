import { GameBase } from "./GameBase.js";

export class Game extends GameBase {
    private pieceHexaColor: string[] = [];
    private flagHexaColor: string[] = [];
    private colorBackground: string = "rgb(200, 200, 200)";

    private grid: number[][];
    private flagGrid: number[][] = Array.from({ length: 5 }, () => Array(5).fill(0));

    public onCellClicked = (x: number, y: number) => {};

    public constructor(canvas: HTMLCanvasElement, grid: number[][]) {
        super(canvas, grid);
        this.grid = grid;
        this.resetFlagGrid();
        this.init(grid);
    }

    private resetFlagGrid(): void {
        this.flagGrid = Array.from({ length: 5 }, () => Array(5).fill(0));
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
            "#fffd93",
            "#ff93c2",
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
        this.onMouseDown((e: MouseEvent) => this.mouseAction(e));
    }

    private mouseAction(e: MouseEvent): void {
        let x = Math.floor((this.mouseX - this.mx) / this.d);
        let y = Math.floor((this.mouseY - this.my) / this.d);

        if (x < 0 || x >= this.grid.length || y < 0 || y >= this.grid[0].length) {
            return;
        }

        this.updateCell(x, y, e.button);
    }

    private updateCell(x: number, y: number, eventType: number = 0): void {
        // if (eventType === 0){
        //     this.grid[x][y] = (this.grid[x][y] + 1) % 4;
        //     // if(this.grid[x][y] == 2) this.grid[x][y] = 1;
        // }
        // else this.grid[x][y] = 0;

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
        console.log("draw");
        
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
        this.ctx.fillStyle = this.colorBackground;
        this.ctx.fillRect(this.mx + x * this.d, this.my + y * this.d, this.d, this.d);
        this.displayCellBorder(this.mx + x * this.d, this.my + y * this.d, this.d);

        if (this.flagGrid[x][y] !== 0) {
            this.ctx.fillStyle = this.flagHexaColor[this.flagGrid[x][y] - 1] + "80";
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
