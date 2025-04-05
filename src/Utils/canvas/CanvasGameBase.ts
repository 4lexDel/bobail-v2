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

    onMouseDown(callback: (e: MouseEvent) => void): void {        
        this.canvas.onmousedown = (e: MouseEvent) => {
            this.refreshMouseCoord(e);
            callback(e);
        };
    }

    resize(width: number, height: number): void {
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

    getMousePos(evt: MouseEvent): { x: number; y: number } {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top,
        };
    }

    refreshMouseCoord(e: MouseEvent): void {
        const coord = this.getMousePos(e);

        this.mouseX = coord.x;
        this.mouseY = coord.y;
    }
}
