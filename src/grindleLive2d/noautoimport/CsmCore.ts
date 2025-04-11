import type { Csm as CsmNamespace } from "./CsmNamespace"

if (!("Live2DCubismCore" in window)) throw new Error()

export const CsmCore = window.Live2DCubismCore as CsmNamespace.Core
