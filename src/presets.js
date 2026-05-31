'use strict'

const fs = require('fs-extra')
const path = require('path')
const os = require('os')

const CONFIG_DIR = path.join(os.homedir(), '.vid-scaffold')
const PRESETS_FILE = path.join(CONFIG_DIR, 'presets.json')

async function loadPresets() {
    try {
        await fs.ensureDir(CONFIG_DIR)
        if (await fs.pathExists(PRESETS_FILE)) {
            return await fs.readJson(PRESETS_FILE)
        }
    } catch {
        // ignore
    }

    return {}
}

async function savePreset(name, structure) {
    await fs.ensureDir(CONFIG_DIR)
    const presets = await loadPresets()
    presets[name] = structure
    await fs.writeJson(PRESETS_FILE, presets, { spaces: 2 })
}

async function deletePreset(name) {
    const presets = await loadPresets()
    delete presets[name]
    await fs.writeJson(PRESETS_FILE, presets, { spaces: 2 })
}

module.exports = { loadPresets, savePreset, deletePreset, CONFIG_DIR }
