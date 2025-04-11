import { CsmCore } from "./CsmCore.ts"
import type { Csm } from "./CsmNamespace.d.ts"
import type { MakeRendererOpt } from "./types"

export async function loadModelFromMoc(
    opt: MakeRendererOpt,
): Promise<Csm.Model> {
    const { rootDir, name } = opt
    const dir = `${rootDir}/${name}`
    const mocRes = await fetch(`${dir}/${name}.moc3`)
    const mocArrayBuffer = await mocRes.arrayBuffer()
    const moc = CsmCore.Moc.fromArrayBuffer(mocArrayBuffer)
    return CsmCore.Model.fromMoc(moc)
}
