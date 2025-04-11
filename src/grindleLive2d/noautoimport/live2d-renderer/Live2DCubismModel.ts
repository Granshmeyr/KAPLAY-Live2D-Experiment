import { CubismModelSettingJson } from "../../../framework/src/cubismmodelsettingjson.ts"
import { CubismDefaultParameterId } from "../../../framework/src/cubismdefaultparameterid.ts"
import type { ICubismModelSetting } from "../../../framework/src/icubismmodelsetting.ts"
import type {
    ACubismMotion,
    FinishedMotionCallback,
    BeganMotionCallback,
} from "../../../framework/src/motion/acubismmotion.ts"
import { CubismEyeBlink } from "../../../framework/src/effect/cubismeyeblink.ts"
import type { CubismIdHandle } from "../../../framework/src/id/cubismid.ts"
import {
    CubismBreath,
    BreathParameterData,
} from "../../../framework/src/effect/cubismbreath.ts"
import type { CubismMotionQueueEntryHandle } from "../../../framework/src/motion/cubismmotionqueuemanager.ts"
import { CubismMotionQueueManager } from "../../../framework/src/motion/cubismmotionqueuemanager.ts"
import { CubismFramework } from "../../../framework/src/live2dcubismframework.ts"
import { CubismViewMatrix } from "../../../framework/src/math/cubismviewmatrix.ts"
import { CubismMatrix44 } from "../../../framework/src/math/cubismmatrix44.ts"
import { CubismMoc } from "../../../framework/src/model/cubismmoc.ts"
import { csmVector } from "../../../framework/src/type/csmvector.ts"
import { csmMap } from "../../../framework/src/type/csmmap.ts"
import { Live2DCubismUserModel } from "./Live2DCubismUserModel.ts"
import { ERROR } from "./ERROR.ts"
import { WavFileController } from "./WavFileController.ts"
import { TouchController } from "./TouchController.ts"
import { MotionController } from "./MotionController.ts"
import { ExpressionController } from "./ExpressionController.ts"
import { CameraController } from "./CameraController.ts"
import type {
    Live2DModelOptions,
    Live2DBuffers,
    CubismCDI3Json,
    VTubeStudioJson,
    EventMap,
    CharacterPosition,
    PluggedK,
} from "./types.ts"
import fileType from "magic-bytes.js"
import JSZip from "jszip"
import path from "path-browserify"

export class Live2DCubismModel extends Live2DCubismUserModel {
    private events: {
        [event: string]: ((...args: unknown[]) => unknown)[]
    } = {}
    buffers: Live2DBuffers | null = null
    settings?: ICubismModelSetting
    vtubeSettings?: VTubeStudioJson
    displayInfo?: CubismCDI3Json
    logicalLeft?: number
    logicalRight?: number
    logicalBottom?: number
    logicalTop?: number
    audioContext: AudioContext
    connectNode?: AudioNode
    size?: number
    totalMotionCount: number = 0
    needsResize: boolean = false
    loaded: boolean = false
    cubismLoaded: boolean = false
    private declare k: PluggedK
    private declare _paused: boolean
    declare scaledYPos: boolean
    declare appendYOffset: number
    declare wavController: WavFileController
    declare touchController: TouchController
    declare motionController: MotionController
    declare expressionController: ExpressionController
    declare cameraController: CameraController
    declare enablePhysics: boolean
    declare enableEyeblink: boolean
    declare enableBreath: boolean
    declare enableLipsync: boolean
    declare enableMotion: boolean
    declare enableExpression: boolean
    declare enableMovement: boolean
    declare enablePose: boolean
    declare viewMatrix: CubismViewMatrix
    declare deviceToScreen: CubismMatrix44
    declare queueManager: CubismMotionQueueManager
    declare cubismCorePath: string
    declare autoAnimate: boolean
    declare autoInteraction: boolean
    declare tapInteraction: boolean
    declare randomMotion: boolean
    declare keepAspect: boolean
    declare speed: number
    declare motions: csmMap<string, ACubismMotion>
    declare expressions: csmMap<string, ACubismMotion>
    declare expressionIds: string[]
    declare motionIds: string[]
    declare eyeBlinkIds: csmVector<CubismIdHandle>
    declare lipSyncIds: csmVector<CubismIdHandle>

    on<K extends keyof EventMap>(event: K, listener: EventMap[K]): void {
        if (!this.events[event]) {
            this.events[event] = []
        }
        this.events[event].push((...args: unknown[]) => {
            const hitAreas = args[0] as string[]
            const x = args[1] as number
            const y = args[2] as number
            return listener(hitAreas, x, y)
        })
    }

    emit<K extends keyof EventMap>(
        event: K,
        ...args: Parameters<EventMap[K]>
    ): void {
        if (this.events[event]) {
            this.events[event].forEach((listener) => listener(...args))
        }
    }

    off<K extends keyof EventMap>(event: K, listener: EventMap[K]): void {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter(
                (l) => l !== listener,
            )
        }
    }

    get zoomEnabled(): boolean {
        return this.cameraController.zoomEnabled
    }

    set zoomEnabled(zoomEnabled: boolean) {
        this.cameraController.zoomEnabled = zoomEnabled
    }

    get minScale(): number {
        return this.cameraController.minScale
    }

    set minScale(minScale: number) {
        this.cameraController.minScale = minScale
    }

    get maxScale(): number {
        return this.cameraController.maxScale
    }

    set maxScale(maxScale: number) {
        this.cameraController.maxScale = maxScale
    }

    get panSpeed(): number {
        return this.cameraController.panSpeed
    }

    set panSpeed(panSpeed: number) {
        this.cameraController.panSpeed = panSpeed
    }

    get zoomStep(): number {
        return this.cameraController.zoomStep
    }

    set zoomStep(zoomStep: number) {
        this.cameraController.zoomStep = zoomStep
    }

    get scale(): number {
        return this.cameraController.scale
    }

    set scale(scale: number) {
        this.cameraController.scale = scale
    }

    get x(): number {
        return this.cameraController.x
    }

    set x(x: number) {
        this.cameraController.x = x
    }

    get y(): number {
        return this.cameraController.y
    }

    set y(y: number) {
        this.cameraController.y = y
    }

    get lipsyncSmoothing(): number {
        return this.wavController.smoothingFactor
    }

    set lipsyncSmoothing(lipsyncSmoothing: number) {
        this.wavController.smoothingFactor = lipsyncSmoothing
    }

    get volume(): number {
        return this.wavController.volumeNode.gain.value
    }

    set volume(volume: number) {
        this.wavController.volumeNode.gain.value = volume
    }

    get doubleClickReset(): boolean {
        return this.cameraController.doubleClickReset
    }

    set doubleClickReset(doubleClickReset: boolean) {
        this.cameraController.doubleClickReset = doubleClickReset
    }

    get paused(): boolean {
        return this._paused
    }

    set paused(paused: boolean) {
        if (paused) this.stopMotions()
        this._paused = paused
    }

    constructor(k: PluggedK, options: Live2DModelOptions) {
        super()
        this.k = k
        this.motions = new csmMap<string, ACubismMotion>()
        this.expressions = new csmMap<string, ACubismMotion>()
        this.expressionIds = []
        this.motionIds = []
        this.eyeBlinkIds = new csmVector<CubismIdHandle>()
        this.lipSyncIds = new csmVector<CubismIdHandle>()
        this.viewMatrix = new CubismViewMatrix()
        this.deviceToScreen = new CubismMatrix44()
        this.queueManager = new CubismMotionQueueManager()
        this.cubismCorePath =
            options.cubismCorePath ?? "/live2dcubismcore.min.js"
        this.mocConsistency = options.checkMocConsistency ?? true
        this.autoAnimate = options.autoAnimate ?? true
        this.autoInteraction = options.autoInteraction ?? true
        this.tapInteraction = options.tapInteraction ?? true
        this.keepAspect = options.keepAspect ?? false
        this.randomMotion = options.randomMotion ?? true
        this._paused = options.paused ?? false
        this.speed = options.speed ?? 1
        this.audioContext = options.audioContext ?? new AudioContext()
        this.scaledYPos = options.scaledYPos ?? false
        this.appendYOffset = options.appendYOffset ?? 0
        if (options.connectNode) this.connectNode = options.connectNode
        this.wavController = new WavFileController(this)
        this.touchController = new TouchController(k, this)
        this.motionController = new MotionController(this)
        this.expressionController = new ExpressionController(this)
        this.cameraController = new CameraController(k, this)
        this.cameraController.zoomEnabled = options.zoomEnabled ?? true
        this.cameraController.enablePan = options.enablePan ?? true
        this.cameraController.doubleClickReset =
            options.doubleClickReset ?? true
        this.cameraController.minScale = options.minScale ?? 0.1
        this.cameraController.maxScale = options.maxScale ?? 10
        this.cameraController.panSpeed = options.panSpeed ?? 1
        this.cameraController.zoomStep = options.zoomStep ?? 0.005
        this.cameraController.scale = options.scale ?? 1
        this.cameraController.x = options.x ?? this.k.canvas.width / 2
        this.cameraController.y = options.y ?? 0
        this.wavController.smoothingFactor = options.lipsyncSmoothing ?? 0.1
        this.wavController.volumeNode.gain.value = options.volume ?? 1
        this.enablePhysics = options.enablePhysics ?? true
        this.enableBreath = options.enableBreath ?? true
        this.enableEyeblink = options.enableEyeblink ?? true
        this.enableLipsync = options.enableLipsync ?? true
        this.enableMotion = options.enableMotion ?? true
        this.enableExpression = options.enableExpression ?? true
        this.enableMovement = options.enableMovement ?? true
        this.enablePose = options.enablePose ?? true
    }

    destroy = (destroyCubism: boolean = false): void => {
        this.motions.clear()
        this.expressions.clear()
        this.eyeBlinkIds.clear()
        this.lipSyncIds.clear()
        this.touchController.cancelInteractions()
        this.cameraController.removeListeners()
        this.expressionIds = []
        this.motionIds = []
        Object.keys(this.events).forEach((event) => {
            this.events[event] = []
        })
        if (this.buffers) {
            this.buffers.modelBuffer = null
            this.buffers.expressionBuffers = []
            this.buffers.physicsBuffer = null
            this.buffers.poseBuffer = null
            this.buffers.userDataBuffer = null
            this.buffers.motionGroups = []
        }
        this.buffers = null
        this.loaded = false
        this.cubismLoaded = false
        this.model.release()
        if (destroyCubism) CubismFramework.dispose()
    }

    loadCubismCore = async (): Promise<void> => {
        await new Promise<void>((resolve, reject) => {
            if (
                document.querySelector(`script[src="${this.cubismCorePath}"]`)
            ) {
                return resolve()
            }
            const script = document.createElement("script")
            script.src = this.cubismCorePath
            document.body.appendChild(script)
            script.onload = (): void => resolve()
            script.onerror = (err): void => reject(err)
        })
    }

    loadFramework = async (): Promise<void> => {
        CubismFramework.startUp({
            logFunction: (msg: string) => console.log(msg),
            loggingLevel: 5,
        })
        CubismFramework.initialize()
    }

    initializeCubism = async (): Promise<void> => {
        await this.loadCubismCore().catch(() => null)
        await this.loadFramework().catch(() => null)
        this.cubismLoaded = true
    }

    loadBuffers = async (
        link: string | ArrayBuffer,
    ): Promise<Live2DBuffers> => {
        let isZip = false
        let arrayBuffer =
            link instanceof ArrayBuffer ? link : new ArrayBuffer(0)
        if (typeof link === "string") {
            isZip = path.extname(link).replace(".", "") === "zip"
            arrayBuffer = await fetch(link)
                .then((r) => r.arrayBuffer())
                .catch(() => new ArrayBuffer(0))
        }
        if (!arrayBuffer.byteLength)
            return Promise.reject(`Failed to load ${link}`)

        const result = fileType(new Uint8Array(arrayBuffer))?.[0] || {
            mime: "",
        }
        if (result.mime === "application/zip") isZip = true

        const files = {} as { [key: string]: ArrayBuffer }
        const basename = link instanceof ArrayBuffer ? "." : path.dirname(link)

        if (isZip) {
            const zip = await JSZip.loadAsync(arrayBuffer)
            this.size = arrayBuffer.byteLength

            for (const [relativePath, file] of Object.entries(zip.files)) {
                if (relativePath.startsWith("__MACOSX") || file.dir) continue
                const key = relativePath.split("/").slice(1).join("/")
                const contents = await file.async("arraybuffer")
                files[key] = contents
                if (!this.settings && key.endsWith("model3.json"))
                    this.settings = new CubismModelSettingJson(
                        contents,
                        contents.byteLength,
                    )
                if (!this.vtubeSettings && key.endsWith("vtube.json"))
                    this.vtubeSettings = JSON.parse(await file.async("string"))
                if (!this.displayInfo && key.endsWith("cdi3.json"))
                    this.displayInfo = JSON.parse(await file.async("string"))
            }
        } else {
            this.settings = new CubismModelSettingJson(
                arrayBuffer,
                arrayBuffer.byteLength,
            )
        }

        const getBuffer = async (filename: string): Promise<ArrayBuffer> => {
            if (isZip) {
                const name = filename.startsWith(".")
                    ? filename.split("/").slice(2).join("/")
                    : filename
                let buffer = null as ArrayBuffer | null
                for (const [key, value] of Object.entries(files)) {
                    if (key.includes(name)) {
                        buffer = value
                        break
                    }
                }
                if (!buffer?.byteLength)
                    return Promise.reject(`Failed to load ${name}`)
                return buffer
            } else {
                const filePath = path.join(basename, filename)
                const buffer = await fetch(filePath)
                    .then((r) => r.arrayBuffer())
                    .catch(() => new ArrayBuffer(0))
                if (!buffer.byteLength)
                    return Promise.reject(`Failed to load ${filePath}`)
                return buffer
            }
        }

        const getBufferOptional = async (
            getFilenameFn: () => string,
        ): Promise<ArrayBuffer | null> => {
            try {
                const filename = getFilenameFn()
                return filename ? await getBuffer(filename) : null
            } catch {
                return null
            }
        }

        const getBufferArray = async (
            count: number,
            getFilenameFn: (index: number) => string,
        ): Promise<ArrayBuffer[]> => {
            const buffers = [] as ArrayBuffer[]
            for (let i = 0; i < count; i++) {
                buffers.push(await getBuffer(getFilenameFn(i)))
            }
            return buffers
        }

        if (!this.settings) throw ERROR.settings

        const modelBuffer = await getBuffer(this.settings.getModelFileName())
        this.size = modelBuffer.byteLength

        const physicsBuffer = await getBufferOptional(() => {
            if (!this.settings) throw ERROR.settings
            return this.settings.getPhysicsFileName()
        })
        const poseBuffer = await getBufferOptional(() => {
            if (!this.settings) throw ERROR.settings
            return this.settings.getPoseFileName()
        })
        const userDataBuffer = await getBufferOptional(() => {
            if (!this.settings) throw ERROR.settings
            return this.settings.getUserDataFile()
        })

        const expressionBuffers = []
        if (this.settings.getExpressionCount()) {
            expressionBuffers.push(
                ...(await getBufferArray(
                    this.settings.getExpressionCount(),
                    (i: number) => {
                        if (!this.settings) throw ERROR.settings
                        return this.settings.getExpressionFileName(i)
                    },
                )),
            )
            this.expressionIds = Array.from({
                length: this.settings.getExpressionCount(),
            }).map((_, i) => {
                if (!this.settings) throw ERROR.settings
                return this.settings.getExpressionFileName(i)
            })
        } else if (this.vtubeSettings) {
            this.expressionIds = this.vtubeSettings.Hotkeys.filter(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (h: any) => h.Action === "ToggleExpression",
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ).map((e: any) => e.File)
            expressionBuffers.push(
                ...(await getBufferArray(
                    this.expressionIds.length,
                    (i: number) => this.expressionIds[i],
                )),
            )
        }

        const motionGroups = []
        if (this.settings.getMotionGroupCount()) {
            for (let i = 0; i < this.settings.getMotionGroupCount(); i++) {
                const group = this.settings.getMotionGroupName(i)
                const motionBuffers = await getBufferArray(
                    this.settings.getMotionCount(group),
                    (i: number) => {
                        if (!this.settings) throw new Error()
                        return this.settings.getMotionFileName(group, i)
                    },
                )
                const wavBuffer = await getBufferOptional(() => {
                    if (!this.settings) throw new Error()
                    return this.settings.getMotionSoundFileName(group, i)
                })
                motionGroups.push({
                    group,
                    motionData: { motionBuffers, wavBuffer },
                })
                this.motionIds.push(
                    ...Array.from({
                        length: this.settings.getMotionCount(group),
                    }).map((_, i) => `${group}_${i}`),
                )
            }
        } else if (this.vtubeSettings) {
            const motions = [this.vtubeSettings.FileReferences.IdleAnimation]
            motions.push(
                ...this.vtubeSettings.Hotkeys.filter(
                    (h) => h.Action === "TriggerAnimation",
                ).map((e) => e.File),
            )
            for (let i = 0; i < motions.length; i++) {
                const buffer = await getBuffer(motions[i])
                motionGroups.push({
                    group: motions[i],
                    motionData: { motionBuffers: [buffer], wavBuffer: null },
                })
                this.motionIds.push(`${motions[i]}_0`)
            }
        }

        const textureBuffers: ArrayBuffer[] = []
        for (let i = 0; i < this.settings.getTextureCount(); i++) {
            const filename: string = this.settings.getTextureFileName(i)
            const buffer = await getBuffer(filename)
            textureBuffers.push(buffer)
        }

        this.buffers = {
            modelBuffer,
            expressionBuffers,
            physicsBuffer,
            poseBuffer,
            userDataBuffer,
            motionGroups,
            textureBuffers,
        }
        return this.buffers
    }

    load = async (link: string | ArrayBuffer): Promise<void> => {
        if (!this.cubismLoaded) await this.initializeCubism()
        const { modelBuffer, physicsBuffer, poseBuffer, userDataBuffer } =
            await this.loadBuffers(link)

        this.touchController.initInteractions()
        this.cameraController.initListeners()

        if (!modelBuffer) throw ERROR.modelBuffer
        this.loadModel(modelBuffer, this._mocConsistency)
        this.initialize()

        await this.expressionController.load()

        if (physicsBuffer) {
            this.loadPhysics(physicsBuffer, physicsBuffer.byteLength)
        }

        if (poseBuffer) {
            this.loadPose(poseBuffer, poseBuffer.byteLength)
        }

        if (!this.settings) throw ERROR.settings

        if (this.settings.getEyeBlinkParameterCount() > 0) {
            this.eyeBlink = CubismEyeBlink.create(this.settings)
        }

        this.breath = CubismBreath.create()
        const breathParameters = new csmVector<BreathParameterData>()

        const manager = CubismFramework?.getIdManager?.()
        const paramAngleX = manager?.getId(CubismDefaultParameterId.ParamAngleX)
        const paramAngleY = manager?.getId(CubismDefaultParameterId.ParamAngleY)
        const paramAngleZ = manager?.getId(CubismDefaultParameterId.ParamAngleZ)
        const paramBodyAngleX = manager?.getId(
            CubismDefaultParameterId.ParamBodyAngleX,
        )
        const paramBreath = manager?.getId(CubismDefaultParameterId.ParamBreath)
        if (paramAngleX)
            breathParameters.pushBack(
                new BreathParameterData(paramAngleX, 0.0, 15.0, 6.5345, 0.5),
            )
        if (paramAngleY)
            breathParameters.pushBack(
                new BreathParameterData(paramAngleY, 0.0, 8.0, 3.5345, 0.5),
            )
        if (paramAngleZ)
            breathParameters.pushBack(
                new BreathParameterData(paramAngleZ, 0.0, 10.0, 5.5345, 0.5),
            )
        if (paramBodyAngleX)
            breathParameters.pushBack(
                new BreathParameterData(
                    paramBodyAngleX,
                    0.0,
                    4.0,
                    15.5345,
                    0.5,
                ),
            )
        if (paramBreath)
            breathParameters.pushBack(
                new BreathParameterData(paramBreath, 0.5, 0.5, 3.2345, 1),
            )
        this.breath.setParameters(breathParameters)

        if (userDataBuffer) {
            this.loadUserData(userDataBuffer, userDataBuffer.byteLength)
        }

        const eyeBlinkCount = this.settings.getEyeBlinkParameterCount()
        for (let i = 0; i < eyeBlinkCount; ++i) {
            this.eyeBlinkIds.pushBack(this.settings.getEyeBlinkParameterId(i))
        }

        const lipSyncCount = this.settings.getLipSyncParameterCount()
        for (let i = 0; i < lipSyncCount; ++i) {
            this.lipSyncIds.pushBack(this.settings.getLipSyncParameterId(i))
        }
        if (!lipSyncCount) {
            const index = this.parameters.ids.indexOf("ParamMouthOpenY")
            if (index !== -1)
                this.lipSyncIds.pushBack(this.model.getParameterId(index))
            this.lipsync = Boolean(this.lipSyncIds.getSize())
        }

        const layout = new csmMap<string, number>()
        this.settings.getLayoutMap(layout)
        // unneeded (?)
        // this.modelMatrix.setupFromLayout(layout)

        await this.motionController.load()

        this.loaded = true
        this.resize()
        this.centerModel()
    }

    resize = (): void => {
        if (this.keepAspect) {
            const ratio = this.width / this.height
            if (this.k.canvas.width / this.k.canvas.height >= ratio) {
                // this.canvas.height = this.canvas.height
                this.k.canvas.width = this.k.canvas.height * ratio
            } else {
                // this.canvas.width = this.canvas.width
                this.k.canvas.height = this.k.canvas.width / ratio
            }
        } else {
            this.k.canvas.width = this.k.canvas.clientWidth
                ? this.k.canvas.clientWidth
                : this.k.canvas.width
            this.k.canvas.height = this.k.canvas.clientHeight
                ? this.k.canvas.clientHeight
                : this.k.canvas.height
        }

        const aspectRatio = this.k.canvas.width / this.k.canvas.height
        const logicalWidth = 2
        const logicalHeight = 2 / aspectRatio

        this.logicalLeft = -logicalWidth / 2
        this.logicalRight = logicalWidth / 2
        this.logicalBottom = -logicalHeight / 2
        this.logicalTop = logicalHeight / 2

        this.viewMatrix.setScreenRect(
            this.logicalLeft,
            this.logicalRight,
            this.logicalBottom,
            this.logicalTop,
        )
        this.viewMatrix.scale(1, 1)

        this.deviceToScreen.loadIdentity()
        if (this.k.canvas.width > this.k.canvas.height) {
            const screenW = Math.abs(this.logicalRight - this.logicalLeft)
            this.deviceToScreen.scaleRelative(
                screenW / this.k.canvas.width,
                -screenW / this.k.canvas.width,
            )
        } else {
            const screenH = Math.abs(this.logicalTop - this.logicalBottom)
            this.deviceToScreen.scaleRelative(
                screenH / this.k.canvas.height,
                -screenH / this.k.canvas.height,
            )
        }
        this.deviceToScreen.translateRelative(
            -this.k.canvas.width * 0.5,
            -this.k.canvas.height * 0.5,
        )

        this.viewMatrix.setMinScale(this.minScale)
        this.viewMatrix.setMaxScale(this.maxScale)
        this.viewMatrix.setMaxScreenRect(
            this.logicalLeft,
            this.logicalRight,
            this.logicalBottom,
            this.logicalTop,
        )
    }

    updateCamera = (): void => {
        const { x, y, scale } = this.cameraController

        if (
            !this.logicalLeft ||
            !this.logicalRight ||
            !this.logicalTop ||
            !this.logicalBottom
        )
            throw new Error()

        const logicalX =
            this.logicalLeft +
            (x / this.k.canvas.width) * (this.logicalRight - this.logicalLeft)
        const logicalY =
            this.logicalTop +
            (y / this.k.canvas.height) * (this.logicalTop - this.logicalBottom)

        const centerX = (this.logicalLeft + this.logicalRight) / 2

        this.viewMatrix.scale(scale, scale)
        this.viewMatrix.translate(
            centerX - logicalX,
            this.logicalTop - logicalY * (this.scaledYPos ? scale : 1),
        )
    }

    update = (): void => {
        if (!this.model) return
        // TODO: add check for KAPLAY liveliness
        // if (!this.model || this.webGLRenderer.contextLost()) return

        this.updateCamera()
        // TODO: convert to KAPLAY (unnecessary prob)
        // this.webGLRenderer.prepare()

        if (this.needsResize) {
            this.resize()
            this.needsResize = false
        }

        this.model.saveParameters()

        const motionUpdated = this.motionController.update(this.k.dt())
        this.expressionController.update(this.k.dt())

        if (!this.paused) {
            this.dragManager.update(this.k.dt())
            this.dragX = this.dragManager.getX()
            this.dragY = this.dragManager.getY()

            if (!motionUpdated) {
                if (this.eyeBlink != null && this.enableEyeblink) {
                    this.eyeBlink.updateParameters(this.model, this.k.dt())
                }
            }

            if (this.enableMovement) {
                const manager = CubismFramework.getIdManager?.()
                const paramAngleX = manager?.getId(
                    CubismDefaultParameterId.ParamAngleX,
                )
                const paramAngleY = manager?.getId(
                    CubismDefaultParameterId.ParamAngleY,
                )
                const paramAngleZ = manager?.getId(
                    CubismDefaultParameterId.ParamAngleZ,
                )
                const paramBodyAngleX = manager?.getId(
                    CubismDefaultParameterId.ParamBodyAngleX,
                )
                const paramEyeBallX = manager?.getId(
                    CubismDefaultParameterId.ParamEyeBallX,
                )
                const paramEyeBallY = manager?.getId(
                    CubismDefaultParameterId.ParamEyeBallY,
                )
                if (paramAngleX)
                    this.model.addParameterValueById(
                        paramAngleX,
                        this.dragX * 30,
                    )
                if (paramAngleY)
                    this.model.addParameterValueById(
                        paramAngleY,
                        this.dragY * 30,
                    )
                if (paramAngleZ)
                    this.model.addParameterValueById(
                        paramAngleZ,
                        this.dragX * this._dragY * -30,
                    )
                if (paramBodyAngleX)
                    this.model.addParameterValueById(
                        paramBodyAngleX,
                        this._dragX * 10,
                    )
                if (paramEyeBallX)
                    this.model.addParameterValueById(paramEyeBallX, this.dragX)
                if (paramEyeBallY)
                    this.model.addParameterValueById(paramEyeBallY, this.dragY)
            }

            if (this.breath != null && this.enableBreath) {
                this.breath.updateParameters(this.model, this.k.dt())
            }

            if (this.physics != null && this.enablePhysics) {
                this.physics.evaluate(this.model, this.k.dt())
            }

            if (this.lipsync && this.enableLipsync) {
                this.wavController.update(this.k.dt())
                const value = this.wavController.getRms()

                for (let i = 0; i < this.lipSyncIds.getSize(); ++i) {
                    const parameterIndex = this.model.getParameterIndex(
                        this.lipSyncIds.at(i),
                    )
                    const minValue =
                        this.model.getParameterMinimumValue(parameterIndex)
                    const maxValue =
                        this.model.getParameterMaximumValue(parameterIndex)
                    const scaledValue = minValue + (maxValue - minValue) * value
                    this.model.addParameterValueById(
                        this.lipSyncIds.at(i),
                        scaledValue,
                        0.8,
                    )
                }
            }

            if (this.pose != null && this.enablePose) {
                this.pose.updateParameters(this.model, this.k.dt())
            }
        }

        this.model.update()
        this.model.loadParameters()
        // TODO: convert to KAPLAY
        // this.webGLRenderer.draw()
    }

    // animationLoop = (): void => {
    //     this.update()
    //     if (!this.autoAnimate) return
    //     const loop = async (): Promise<void> => {
    //         this.update()
    //         id = window.requestAnimationFrame(loop)
    //     }
    //     loop()
    // }

    stopMotions = (): void => {
        if (!this.loaded) return
        this.motionController.stopMotions()
    }

    startMotion = async (
        group: string,
        i: number,
        priority: number,
        onStartMotion?: BeganMotionCallback,
        onEndMotion?: FinishedMotionCallback,
    ): Promise<CubismMotionQueueEntryHandle> => {
        return this.motionController.startMotion(
            group,
            i,
            priority,
            onStartMotion,
            onEndMotion,
        )
    }

    startRandomMotion = async (
        group: string | null,
        priority: number,
        onStartMotion?: BeganMotionCallback,
        onEndMotion?: FinishedMotionCallback,
    ): Promise<CubismMotionQueueEntryHandle> => {
        return this.motionController.startRandomMotion(
            group,
            priority,
            onStartMotion,
            onEndMotion,
        )
    }

    getExpressions = (): string[] => {
        return this.expressionIds
    }

    getMotions = (): string[] => {
        return this.motionIds
    }

    hasLipsync = (): boolean => {
        return this.lipsync
    }

    setExpression = (expression: string): void => {
        return this.expressionController.setExpression(expression)
    }

    setRandomExpression = (): void => {
        return this.expressionController.setRandomExpression()
    }

    inputAudio = async (
        wavBuffer: ArrayBuffer | AudioBuffer,
        playAudio = false,
    ): Promise<void> => {
        return this.wavController.start(wavBuffer, playAudio)
    }

    stopAudio = (): Promise<void> => {
        return this.wavController.stop()
    }

    hitTest = (areaName: string, x: number, y: number): boolean | undefined => {
        if (!this.loaded) return
        if (this.opacity < 1) return
        if (!this.settings) throw ERROR.settings
        for (let i = 0; i < this.settings.getHitAreasCount(); i++) {
            if (this.settings.getHitAreaName(i) === areaName) {
                const drawId = this.settings.getHitAreaId(i)
                return this.isHit(drawId, x, y)
            }
        }
    }

    isMocConsistent = (): boolean => {
        if (!this.buffers) throw ERROR.buffers
        const { modelBuffer } = this.buffers
        if (!modelBuffer) throw ERROR.modelBuffer
        return CubismMoc.hasMocConsistency(modelBuffer)
    }

    transformX = (pointX: number): number => {
        const screenX = this.deviceToScreen.transformX(pointX)
        return this.viewMatrix.invertTransformX(screenX)
    }

    transformY = (pointY: number): number => {
        const screenY = this.deviceToScreen.transformY(pointY)
        return this.viewMatrix.invertTransformY(screenY)
    }

    takeScreenshot = async (
        format: string = "png",
        faceCrop = false,
    ): Promise<string> => {
        this.centerModel()
        this.update()
        if (faceCrop) {
            const tempCanvas = document.createElement("canvas")
            const cropSize = this.k.canvas.width / 4
            tempCanvas.width = cropSize
            tempCanvas.height = cropSize

            const tempCtx = tempCanvas.getContext("2d")
            if (!tempCtx) throw new Error()
            const startX = (this.k.canvas.width - cropSize) / 2
            tempCtx.drawImage(
                this.k.canvas,
                startX,
                0,
                cropSize,
                cropSize,
                0,
                0,
                cropSize,
                cropSize,
            )

            return tempCanvas.toDataURL(`image/${format}`)
        } else {
            return this.k.canvas.toDataURL(`image/${format}`)
        }
    }

    zoomIn = (factor: number = 0.1): void => {
        return this.cameraController.zoomIn(factor)
    }

    zoomOut = (factor: number = 0.1): void => {
        return this.cameraController.zoomOut(factor)
    }

    centerModel = (): void => {
        this.x = this.k.canvas.width / 2
        this.y = 0
        this.update()

        const clonedCanvas = document.createElement("canvas")
        clonedCanvas.width = this.k.canvas.width / this.scale
        clonedCanvas.height = this.k.canvas.height / this.scale

        const ctx = clonedCanvas.getContext("2d")
        if (!ctx) throw new Error()
        ctx.scale(1 / this.scale, 1 / this.scale)
        ctx.drawImage(this.k.canvas, 0, 0)

        const imageData = ctx.getImageData(
            0,
            0,
            clonedCanvas.width,
            clonedCanvas.height,
        ).data

        let firstNonTransparentY = clonedCanvas.height
        let lastNonTransparentY = 0

        for (let y = 0; y < clonedCanvas.height; y++) {
            for (let x = 0; x < clonedCanvas.width; x++) {
                if (imageData[(y * clonedCanvas.width + x) * 4 + 3] !== 0) {
                    firstNonTransparentY = Math.min(firstNonTransparentY, y)
                    lastNonTransparentY = Math.max(lastNonTransparentY, y)
                }
            }
        }

        const characterHeight = lastNonTransparentY - firstNonTransparentY
        let marginHeight = this.k.canvas.height / 15 / this.scale
        const centerOffset =
            (characterHeight / 2) * (this.scale - 1) * this.scale
        let offsetY =
            firstNonTransparentY *
            (1.5 * this.scale ** this.scale) *
            (this.scale - 1)

        if (this.scaledYPos) {
            this.y =
                -firstNonTransparentY * 1.1 + marginHeight + this.appendYOffset
        } else {
            if (this.scale === 1) {
                offsetY = firstNonTransparentY - this.k.canvas.height / 15
                marginHeight = 0
            }
            this.y = centerOffset - marginHeight - offsetY + this.appendYOffset
        }
    }

    characterPosition = (): CharacterPosition => {
        const savedX = this.x
        const savedY = this.y
        this.x = this.k.canvas.width / 2
        this.y = 0
        this.update()

        const clonedCanvas = document.createElement("canvas")
        clonedCanvas.width = this.k.canvas.width / this.scale
        clonedCanvas.height = this.k.canvas.height / this.scale
        const ctx = clonedCanvas.getContext("2d")
        if (!ctx) throw new Error()
        ctx.scale(1 / this.scale, 1 / this.scale)
        ctx.drawImage(
            this.k.canvas,
            0,
            0,
            clonedCanvas.width,
            clonedCanvas.height,
        )
        this.x = savedX
        this.y = savedY

        const imageData = ctx.getImageData(
            0,
            0,
            clonedCanvas.width,
            clonedCanvas.height,
        ).data
        let firstNonTransparentY = clonedCanvas.height
        let lastNonTransparentY = 0

        for (let y = 0; y < clonedCanvas.height; y++) {
            for (let x = 0; x < clonedCanvas.width; x++) {
                if (imageData[(y * clonedCanvas.width + x) * 4 + 3] !== 0) {
                    firstNonTransparentY = Math.min(firstNonTransparentY, y)
                    lastNonTransparentY = Math.max(lastNonTransparentY, y)
                }
            }
        }

        const characterHeight = lastNonTransparentY - firstNonTransparentY
        const marginHeight = this.k.canvas.height / 15

        return {
            firstNonTransparentY,
            lastNonTransparentY,
            characterHeight,
            marginHeight,
        }
    }

    getParameterName = (parameter: string): string => {
        if (!this.displayInfo) return parameter
        return (
            this.displayInfo.Parameters.find((p) => p.Id === parameter)?.Name ??
            parameter
        )
    }

    getPartName = (part: string): string => {
        if (!this.displayInfo) return part
        return this.displayInfo.Parts.find((p) => p.Id === part)?.Name ?? part
    }

    getParameterNames = (): string[] => {
        return this.parameters.ids.map((id) => this.getParameterName(id))
    }

    getPartNames = (): string[] => {
        return this.parts.ids.map((id) => this.getPartName(id))
    }
}
