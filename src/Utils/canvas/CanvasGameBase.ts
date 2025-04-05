import { Position } from "../models";

export class CanvasGameBase {
    canvas: HTMLCanvasElement;
    grid: number[][];
    ctx!: CanvasRenderingContext2D;
    FPS: number = 20;
    prevTick: number = 0;
    mouseX: number;
    mouseY: number;
    mx: number = 0;
    my: number = 0;
    d: number = 0;
    isRenderNeed: boolean = false;

    onCellClicked: ((x: number, y: number) => void) | null = null;
    onCellHover: ((x: number, y: number) => void) | null = null;

    constructor(canvas: HTMLCanvasElement, grid: number[][]) {
        this.canvas = canvas;
        this.grid = grid;

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

        this.d = Math.min(this.canvas.width / (this.grid.length + 1), (this.canvas.height) / (this.grid[0].length + 3));

        // Use to center the screen
        this.mx = (this.canvas.width - (this.d * this.grid.length)) / 2;
        this.my = 2*(this.canvas.height - (this.d * this.grid[0].length)) / 5;

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
        const x = Math.floor((mouseX - this.mx) / this.d);
        const y = Math.floor((mouseY - this.my) / this.d);

        if (x < 0 || x >= this.grid.length || y < 0 || y >= this.grid[0].length) {
            return null;
        }

        return { x, y };
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
