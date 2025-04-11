import { makePluginFactory } from "./makePluginFactory.ts"
import { kCtxProvider } from "./kCtxProvider.ts"

export const grindleLive2d = makePluginFactory("grindleLive2d")((_k) => {
    return kCtxProvider(_k)
})
