/* eslint-disable filename-export/match-named-export */
import type { Live2DCubismCore } from "./live2dcubismcore"

export namespace Csm {
    export type Core = typeof Live2DCubismCore
    export type Model = Live2DCubismCore.Model
    export type ModelJson = {
        Version: 3
        FileReferences: {
            Moc: string
            Textures: string[]
            Physics: string
            DisplayInfo: string
            Motions: Record<
                string,
                {
                    File: string
                }[]
            >
        }
        Groups: {
            Target: string
            Name: string
            Ids: string[]
        }[]
        HitAreas: {
            Id: string
            Name: string
        }[]
    }
}
