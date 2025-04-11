/* eslint-disable filename-export/match-named-export */
import type { AnchorComp, GameObj, KAPLAYCtx, PosComp, ScaleComp } from "kaplay"
import type { live2d } from "./live2d.ts"
import type { Live2dRenderer } from "./Live2dRenderer.ts"
import type { Live2DModelOptions } from "./live2d-renderer/types.ts"
import type { grindleLive2d } from "./grindleLive2d.ts"

export type Live2dRendererOpt = {
    model: Live2DCubismModel
    spriteDatas: SpriteData[]
}

type GrindleLive2dComp = {
    id: "live2d"
    grindleLive2d: {
        load(this: RendererGameObj): Promise<void>
    }
}

export type RendererGameObj =
    | GameObj<PosComp | GrindleLive2dComp>
    | GameObj<PosComp | AnchorComp | GrindleLive2dComp>
    | GameObj<PosComp | AnchorComp | ScaleComp | GrindleLive2dComp>

export type MakeRendererOpt = {
    rootDir: string
    name: string
}

export type Live2dComp = ReturnType<typeof live2d>

export type Live2dCompOpt = {
    k: PluggedK
    modelFile: string
    options?: Live2DModelOptions
}

export namespace GrindleLive2D {
    export type { Live2dRenderer }
}

type PluggedK = KAPLAYCtx & ReturnType<typeof grindleLive2d>
