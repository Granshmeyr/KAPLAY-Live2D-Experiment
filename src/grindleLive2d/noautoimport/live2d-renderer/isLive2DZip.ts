import JSZip from "jszip"
import fileType from "magic-bytes.js"

export const isLive2DZip = async (
    arrayBuffer: ArrayBuffer,
): Promise<boolean> => {
    let isZip = false
    const result = fileType(new Uint8Array(arrayBuffer))?.[0] || { mime: "" }
    if (result.mime === "application/zip") isZip = true
    if (!isZip) return false

    const zip = await JSZip.loadAsync(arrayBuffer)

    let hasModel = false
    let hasMoc3 = false
    let hasTexture = false

    for (const [relativePath, file] of Object.entries(zip.files)) {
        if (relativePath.startsWith("__MACOSX") || file.dir) continue
        if (relativePath.endsWith("model3.json")) hasModel = true
        if (relativePath.endsWith("moc3")) hasMoc3 = true
        if (relativePath.match(/\.(png|jpg|webp|avif)$/)) hasTexture = true
    }

    return hasModel && hasMoc3 && hasTexture
}
