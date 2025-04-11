import type { CubismMotionQueueEntryHandle } from "../../../framework/src/motion/cubismmotionqueuemanager.ts"
import { InvalidMotionQueueEntryHandleValue } from "../../../framework/src/motion/cubismmotionqueuemanager.ts"
import type {
    FinishedMotionCallback,
    BeganMotionCallback,
} from "../../../framework/src/motion/acubismmotion.ts"
import { ACubismMotion } from "../../../framework/src/motion/acubismmotion.ts"
import type { CubismMotion } from "../../../framework/src/motion/cubismmotion.ts"
import type { Live2DCubismModel } from "./Live2DCubismModel.ts"
import { MotionPriority } from "./types.ts"

export class MotionController {
    declare model: Live2DCubismModel

    constructor(model: Live2DCubismModel) {
        this.model = model
    }

    load = async (): Promise<void> => {
        const { motionGroups } = this.model.buffers!

        for (let i = 0; i < motionGroups.length; i++) {
            const group = motionGroups[i].group
            const motionBuffers = motionGroups[i].motionData.motionBuffers
            const name = `${group}_${i}`

            for (let i = 0; i < motionBuffers.length; i++) {
                const motionBuffer = motionBuffers[i]
                const motion = this.model.loadMotion(
                    motionBuffer,
                    motionBuffer.byteLength,
                    name,
                    undefined,
                    undefined,
                    this.model.settings,
                    group,
                    i,
                )

                if (motion != null) {
                    motion.setEffectIds(
                        this.model.eyeBlinkIds,
                        this.model.lipSyncIds,
                    )
                    if (this.model.motions.getValue(name) != null) {
                        ACubismMotion.delete(this.model.motions.getValue(name))
                    }
                    this.model.motions.setValue(name, motion)
                } else {
                    this.model.totalMotionCount--
                }
            }
        }
        this.model.motionManager.stopAllMotions()
    }

    update = (deltaTime: DOMHighResTimeStamp): boolean => {
        let motionUpdated = false
        this.model.model.loadParameters()
        if (this.model.motionManager.isFinished()) {
            if (!this.model.paused && this.model.enableMotion) {
                if (this.model.randomMotion) {
                    this.startRandomMotion(null, MotionPriority.Idle)
                } else {
                    this.startMotion("Idle", 1, MotionPriority.Idle)
                }
            }
        } else {
            motionUpdated = this.model.motionManager.updateMotion(
                this.model.model,
                deltaTime,
            )
        }
        this.model.model.saveParameters()
        return motionUpdated
    }

    stopMotions = (): void => {
        this.model.motionManager.stopAllMotions()
    }

    startMotion = async (
        group: string,
        i: number,
        priority: number,
        onStartMotion?: BeganMotionCallback,
        onEndMotion?: FinishedMotionCallback,
    ): Promise<CubismMotionQueueEntryHandle> => {
        if (priority === MotionPriority.Force) {
            this.model.motionManager.setReservePriority(priority)
        } else if (!this.model.motionManager.reserveMotion(priority)) {
            return InvalidMotionQueueEntryHandleValue
        }

        const { motionGroups } = this.model.buffers!
        const motionGroup = motionGroups.find(
            (motion) => motion.group === group,
        )
        if (!motionGroup) return
        const { motionBuffers, wavBuffer } = motionGroup.motionData

        const name = `${group}_${i}`
        let motion = this.model.motions.getValue(name) as CubismMotion
        let autoDelete = false

        if (motion == null) {
            const motionBuffer = motionBuffers[i]

            motion = this.model.loadMotion(
                motionBuffer,
                motionBuffer.byteLength,
                // @ts-expect-error idk why null passed
                null,
                onEndMotion,
                onStartMotion,
                this.model.settings,
                group,
                i,
            )
            if (!motion) return

            motion.setEffectIds(this.model.eyeBlinkIds, this.model.lipSyncIds)
            autoDelete = true
        } else {
            motion.setBeganMotionHandler(onStartMotion!)
            motion.setFinishedMotionHandler(onEndMotion!)
        }

        if (wavBuffer) {
            this.model.wavController.start(wavBuffer)
        }

        return this.model.motionManager.startMotionPriority(
            motion,
            autoDelete,
            priority,
        )
    }

    startRandomMotion = async (
        group: string | null,
        priority: number,
        onStartMotion?: BeganMotionCallback,
        onEndMotion?: FinishedMotionCallback,
    ): Promise<CubismMotionQueueEntryHandle> => {
        if (!this.model.loaded) return
        const { motionGroups } = this.model.buffers!
        if (!group) {
            const randGroup = Math.floor(Math.random() * motionGroups.length)
            group = motionGroups[randGroup]?.group
        }
        const motionCount = motionGroups.find((g) => g.group === group)
            ?.motionData.motionBuffers.length
        if (!motionCount) return
        const rand = Math.floor(Math.random() * motionCount)
        return this.startMotion(
            group,
            rand,
            priority,
            onStartMotion,
            onEndMotion,
        )
    }
}
