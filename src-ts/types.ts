/** A single node in the project directory tree. */
export interface DirEntry {
    /** Folder name (e.g. "01_project") */
    name: string
    /** Optional file to create inside this folder (e.g. "project.kdenlive") */
    placeholder?: string | null
    /** Optional sub-directories */
    children?: DirEntry[]
}

/** A resolved NLE software choice */
export interface SoftwareChoice {
    label: string
    ext: string | null
}

/** User presets stored in ~/.vid-scaffold/presets.json */
export type PresetsFile = Record<string, DirEntry[]>
