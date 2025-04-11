import type { AnchorComp, GameObj, ScaleComp } from "kaplay"

export const hasComp = {
    scale: (obj: GameObj): obj is GameObj<ScaleComp> => obj.has("scale"),
    anchor: (obj: GameObj): obj is GameObj<AnchorComp> => obj.has("anchor"),
} as const
