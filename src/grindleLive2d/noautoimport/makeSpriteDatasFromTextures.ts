import type { KAPLAYCtx, SpriteData } from "kaplay"
import type { MakeRendererOpt } from "./types"

export async function makeSpriteDatasFromTextures(
    k: KAPLAYCtx,
    opt: MakeRendererOpt,
    textures: string[],
): Promise<SpriteData[]> {
    const v: SpriteData[] = []
    for (const file of textures) {
        const spriteData = await k.loadSprite(
            file,
            `${opt.rootDir}/${opt.name}/${file}`,
            {
                singular: true,
            },
        )
        v.push(spriteData)
    }
    return v
}
