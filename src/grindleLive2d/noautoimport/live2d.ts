import type { RendererGameObj, Live2dCompOpt } from "./types"
import { Live2DCubismModel } from "./live2d-renderer/Live2DCubismModel.ts"
import type { Live2dRenderer } from "./Live2dRenderer.ts"

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function live2d(opt: Live2dCompOpt) {
    const { modelFile, k, options = {} } = opt
    const model = new Live2DCubismModel(k, options)
    let live2dRenderer: Live2dRenderer

    return {
        id: "live2d" as const,
        grindleLive2d: {
            async load(): Promise<void> {
                const obj = this as unknown as RendererGameObj
                await model.load(modelFile)
                live2dRenderer = await k.grindleLive2d.makeRenderer(k, model)
                live2dRenderer.gameObj = obj
            },
        },
        add(this: RendererGameObj): void {
            this.grindleLive2d.load = this.grindleLive2d.load.bind(this)
        },
    }
}
