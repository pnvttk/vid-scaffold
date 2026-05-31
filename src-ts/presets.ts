import fs from 'fs-extra'
import path from 'path'
import os from 'os'
import type { DirEntry, PresetsFile } from './types.js'

export const CONFIG_DIR = path.join(os.homedir(), '.vid-scaffold')
const PRESETS_FILE = path.join(CONFIG_DIR, 'presets.json')

export async function loadPresets(): Promise<PresetsFile> {
    try {
        await fs.ensureDir(CONFIG_DIR)
        if (await fs.pathExists(PRESETS_FILE)) {
            return (await fs.readJson(PRESETS_FILE)) as PresetsFile
        }
    } catch {
        // Corrupted or missing file — return empty
    }

    return {}
}

export async function savePreset(
    name: string,
    structure: DirEntry[]
): Promise<void> {
    await fs.ensureDir(CONFIG_DIR)
    const presets = await loadPresets()
    presets[name] = structure
    await fs.writeJson(PRESETS_FILE, presets, { spaces: 2 })
}

export async function deletePreset(name: string): Promise<void> {
    const presets = await loadPresets()
    delete presets[name]
    await fs.writeJson(PRESETS_FILE, presets, { spaces: 2 })
}
