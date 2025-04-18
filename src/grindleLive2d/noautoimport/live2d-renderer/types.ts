import type { KAPLAYCtx } from "kaplay"
import type { grindleLive2d } from "../../index.ts"

export interface Live2DModelOptions {
    autoAnimate?: boolean
    autoInteraction?: boolean
    tapInteraction?: boolean
    randomMotion?: boolean
    keepAspect?: boolean
    cubismCorePath?: string
    paused?: boolean
    speed?: number
    scale?: number
    minScale?: number
    maxScale?: number
    panSpeed?: number
    zoomStep?: number
    x?: number
    y?: number
    zoomEnabled?: boolean
    doubleClickReset?: boolean
    enablePan?: boolean
    checkMocConsistency?: boolean
    premultipliedAlpha?: boolean
    lipsyncSmoothing?: number
    volume?: number
    audioContext?: AudioContext
    connectNode?: AudioNode
    maxTextureSize?: number
    scaledYPos?: boolean
    appendYOffset?: number
    enablePhysics?: boolean
    enableEyeblink?: boolean
    enableBreath?: boolean
    enableLipsync?: boolean
    enableMotion?: boolean
    enableExpression?: boolean
    enableMovement?: boolean
    enablePose?: boolean
}

export interface Live2DBuffers {
    modelBuffer: ArrayBuffer | null
    expressionBuffers: ArrayBuffer[]
    physicsBuffer: ArrayBuffer | null
    poseBuffer: ArrayBuffer | null
    userDataBuffer: ArrayBuffer | null
    textureBuffers: ArrayBuffer[]
    motionGroups: {
        group: string
        motionData: {
            motionBuffers: ArrayBuffer[]
            wavBuffer: ArrayBuffer | null
        }
    }[]
}

export enum MotionPriority {
    None,
    Idle,
    Normal,
    Force,
}

export type EventMap = {
    hit: (hitAreas: string[], x: number, y: number) => void
}

export interface CubismCDI3Json {
    Version: number
    Parameters: {
        Id: string
        GroupId: string
        Name: string
    }[]
    ParameterGroups: {
        Id: string
        GroupId: string
        Name: string
    }[]
    Parts: {
        Id: string
        Name: string
    }[]
    CombinedParameters: string[][]
}

export interface VTubeStudioJson {
    Version: number
    Name: string
    ModelID: string
    FileReferences: {
        Icon: string
        Model: string
        IdleAnimation: string
        IdleAnimationWhenTrackingLost: string
    }
    ModelSaveMetadata: {
        LastSavedVTubeStudioVersion: string
        LastSavedPlatform: string
        LastSavedDateUTC: string
        LastSavedDateLocalTime: string
        LastSavedDateUnixMillisecondTimestamp: string
    }
    SavedModelPosition: {
        Position: {
            x: number
            y: number
            z: number
        }
        Rotation: {
            x: number
            y: number
            z: number
            w: number
        }
        Scale: {
            x: number
            y: number
            z: number
        }
    }
    ModelPositionMovement: {
        Use: boolean
        X: number
        Y: number
        Z: number
        SmoothingX: number
        SmoothingY: number
        SmoothingZ: number
    }
    ItemSettings: {
        OnlyMoveWhenPinned: boolean
        AllowNormalHotkeyTriggers: boolean
        Multiplier_HeadAngleX: number
        Multiplier_HeadAngleY: number
        Multiplier_HeadAngleZ: number
        Shift_HeadAngleX: number
        Shift_HeadAngleY: number
        Smoothing_HeadAngleX: number
        Smoothing_HeadAngleY: number
        Smoothing_HeadAngleZ: number
    }
    PhysicsSettings: {
        Use: boolean
        UseLegacyPhysics: boolean
        Live2DPhysicsFPS: number
        PhysicsStrength: number
        WindStrength: number
        DraggingPhysicsStrength: number
    }
    GeneralSettings: {
        TimeUntilTrackingLostIdleAnimation: number
        WorkshopSharingForbidden: boolean
        EnableExpressionSaving: boolean
    }
    ParameterSettings: {
        Folder: string
        Name: string
        Input: string
        InputRangeLower: number
        InputRangeUpper: number
        OutputRangeLower: number
        OutputRangeUpper: number
        ClampInput: boolean
        ClampOutput: boolean
        UseBlinking: boolean
        UseBreathing: boolean
        OutputLive2D: string
        Smoothing: number
        Minimized: boolean
    }[]
    Hotkeys: {
        HotkeyID: string
        Name: string
        Action: string
        File: string
        Folder: string
        Position: {
            X: number
            Y: number
            Z: number
            Rotation: number
        }
        ColorOverlay: {
            On: boolean
            IsStaticColor: boolean
            Display: number
            WindowName: string
            IncludeLeft: boolean
            IncludeMid: boolean
            IncludeRight: boolean
            BaseValue: number
            OverlayValue: number
            Smoothing: number
            IncludeItems: boolean
            StaticColor: {
                r: number
                g: number
                b: number
                a: number
            }
        }
        ColorScreenMultiplyPreset: {
            ArtMeshMultiplyAndScreenColors: unknown[]
        }
        HandGestureSettings: {
            GestureLeft: string
            GestureRight: string
            GestureCombinator: string
            AllowMirroredGesture: boolean
            DeactivateExpWhenGestureNotDetected: boolean
            SecondsUntilDetection: number
            SecondsDetected: number
            PercentDetected: number
        }
        LoadModelSettings: {
            LoadAtCurrentPosition: boolean
        }
        TwitchTriggers: {
            Active: boolean
            CooldownActive: boolean
            CooldownSeconds: number
            ResetActive: boolean
            HideModelResetDialog: boolean
            Active_GiftSubTrigger: boolean
            Active_BitTrigger: boolean
            Active_RedeemTrigger: boolean
            Active_TextCommandTrigger: boolean
            Active_SubTrigger: boolean
            Active_FollowTrigger: boolean
            Active_RaidTrigger: boolean
            Active_ShoutoutTrigger: boolean
            Active_AdbreakTrigger: boolean
            Trigger_TextCommandTrigger: string
            Trigger_Redeem_Name: string
            Trigger_Redeem_ID: string
            UseTextTriggerUserTypeRestriction: boolean
            RestrictTextTriggerTo: {
                Allowed_You: boolean
                Allowed_Subs: boolean
                Allowed_Mods: boolean
                Allowed_VIPs: boolean
                Allowed_Artists: boolean
                Allowed_UserNames: boolean
                UserNames: string[]
                Allowed_UserIDs: boolean
                UserIDs: string[]
            }
            AllowRepeatedFollow: boolean
            Trigger_GiftSubTrigger: {
                Min: number
                Max: number
            }
            Trigger_BitTrigger: {
                Min: number
                Max: number
            }
        }
        Triggers: {
            Trigger1: string
            Trigger2: string
            Trigger3: string
            ScreenButton: number
        }
        IsGlobal: boolean
        IsActive: boolean
        Minimized: boolean
        StopsOnLastFrame: boolean
        DeactivateAfterKeyUp: boolean
        OnlyLoadOneRandomItem: boolean
        DeactivateAfterSeconds: boolean
        DeactivateAfterSecondsAmount: number
        FadeSecondsAmount: number
        OnScreenHotkeyColor: {
            r: number
            g: number
            b: number
            a: number
        }
    }[]
    HotkeySettings: {
        UseOnScreenHotkeys: boolean
        UseKeyboardHotkeys: boolean
        SendOnScreenHotkeysToPC: boolean
        OnScreenHotkeyAlpha: number
    }
    ArtMeshDetails: {
        ArtMeshesExcludedFromPinning: unknown[]
        ArtMeshesThatDeleteItemsOnDrop: unknown[]
        ArtMeshSceneLightingMultipliers: unknown[]
        ArtMeshMultiplyAndScreenColors: {
            ID: string
            Value: string
        }[]
    }
    ParameterCustomization: {
        ParametersExcludedFromVNetSmoothing: unknown[]
    }
    PhysicsCustomizationSettings: {
        PhysicsMultipliersPerPhysicsGroup: {
            ID: string
            Value: number
        }[]
        WindMultipliersPerPhysicsGroup: {
            ID: string
            Value: number
        }[]
        DraggingPhysicsMultipliersPerPhysicsGroup: {
            ID: string
            Value: number
        }[]
    }
    FolderInfo: {
        HotkeyFolders: string[]
        ConfigItemFolders: string[]
    }
    SavedActiveExpressions: string[]
}

export type CharacterPosition = {
    firstNonTransparentY: number
    lastNonTransparentY: number
    characterHeight: number
    marginHeight: number
}

export type ModelParameters = {
    count: number
    defaultValues: Float32Array
    ids: string[]
    keyCounts: Int32Array
    keyValues: Float32Array[]
    maximumValues: Float32Array
    minimumValues: Float32Array
    opacities: Float32Array
    types: Int32Array
    values: Float32Array
}

export type ModelParts = {
    count: number
    ids: string[]
    opacities: Float32Array
    parentIndices: Float32Array
}

export type ModelDrawables = {
    count: number
    constantFlags: Uint8Array
    drawOrders: Int32Array
    dynamicFlags: Uint8Array
    ids: string[]
    indexCounts: Int32Array
    indices: Uint16Array[]
    maskCounts: Int32Array
    masks: Int32Array[]
    multiplyColors: Float32Array
    opacities: Float32Array
    parentPartIndices: Int32Array
    renderOrders: Int32Array
    screenColors: Float32Array
    textureIndices: Int32Array
    vertexCounts: Int32Array
    vertexPositions: Float32Array[]
    vertexUvs: Float32Array[]
}

export type PluggedK = KAPLAYCtx & ReturnType<typeof grindleLive2d>
