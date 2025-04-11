import { ACubismMotion } from "../../../framework/src/motion/acubismmotion.ts"
import type { Live2DCubismModel } from "./Live2DCubismModel.ts"
import { ERROR } from "./ERROR.ts"

export class ExpressionController {
    declare model: Live2DCubismModel

    constructor(model: Live2DCubismModel) {
        this.model = model
    }

    load = async (): Promise<void> => {
        if (!this.model.buffers) throw ERROR.buffers
        const { expressionBuffers } = this.model.buffers

        for (let i = 0; i < expressionBuffers.length; i++) {
            const name = this.model.expressionIds[i]
            const expressionBuffer = expressionBuffers[i]
            const motion = this.model.loadExpression(
                expressionBuffer,
                expressionBuffer.byteLength,
                name,
            )

            if (this.model.expressions.getValue(name) != null) {
                ACubismMotion.delete(this.model.expressions.getValue(name))
                // @ts-expect-error idk why null passed
                this.model.expressions.setValue(name, null)
            }
            this.model.expressions.setValue(name, motion)
        }
    }

    update = (deltaTime: DOMHighResTimeStamp): void => {
        if (
            this.model.expressionManager != null &&
            this.model.enableExpression
        ) {
            this.model.expressionManager.updateMotion(
                this.model.model,
                deltaTime,
            )
        }
    }

    setExpression = (expression: string): void => {
        const motion = this.model.expressions.getValue(expression)
        if (motion != null)
            this.model.expressionManager.startMotion(motion, false)
    }

    setRandomExpression = (): void => {
        if (!this.model.expressions.getSize()) return
        const rand = Math.floor(
            Math.random() * this.model.expressions.getSize(),
        )
        const name = this.model.expressions._keyValues[rand].first
        this.setExpression(name)
    }
}
