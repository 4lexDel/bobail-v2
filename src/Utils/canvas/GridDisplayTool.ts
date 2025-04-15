import { CanvasGameBase } from "./CanvasGameBase";
import DisplayTool from "./DisplayTool";

export default class GridDisplayTool implements DisplayTool {
    constructor(private instance: CanvasGameBase) {}

    public displayGrid(): void {
        for (let x = 0; x < this.instance.grid.length; x++) {
            for (let y = 0; y < this.instance.grid[0].length; y++) {
                this.displayCell(x, y);
                this.instance.grid[x][y] !== -1 && this.displayPiece(x, y);
            }
        }
    }

    private displayCell(x: number, y: number): void {
        if (this.instance.flagGrid[x][y] !== 0) this.instance.ctx.fillStyle = this.instance.flagHexaColor[this.instance.flagGrid[x][y] - 1].hexaColor;
        else this.instance.ctx.fillStyle = this.instance.backgroundColor;

        this.instance.ctx.fillRect(this.instance.mx + x * this.instance.d, this.instance.my + y * this.instance.d, this.instance.d, this.instance.d);
        this.displayCellBorder(this.instance.mx + x * this.instance.d, this.instance.my + y * this.instance.d, this.instance.d);
    }

    private displayPiece(x: number, y: number): void {
        if (this.instance.grid[x][y] === 0) return;

        this.instance.ctx.fillStyle = this.instance.pieceHexaColor[this.instance.grid[x][y] - 1];
        this.instance.ctx.beginPath();
        this.instance.ctx.ellipse(
            this.instance.mx + x * this.instance.d + this.instance.d / 2,
            this.instance.my + y * this.instance.d + this.instance.d / 2,
            this.instance.d / 3,
            this.instance.d / 3,
            0,
            0,
            2 * Math.PI
        );
        this.instance.ctx.fill();
        this.instance.ctx.strokeStyle = "rgb(20, 20, 20)";
        this.instance.ctx.lineWidth = 2;
        this.instance.ctx.stroke();

        this.displayCellBorder(this.instance.mx + x * this.instance.d, this.instance.my + y * this.instance.d, this.instance.d);
    }

    private displayCellBorder(x: number, y: number, d: number): void {
        this.instance.ctx.strokeStyle = "rgb(100, 100, 100)";
        this.instance.ctx.lineWidth = this.instance.canvas.width <= 650 ? 2 : 4;
        this.instance.ctx.strokeRect(x, y, d, d);
    }
}