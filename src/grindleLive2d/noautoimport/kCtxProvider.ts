import type { KAPLAYCtx } from "kaplay"
import { live2d } from "./live2d.ts"
import { Live2dRenderer } from "./Live2dRenderer.ts"

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function kCtxProvider(_k: KAPLAYCtx) {
    return {
        live2d,
        makeRenderer: Live2dRenderer.make,
    } as const
}
