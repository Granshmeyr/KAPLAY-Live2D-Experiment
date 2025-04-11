import JSZip from "jszip"
import fileType from "magic-bytes.js"

export const compressLive2DTextures = async (
    arrayBuffer: ArrayBuffer,
    maxSize = 8192,
    quality = 0.8,
    format = "webp",
): Promise<ArrayBuffer> => {
    const result = fileType(new Uint8Array(arrayBuffer))?.[0] || { mime: "" }
    if (result.mime !== "application/zip") return arrayBuffer

    const zip = await JSZip.loadAsync(arrayBuffer)
    const newZip = new JSZip()

    for (const [relativePath, file] of Object.entries(zip.files)) {
        if (relativePath.startsWith("__MACOSX") || file.dir) continue

        if (relativePath.endsWith("model3.json")) {
            const json = JSON.parse(await file.async("string"))
            for (let i = 0; i < json.FileReferences.Textures?.length; i++) {
                const texture = json.FileReferences.Textures[i]
                json.FileReferences.Textures[i] = texture.replace(
                    /\.(png|jpg|webp|avif)$/,
                    `.${format}`,
                )
            }
            newZip.file(relativePath, JSON.stringify(json, null, 4))
        } else if (relativePath.match(/\.(png|jpg|webp|avif)$/)) {
            const blob = await file.async("blob")
            const image = await createImageBitmap(blob)

            const canvas = document.createElement("canvas")
            const ctx = canvas.getContext("2d")
            if (image.width > maxSize || image.height > maxSize) {
                const aspectRatio = image.width / image.height
                if (image.width > image.height) {
                    canvas.width = maxSize
                    canvas.height = maxSize / aspectRatio
                } else {
                    canvas.height = maxSize
                    canvas.width = maxSize * aspectRatio
                }
            } else {
                canvas.width = image.width
                canvas.height = image.height
            }
            ctx!.drawImage(image, 0, 0, canvas.width, canvas.height)

            const newBlob = await new Promise<Blob>((resolve) =>
                canvas.toBlob(
                    resolve as BlobCallback,
                    `image/${format}`,
                    quality,
                ),
            )
            newZip.file(
                relativePath.replace(/\.(png|jpg|webp|avif)$/, `.${format}`),
                newBlob,
            )
        } else {
            newZip.file(relativePath, await file.async("arraybuffer"))
        }
    }
    const newBuffer = await newZip.generateAsync({ type: "arraybuffer" })
    return newBuffer
}
