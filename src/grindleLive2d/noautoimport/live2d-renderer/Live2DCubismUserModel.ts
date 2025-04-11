import type { CubismBreath } from "../../../framework/src/effect/cubismbreath.ts"
import type { CubismEyeBlink } from "../../../framework/src/effect/cubismeyeblink.ts"
import type { CubismPose } from "../../../framework/src/effect/cubismpose.ts"
import type { CubismModelMatrix } from "../../../framework/src/math/cubismmodelmatrix.ts"
import type { CubismTargetPoint } from "../../../framework/src/math/cubismtargetpoint.ts"
import type { CubismModel } from "../../../framework/src/model/cubismmodel.ts"
import type { CubismModelUserData } from "../../../framework/src/model/cubismmodeluserdata.ts"
import { CubismUserModel } from "../../../framework/src/model/cubismusermodel.ts"
import type { CubismExpressionMotionManager } from "../../../framework/src/motion/cubismexpressionmotionmanager.ts"
import type { CubismMotionManager } from "../../../framework/src/motion/cubismmotionmanager.ts"
import type { CubismPhysics } from "../../../framework/src/physics/cubismphysics.ts"
import type { ModelDrawables, ModelParameters, ModelParts } from "./types.ts"

export class Live2DCubismUserModel extends CubismUserModel {
    defaultPartOpacities!: Float32Array

    constructor() {
        super()
    }

    initialize(): void {
        this.model.initialize()
        this.defaultPartOpacities = structuredClone(this.parts.opacities)
    }

    get accelerationX(): number {
        return this._accelerationX
    }

    set accelerationX(accelerationX) {
        this._accelerationX = accelerationX
    }

    get accelerationY(): number {
        return this._accelerationY
    }

    set accelerationY(accelerationY) {
        this._accelerationY = accelerationY
    }

    get accelerationZ(): number {
        return this._accelerationZ
    }

    set accelerationZ(accelerationZ) {
        this._accelerationZ = accelerationZ
    }

    get breath(): CubismBreath {
        return this._breath
    }

    set breath(breath) {
        this._breath = breath
    }

    get dragManager(): CubismTargetPoint {
        return this._dragManager
    }

    set dragManager(dragManager) {
        this._dragManager = dragManager
    }

    get dragX(): number {
        return this._dragX
    }

    set dragX(dragX) {
        this._dragX = dragX
    }

    get dragY(): number {
        return this._dragY
    }

    set dragY(dragY) {
        this._dragY = dragY
    }

    get expressionManager(): CubismExpressionMotionManager {
        return this._expressionManager
    }

    set expressionManager(expressionManager) {
        this._expressionManager = expressionManager
    }

    get eyeBlink(): CubismEyeBlink {
        return this._eyeBlink
    }

    set eyeBlink(eyeBlink) {
        this._eyeBlink = eyeBlink
    }

    get initialized(): boolean {
        return this._initialized
    }

    set initialized(initialized) {
        this._initialized = initialized
    }

    get lastLipSyncValue(): number {
        return this._lastLipSyncValue
    }

    set lastLipSyncValue(lastLipSyncValue) {
        this._lastLipSyncValue = lastLipSyncValue
    }

    get lipsync(): boolean {
        return this._lipsync
    }

    set lipsync(lipsync) {
        this._lipsync = lipsync
    }

    get moc(): never {
        return this.moc
    }

    set moc(moc) {
        this._moc = moc
    }

    get mocConsistency(): boolean {
        return this._mocConsistency
    }

    set mocConsistency(mocConsistency) {
        this._mocConsistency = mocConsistency
    }

    get modelMatrix(): CubismModelMatrix {
        return this._modelMatrix
    }

    set modelMatrix(modelMatrix) {
        this._modelMatrix = modelMatrix
    }

    get modelUserData(): CubismModelUserData {
        return this._modelUserData
    }

    set modelUserData(modelUserData) {
        this._modelUserData = modelUserData
    }

    get model(): CubismModel {
        return this._model
    }

    set model(model) {
        this._model = model
    }

    get motionManager(): CubismMotionManager {
        return this._motionManager
    }

    set motionManager(motionManager) {
        this._motionManager = motionManager
    }

    get opacity(): number {
        return this._opacity
    }

    set opacity(opacity) {
        this._opacity = opacity
    }

    get pose(): CubismPose {
        return this._pose
    }

    set pose(pose) {
        this._pose = pose
    }

    get physics(): CubismPhysics {
        return this._physics
    }

    set physics(physics) {
        this._physics = physics
    }

    get updating(): boolean {
        return this._updating
    }

    set updating(updating) {
        this._updating = updating
    }

    get parameters(): ModelParameters {
        // @ts-expect-error private access
        const model = this.model._model
        return model.parameters
    }

    getParameterValue = (parameter: string): number => {
        const index = this.parameters.ids.indexOf(parameter)
        return this.model.getParameterValueByIndex(index)
    }

    setParameter = (parameter: string, value: number): void => {
        const index = this.parameters.ids.indexOf(parameter)
        this.model.setParameterValueByIndex(index, value)
        this.model.update()
    }

    resetParameters = (): void => {
        for (let i = 0; i < this.parameters.defaultValues.length; i++) {
            this.model.setParameterValueByIndex(
                i,
                this.parameters.defaultValues[i],
            )
        }
        this.model.update()
    }

    get parts(): ModelParts {
        // @ts-expect-error private access
        const model = this.model._model
        return model.parts
    }

    getPartOpacity = (part: string): number => {
        const index = this.parts.ids.indexOf(part)
        return this.model.getPartOpacityByIndex(index)
    }

    setPartOpacity = (part: string, opacity: number): void => {
        const index = this.parts.ids.indexOf(part)
        this.model.setPartOpacityByIndex(index, opacity)
        this.model.update()
    }

    resetPartOpacities = (): void => {
        for (let i = 0; i < this.defaultPartOpacities.length; i++) {
            this.model.setPartOpacityByIndex(i, this.defaultPartOpacities[i])
        }
        this.model.update()
    }

    get drawables(): ModelDrawables {
        // @ts-expect-error private access
        const model = this.model._model
        return model.drawables
    }

    get width(): number {
        // @ts-expect-error private access
        const model = this.model._model
        return model.canvasinfo.CanvasWidth
    }

    get height(): number {
        // @ts-expect-error private access
        const model = this.model._model
        return model.canvasinfo.CanvasHeight
    }

    get originX(): number {
        // @ts-expect-error private access
        const model = this.model._model
        return model.canvasinfo.CanvasOriginX
    }

    get originY(): number {
        // @ts-expect-error private access
        const model = this.model._model
        return model.canvasinfo.CanvasOriginY
    }

    get pixelsPerUnit(): number {
        // @ts-expect-error private access
        const model = this.model._model
        return model.canvasinfo.PixelsPerUnit
    }
}
