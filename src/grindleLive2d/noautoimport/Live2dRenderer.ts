import type { SpriteData } from "kaplay"
import { type Anchor, type KAPLAYCtx, type Vec2 } from "kaplay"
import type { RendererGameObj, Live2dRendererOpt } from "./types"
import { float32CoordArrayAsVec2 } from "./float32CoordArrayAsVec2.ts"
import { hasComp } from "./hasComp.ts"
import { sortNumberArrayAndInvertKV } from "./sortNumberArrayAndInvertKV.ts"
import type { Live2DCubismModel } from "./live2d-renderer/Live2DCubismModel.ts"
import { ERROR } from "./live2d-renderer/ERROR.ts"

// TODO: add destroy functionality
export class Live2dRenderer {
    private flippedUvs: readonly Vec2[][] = []
    gameObj?: RendererGameObj
    private declare k: KAPLAYCtx
    private declare model: Live2DCubismModel
    private declare spriteDatas: SpriteData[]

    constructor(k: KAPLAYCtx, opt: Live2dRendererOpt) {
        const { model, spriteDatas } = opt
        this.k = k
        this.model = model
        this.spriteDatas = spriteDatas

        // CONST: Uvs don't account for quad position and assume { singular: true } for spriteData
        const cachedFlippedUvs: Vec2[][] = []
        for (let i = 0; i < this.model.drawables.count; i++) {
            const { tex, frames } =
                this.spriteDatas[this.model.drawables.textureIndices[i]]
            const uvs = float32CoordArrayAsVec2(
                this.k,
                this.model.drawables.vertexUvs[i],
            )
            const v = uvs.map((uv) => {
                const pos = this.k.vec2(tex.width, tex.height).scale(uv)
                const midPoint = this.k.vec2(tex.width * uv.x, tex.height / 2)
                const diffY = midPoint.y - pos.y
                const flippedPos = midPoint.add(0, diffY)
                const quad = frames[0]
                return flippedPos
                    .invScale(tex.width, tex.height)
                    .scale(quad.w, quad.h)
                    .add(quad.x, quad.y)
            })
            cachedFlippedUvs.push(v)
        }
        this.flippedUvs = cachedFlippedUvs

        this.k.onDraw(() => {
            const orderedIndices: number[] = sortNumberArrayAndInvertKV(
                Array.from(this.model.drawables.renderOrders),
            )

            for (const i of orderedIndices) {
                const hasMask = this.model.drawables.maskCounts[i] > 0

                if (hasMask)
                    this.k.drawMasked(
                        () => this.drawDrawable(i),
                        () => {
                            const maskIndices: number[] = Array.from(
                                this.model.drawables.masks[i],
                            )
                            maskIndices.forEach((i) => this.drawDrawable(i))
                        },
                    )
                else this.drawDrawable(i)
            }
        })

        this.k.onFixedUpdate(() => {
            this.model.update()
        })
    }

    drawDrawable(index: number): void {
        const i = index
        const { tex } = this.spriteDatas[this.model.drawables.textureIndices[i]]

        const pts = float32CoordArrayAsVec2(
            this.k,
            this.model.drawables.vertexPositions[i],
        ).map((pt) => pt.scale(tex.width, tex.height))
        const flippedPts = pts.map((pt) => {
            const midPoint = this.k.vec2(pt.x, tex.height / 2)
            const diffY = midPoint.y - pt.y
            return midPoint.add(0, diffY)
        })
        const scale = this.gameObj
            ? hasComp.scale(this.gameObj)
                ? this.gameObj.scale
                : this.k.vec2(1)
            : this.k.vec2(1)
        const offset = ((): Vec2 => {
            if (this.gameObj && hasComp.anchor(this.gameObj)) {
                const v: Vec2 | Anchor = this.gameObj.anchor
                if (typeof v === "object") return v
                if (v === "top") return this.k.vec2()
                if (v === "topleft") return this.k.vec2(tex.width / 2, 0)
                if (v === "center") return this.k.vec2(0, -tex.height / 2)
            }
            return this.k.vec2(tex.width / 2, 0)
        })()

        this.k.drawPolygon({
            pts: flippedPts,
            uv: this.flippedUvs[i],
            tex,
            indices: Array.from(this.model.drawables.indices[i]),
            pos: this?.gameObj?.pos ?? this.k.vec2(),
            scale,
            offset,
            opacity: this.model.drawables.opacities[i],
        })
    }

    static async make(
        k: KAPLAYCtx,
        model: Live2DCubismModel,
    ): Promise<Live2dRenderer> {
        if (!model.buffers?.textureBuffers) throw ERROR.buffers
        if (!model.settings) throw ERROR.settings

        const spriteDatas: SpriteData[] = []
        for (let i = 0; i < model.settings.getTextureCount(); i++) {
            const buffer = model.buffers.textureBuffers[i]
            const blob = new Blob([buffer])
            const url = URL.createObjectURL(blob)
            const textureName = model.settings.getTextureFileName(i)
            const spriteData = await k.loadSprite(textureName, url)
            spriteDatas.push(spriteData)
            URL.revokeObjectURL(url)
        }

        return new Live2dRenderer(k, { model, spriteDatas })
    }
}
