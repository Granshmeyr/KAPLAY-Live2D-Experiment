import type { KAPLAYCtx } from "kaplay"
import type { Live2DCubismModel } from "./Live2DCubismModel.ts"
import { MotionPriority } from "./types.ts"
import { ERROR } from "./ERROR.ts"

export class TouchController {
    private declare k: KAPLAYCtx
    declare model: Live2DCubismModel
    declare startX: number
    declare startY: number
    declare lastX: number
    declare lastY: number

    constructor(k: KAPLAYCtx, model: Live2DCubismModel) {
        this.k = k
        this.model = model
        this.startX = this.startY = 0
        this.lastX = this.lastY = 0
    }

    touchStart = (posX: number, posY: number): void => {
        this.startX = this.lastX = posX
        this.startY = this.lastY = posY
    }

    touchMove = (posX: number, posY: number): void => {
        this.lastX = posX
        this.lastY = posY
    }

    getFlickDistance = (): number => {
        return this.calculateDistance(
            this.startX,
            this.startY,
            this.lastX,
            this.lastY,
        )
    }

    calculateDistance = (
        x1: number,
        y1: number,
        x2: number,
        y2: number,
    ): number => {
        return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
    }

    calculateMovingAmount = (x1: number, x2: number): number => {
        if (x1 > 0 !== x2 > 0) return 0
        return Math.sign(x1) * Math.min(Math.abs(x1), Math.abs(x2))
    }

    pointerDown = (event: PointerEvent): void => {
        if (this.model.paused) return
        const rect = this.k.canvas.getBoundingClientRect()
        const posX = event.clientX - rect.left
        const posY = event.clientY - rect.top
        this.touchStart(posX, posY)
    }

    pointerMove = (event: PointerEvent): void => {
        if (this.model.paused) return
        const rect = this.k.canvas.getBoundingClientRect()
        const posX = event.clientX - rect.left
        const posY = event.clientY - rect.top

        const x = this.model.transformX(this.lastX)
        const y = this.model.transformY(this.lastY)

        this.touchMove(posX, posY)
        this.model.setDragging(x, y)
    }

    pointerUp = (event: PointerEvent): void => {
        if (this.model.paused) return
        const rect = this.k.canvas.getBoundingClientRect()
        const posX = event.clientX - rect.left
        const posY = event.clientY - rect.top
        this.model.setDragging(0, 0)
        const x = this.model.transformX(posX)
        const y = this.model.transformY(posY)
        if (this.model.tapInteraction) this.tap(x, y)
    }

    tap = (x: number, y: number): void => {
        if (this.model.hitTest("Head", x, y)) {
            this.model.setRandomExpression()
        } else if (this.model.hitTest("Body", x, y)) {
            this.model.startRandomMotion("TapBody", MotionPriority.Normal)
        }

        const hitAreas = [] as string[]
        if (!this.model.settings) throw ERROR.settings
        for (let i = 0; i < this.model.settings.getHitAreasCount(); i++) {
            const drawId = this.model.settings.getHitAreaId(i)
            if (this.model.isHit(drawId, x, y)) {
                hitAreas.push(drawId.getString().s)
            }
        }
        this.model.emit("hit", hitAreas, x, y)
    }

    startInteractions = (): void => {
        if (!this.model.autoInteraction) return
        document.addEventListener("pointerdown", this.pointerDown, {
            passive: true,
        })
        document.addEventListener("pointermove", this.pointerMove, {
            passive: true,
        })
        document.addEventListener("pointerup", this.pointerUp, {
            passive: true,
        })
        document.addEventListener("pointercancel", this.pointerUp, {
            passive: true,
        })
    }

    cancelInteractions = (): void => {
        document.removeEventListener("pointerdown", this.pointerDown)
        document.removeEventListener("pointermove", this.pointerMove)
        document.removeEventListener("pointerup", this.pointerUp)
        document.removeEventListener("pointercancel", this.pointerUp)
    }

    initInteractions = (): void => {
        this.cancelInteractions()
        this.startInteractions()
    }
}
