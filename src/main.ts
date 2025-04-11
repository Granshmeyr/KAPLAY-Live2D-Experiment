import kaplay from "kaplay"
import { grindleLive2d } from "./grindleLive2d/index.ts"

async function main(): Promise<void> {
    const k = kaplay({
        global: false,
        background: "ff00ff",
        tagsAsComponents: false,
        width: 1080,
        height: 1920,
        letterbox: true,
        crisp: false,
        texFilter: "linear",
        pixelDensity: 3,
        debugKey: "i",
        plugins: [grindleLive2d],
    })
    k.debug.inspect = true

    const obj = k.add([
        k.pos(),
        k.z(99),
        k.scale(1),
        k.anchor("center"),
        k.grindleLive2d.live2d({
            k,
            modelFile: "moc/Hiyori/Hiyori.model3.json",
            options: {
                enableLipsync: false,
                keepAspect: false,
            },
        }),
    ])

    obj.onUpdate(() => {
        obj.pos = k.mousePos()
    })

    const beanSpriteData = await k.loadBean()
    const bean = k.add([
        k.sprite("bean", {
            width: beanSpriteData.width * 4,
            height: beanSpriteData.height * 4,
        }),
        k.pos(),
        k.anchor("center"),
        k.z(99),
    ])
    bean.onUpdate(() => {
        bean.pos = k.center().sub(k.mousePos().sub(k.center()))
    })
    bean.onMousePress("left", () => {
        if (bean.z === 99) bean.z = -99
        else bean.z = 99
    })

    await obj.grindleLive2d.load()
}

main()
