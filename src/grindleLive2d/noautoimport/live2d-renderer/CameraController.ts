import type { KAPLAYCtx } from "kaplay"
import type { Live2DCubismModel } from "./Live2DCubismModel"

export class CameraController {
    zoomEnabled: boolean = false
    enablePan: boolean = false
    doubleClickReset: boolean = false
    private declare k: KAPLAYCtx
    declare model: Live2DCubismModel
    declare x: number
    declare y: number
    declare scale: number
    declare minScale: number
    declare maxScale: number
    declare zoomStep: number
    declare panSpeed: number
    declare isPanning: boolean
    declare lastPosition: { x: number; y: number }

    constructor(k: KAPLAYCtx, model: Live2DCubismModel) {
        this.k = k
        this.model = model
        this.x = k.canvas.width / 2
        this.y = 0
        this.scale = 1
        this.minScale = 0.1
        this.maxScale = 10
        this.isPanning = false
        this.lastPosition = { x: 0, y: 0 }
        this.zoomStep = 0.005
        this.panSpeed = 1
    }

    zoomIn = (factor = 0.1): void => {
        if (!this.zoomEnabled) return
        const zoomFactor = 1 + factor
        const newScale = Math.min(this.scale * zoomFactor, this.maxScale)

        const worldX = (this.x - this.k.canvas.width / 2) / this.scale
        const worldY = this.y / this.scale

        this.scale = newScale
        this.x = this.k.canvas.width / 2 + worldX * this.scale
        this.y = worldY * this.scale
    }

    zoomOut = (factor = 0.1): void => {
        if (!this.zoomEnabled) return
        const zoomFactor = 1 - factor
        const newScale = Math.max(this.scale * zoomFactor, this.minScale)

        const worldX = (this.x - this.k.canvas.width / 2) / this.scale
        const worldY = this.y / this.scale

        this.scale = newScale
        this.x = this.k.canvas.width / 2 + worldX * this.scale
        this.y = worldY * this.scale
    }

    handleMouseDown = (event: MouseEvent): void => {
        if (!this.enablePan) return
        this.isPanning = true
        this.lastPosition = { x: event.clientX, y: event.clientY }
    }

    handleMouseMove = (event: MouseEvent): void => {
        if (!this.enablePan) return
        if (this.isPanning) {
            const dx = event.clientX - this.lastPosition.x
            const dy = event.clientY - this.lastPosition.y

            this.x -= dx * this.panSpeed
            this.y += dy * this.panSpeed

            this.lastPosition = { x: event.clientX, y: event.clientY }
        }
    }

    handleMouseUp = (): void => {
        if (!this.enablePan) return
        this.isPanning = false
    }

    handleWheel = (event: WheelEvent): void => {
        if (!this.zoomEnabled) return
        event.preventDefault()
        const delta = event.deltaY
        const scaleFactor = Math.pow(2, -delta * this.zoomStep)
        const newScale = Math.max(
            this.minScale,
            Math.min(this.scale * scaleFactor, this.maxScale),
        )

        const bounds = this.k.canvas.getBoundingClientRect()
        const mouseX = bounds.width - (event.clientX - bounds.left)
        const mouseY = event.clientY - bounds.top - bounds.height / 2

        const worldX = (mouseX - this.x) / this.scale
        const worldY = (mouseY - this.y) / this.scale

        this.scale = newScale
        this.x = mouseX - worldX * newScale
        this.y = mouseY - worldY * newScale
    }

    handleDoubleClick = (): void => {
        if (this.doubleClickReset) {
            this.x = this.k.canvas.width / 2
            this.y = 0
            this.isPanning = false
            this.lastPosition = { x: 0, y: 0 }
            this.scale = 1
            this.model.centerModel()
        }
    }

    addListeners = (): void => {
        this.k.canvas.addEventListener("wheel", this.handleWheel)
        this.k.canvas.addEventListener("mousedown", this.handleMouseDown)
        window.addEventListener("mousemove", this.handleMouseMove)
        window.addEventListener("mouseup", this.handleMouseUp)
        this.k.canvas.addEventListener("dblclick", this.handleDoubleClick)
        this.k.canvas.addEventListener("contextmenu", (event) =>
            event.preventDefault(),
        )
    }

    removeListeners = (): void => {
        this.k.canvas.removeEventListener("wheel", this.handleWheel)
        this.k.canvas.removeEventListener("mousedown", this.handleMouseDown)
        window.removeEventListener("mousemove", this.handleMouseMove)
        window.removeEventListener("mouseup", this.handleMouseUp)
        this.k.canvas.removeEventListener("dblclick", this.handleDoubleClick)
        this.k.canvas.removeEventListener("contextmenu", (event) =>
            event.preventDefault(),
        )
    }

    initListeners = (): void => {
        this.removeListeners()
        this.addListeners()
    }
}
