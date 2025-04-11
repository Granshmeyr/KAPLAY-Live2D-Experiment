import type { Live2DCubismModel } from "./Live2DCubismModel"

export class WavFileController {
    sourceNode: AudioBufferSourceNode | null = null
    samples: Float32Array[] | null = null
    numChannels?: number
    bitsPerSample?: number
    sampleRate?: number
    samplesPerChannel?: number
    declare model: Live2DCubismModel
    declare previousRms: number
    declare rms: number
    declare sampleOffset: number
    declare userTime: number
    declare smoothingFactor: number
    declare volumeNode: GainNode

    constructor(model: Live2DCubismModel) {
        this.model = model
        this.samples = null
        this.previousRms = 0
        this.rms = 0
        this.sampleOffset = 0
        this.userTime = 0
        this.smoothingFactor = 0.1
        this.sourceNode = null
        this.volumeNode = this.model.audioContext.createGain()
        this.volumeNode.gain.value = 1
        this.volumeNode.connect(this.model.audioContext.destination)
    }

    start = async (
        wavBuffer: ArrayBuffer | AudioBuffer,
        playAudio = false,
    ): Promise<void> => {
        this.sampleOffset = 0
        this.userTime = 0
        this.previousRms = 0
        this.rms = 0
        let decodedAudio = null as AudioBuffer | null
        let cloneAudio = null as AudioBuffer | null
        if (wavBuffer instanceof AudioBuffer) {
            decodedAudio = wavBuffer
            const offlineContext = new OfflineAudioContext(
                wavBuffer.numberOfChannels,
                wavBuffer.length,
                wavBuffer.sampleRate,
            )
            const bufferSource = offlineContext.createBufferSource()
            bufferSource.buffer = wavBuffer
            bufferSource.connect(offlineContext.destination)
            bufferSource.start()
            cloneAudio = await offlineContext.startRendering()
        } else {
            const cloneBuffer = new Uint8Array(wavBuffer).slice().buffer
            decodedAudio = await this.model.audioContext.decodeAudioData(
                wavBuffer,
            )
            cloneAudio = await this.model.audioContext.decodeAudioData(
                cloneBuffer,
            )
        }
        this.numChannels = decodedAudio.numberOfChannels
        this.sampleRate = decodedAudio.sampleRate
        this.samples = Array.from({ length: this.numChannels }, (_, i) =>
            decodedAudio.getChannelData(i),
        )
        this.samplesPerChannel = decodedAudio.length
        if (playAudio) await this.play(cloneAudio)
    }

    play = async (audioBuffer: AudioBuffer): Promise<void> => {
        this.stop()
        this.sourceNode = this.model.audioContext.createBufferSource()
        this.sourceNode.buffer = audioBuffer
        if (this.model.connectNode) {
            this.sourceNode.connect(this.model.connectNode)
        } else {
            this.sourceNode.connect(this.volumeNode)
        }
        return new Promise<void>((resolve) => {
            this.sourceNode!.onended = (): void => resolve()
            this.sourceNode!.start(this.userTime)
        })
    }

    stop = async (): Promise<void> => {
        if (this.sourceNode) {
            this.sourceNode.stop()
            this.sourceNode.disconnect()
            this.sourceNode = null
        }
    }

    update = (deltaTime: DOMHighResTimeStamp): void => {
        if (
            !this.samplesPerChannel ||
            !this.sampleRate ||
            !this.samples ||
            !this.numChannels
        )
            throw new Error()

        if (!this.samples || this.sampleOffset >= this.samplesPerChannel) {
            this.rms = 0
        }

        this.userTime += deltaTime
        const goalOffset = Math.min(
            Math.floor(this.userTime * this.sampleRate),
            this.samplesPerChannel,
        )

        let rms = 0
        const samplesToProcess = goalOffset - this.sampleOffset

        for (const channel of this.samples) {
            for (let i = this.sampleOffset; i < goalOffset; i++) {
                rms += channel[i] ** 2
            }
        }

        this.rms = Math.sqrt(rms / (this.numChannels * samplesToProcess)) * 5
        this.rms = Math.max(0, Math.min(this.rms, 1))

        if (this.smoothingFactor > 0) {
            this.rms =
                this.previousRms * (1 - this.smoothingFactor) +
                this.rms * this.smoothingFactor
        }
        this.previousRms = this.rms

        this.sampleOffset = goalOffset
    }

    getRms(): number {
        return this.rms
    }
}
