import { Position } from "../models";
import DisplayTool from "./DisplayTool";

export class CanvasGameBase {
    public canvas: HTMLCanvasElement;
    protected displayMode: "GRID" | "HEXAGON";
    protected displayTool!: DisplayTool;
    public grid: number[][];
    public ctx!: CanvasRenderingContext2D;
    protected FPS: number = 20;
    protected prevTick: number = 0;
    protected mouseX: number;
    protected mouseY: number;
    public mx: number = 0;
    public my: number = 0;
    public d: number = 0;
    protected isRenderNeed: boolean = false;

    public onCellClicked: ((x: number, y: number) => void) | null = null;
    public onCellHover: ((x: number, y: number) => void) | null = null;

    public colorBackground: string = "rgb(120, 120, 120)";
    public pieceHexaColor = [
        "#fd0d34", // red
        "#3c8bda", // neutral blue
        "#ffbe33", // golden
        "#179374", // neutral green
        "#99abc2", // grey
    ];

    public flagHexaColor = [
        { persistent: true, zIndex: 1, hexaColor: "#a8a8a8" }, // Move available
        { persistent: true, zIndex: 2, hexaColor: "#ffcc4f" }, // Piece selected
        { persistent: false, zIndex: -1, hexaColor: "#888888" }, // Hover
        { persistent: true, zIndex: 0, hexaColor: "#585858" }, // Last move
    ];

    public flagGrid!: number[][];

    constructor(canvas: HTMLCanvasElement, grid: number[][], displayMode: "GRID" | "HEXAGON") {
        this.canvas = canvas;
        this.grid = grid;
        this.displayMode = displayMode;

        const context = this.canvas.getContext("2d");
        if (!context) {
            throw new Error("Failed to get 2D context from canvas.");
        }
        this.ctx = context;

        this.mouseX = 0;
        this.mouseY = 0;

        window.addEventListener("resize", () => {           
            this.resize(this.canvas.clientWidth, this.canvas.clientHeight);
        });

        this.resize(this.canvas.clientWidth, this.canvas.clientHeight);
    }

    protected render(): void {
        /*------------------------------FPS-----------------------------*/  
        window.requestAnimationFrame(() => this.render());
        const now = Math.round(this.FPS * Date.now() / 1000);
        if (now === this.prevTick) return;
        this.prevTick = now;
        /*--------------------------RENDER------------------------------*/
        if (!this.isRenderNeed) return; // Use to avoid too much rendering
        this.draw();
    }

    protected draw(): void {
        throw new Error("The draw method is not implemented.");
    }

    protected resize(width: number, height: number): void {
        const currentTime = Date.now();
        if (currentTime - this.prevTick < 1000) return;
        this.prevTick = currentTime;

        this.canvas.width = width;// - this.canvas.offsetLeft;
        this.canvas.height = height;// - this.canvas.offsetTop;

        if (this.displayMode === "GRID") {
            const paddingBlock = 2;
            this.d = Math.min(this.canvas.width / (this.grid.length+paddingBlock), (this.canvas.height) / (this.grid[0].length+paddingBlock));
            // Use to center the screen
            this.mx = (this.canvas.width - (this.d * this.grid.length)) / 2;
            this.my = (this.canvas.height - (this.d * this.grid[0].length)) / 2;
        }
        else {
            this.d = Math.min(this.canvas.width, this.canvas.height)/((this.grid.length + 2) * Math.sqrt(3));

            this.mx = -this.d + (this.canvas.width - (this.d * (this.grid.length + 2) * Math.sqrt(3))) / 2;
            this.my = (this.canvas.height - (this.grid[0].length * 1.5 * this.d)) / 2;
        }

        this.isRenderNeed = true;
    }

    private getMousePos(evt: MouseEvent): { x: number; y: number } {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top,
        };
    }

    private refreshMouseCoord(e: MouseEvent): void {
        const coord = this.getMousePos(e);

        this.mouseX = coord.x;
        this.mouseY = coord.y;
    }

    protected initEvent(): void {
        this.onMouseDown(() => this.handleMouseDown());
        this.onMouseHover(() => this.handleMouseHover());
    }

    private onMouseDown(callback: (e: MouseEvent) => void): void {        
        this.canvas.onmousedown = (e: MouseEvent) => {
            callback(e);
        };
    }

    private onMouseHover(callback: (e: MouseEvent) => void): void {        
        this.canvas.onmousemove = (e: MouseEvent) => {
            this.refreshMouseCoord(e);
            callback(e);
        };
    }

    private getGridCoordsFromMouseCoords(mouseX: number, mouseY: number): Position | null {
        return this.displayMode === "GRID" ? 
            this.getRegularGridCoordsFromMouseCoords(mouseX, mouseY)
                : 
            this.getHexagonGridCoordsFromMouseCoords(mouseX, mouseY);
    }

    private getRegularGridCoordsFromMouseCoords(mouseX: number, mouseY: number): Position | null {
        const x = Math.floor((mouseX - this.mx) / this.d);
        const y = Math.floor((mouseY - this.my) / this.d);

        if (x < 0 || x >= this.grid.length || y < 0 || y >= this.grid[0].length) {
            return null;
        }

        return { x, y };
    }

    private getHexagonGridCoordsFromMouseCoords(mouseX: number, mouseY: number): Position {
        let nearestGridCoord: Position = { x: 0, y: 0 };
        let minDistance = Infinity;
    
        for (let x = 0; x < this.grid.length; x++) {
            for (let y = 0; y < this.grid[0].length; y++) {
                const centerX = this.mx + x * (this.d * Math.sqrt(3)) + (y * 0.5 * (this.d * Math.sqrt(3)));
                const centerY = this.my + y * (1.5 * this.d);
    
                const distance = Math.sqrt((mouseX - centerX) ** 2 + (mouseY - centerY) ** 2);
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestGridCoord.x = x;
                    nearestGridCoord.y = y;
                }
            }
        }
    
        return nearestGridCoord;
    }

    private handleMouseDown(): void {
        this.onCellClicked && this.handleMouseAction(this.onCellClicked);
    }

    private handleMouseHover(): void {
        this.onCellHover && this.handleMouseAction(this.onCellHover);
    }

    private handleMouseAction(callback: (x: number, y: number) => void): void {
        const mouseCoords = this.getGridCoordsFromMouseCoords(this.mouseX, this.mouseY);
        if (!mouseCoords) return;
        const { x, y } = mouseCoords;

        callback(x, y);
        this.isRenderNeed = true;
    }
}
