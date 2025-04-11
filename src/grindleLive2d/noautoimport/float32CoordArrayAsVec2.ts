import type { KAPLAYCtx, Vec2 } from "kaplay"

export function float32CoordArrayAsVec2(
    k: KAPLAYCtx,
    arr: Float32Array<ArrayBufferLike>,
): Vec2[] {
    const result: Vec2[] = []
    for (let i = 0; i < arr.length; i += 2) {
        if (i + 1 < arr.length) {
            const x = arr[i]
            const y = arr[i + 1]
            result.push(k.vec2(x, y))
        }
    }
    return result
}
