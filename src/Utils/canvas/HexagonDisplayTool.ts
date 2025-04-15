import { CanvasGameBase } from "./CanvasGameBase";
import DisplayTool from "./DisplayTool";

export default class HexagonDisplayTool implements DisplayTool {
    constructor(private instance: CanvasGameBase) {}

    public displayGrid(): void {
        for (let x = 0; x < this.instance.grid.length; x++) {
            for (let y = 0; y < this.instance.grid[0].length; y++) {
                const value = this.instance.grid[x][y];
    
                if (value === -1) continue;

                if (this.instance.flagGrid[x][y] !== 0) this.instance.ctx.fillStyle = this.instance.flagHexaColor[this.instance.flagGrid[x][y] - 1].hexaColor;
                else this.instance.ctx.fillStyle = this.instance.colorBackground;   
        
                const centerX = this.instance.mx + x * (this.instance.d * Math.sqrt(3)) + (y * 0.5 * (this.instance.d * Math.sqrt(3)));
                const centerY = this.instance.my + y * (1.5 * this.instance.d);
                this.displayHexagon(centerX, centerY);
                this.displayPiece(x, y, centerX, centerY);
            }
        }
    }

    private displayHexagon(a: number, b: number, showCenter = false) {
        this.instance.ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            this.instance.ctx.lineTo(
                a + this.instance.d * Math.cos((i * Math.PI) / 3 + (Math.PI / 2)),
                b + this.instance.d * Math.sin((i * Math.PI) / 3 + (Math.PI / 2))
            );
        }
        this.instance.ctx.closePath();
        this.instance.ctx.strokeStyle = "rgb(100, 100, 100)";
        this.instance.ctx.lineWidth = this.instance.canvas.width <= 650 ? 2 : 4;
        this.instance.ctx.stroke();
        this.instance.ctx.fill();
    
        if (showCenter) {
            this.instance.ctx.fillStyle = "black";
            this.instance.ctx.beginPath();
            this.instance.ctx.arc(a, b, this.instance.d * 0.1, 0, 2 * Math.PI);
            this.instance.ctx.fill();
        }
    }

    private displayPiece(x: number, y: number, px: number, py: number): void {
        if (this.instance.grid[x][y] === 0) return;

        this.instance.ctx.fillStyle = this.instance.pieceHexaColor[this.instance.grid[x][y] - 1];
        this.instance.ctx.beginPath();
        this.instance.ctx.ellipse(
            px-1, py,
            3*this.instance.d/5,
            3*this.instance.d/5,
            0,
            0,
            2 * Math.PI
        );
        this.instance.ctx.fill();
        this.instance.ctx.strokeStyle = "rgb(20, 20, 20)";
        this.instance.ctx.lineWidth = 2;
        this.instance.ctx.stroke();
    }
}