import type { Csm } from "./CsmNamespace"
import type { MakeRendererOpt } from "./types"

export async function loadTexturesFromModelJson(
    opt: MakeRendererOpt,
): Promise<Csm.ModelJson["FileReferences"]["Textures"]> {
    const { rootDir, name } = opt
    const dir = `${rootDir}/${name}`
    const modelJsonRes = await fetch(`${dir}/${name}.model3.json`)
    const modelJson: Csm.ModelJson = await modelJsonRes.json()
    return modelJson.FileReferences.Textures
}
