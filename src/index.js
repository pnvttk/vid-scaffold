'use strict'

const path = require('path')
const { select, input, confirm } = require('@inquirer/prompts')
const chalk = require('chalk')

const { DEFAULT_STRUCTURE, MINIMAL_STRUCTURE } = require('./structure')
const { runCustomize } = require('./customize')
const { createStructure, buildTree } = require('./creator')
const { loadPresets, savePreset } = require('./presets')
const { promptSoftware } = require('./software')

function printBanner() {
    console.log('')
    console.log(
        chalk.bold.hex('#00d4ff')('  ╔═══════════════════════════════╗')
    )
    console.log(
        chalk.bold.hex('#00d4ff')('  ║') +
            chalk.bold.white('   🎬  vid-scaffold  v1.0.0     ') +
            chalk.bold.hex('#00d4ff')('║')
    )
    console.log(
        chalk.bold.hex('#00d4ff')('  ╚═══════════════════════════════╝')
    )
    console.log(
        chalk.dim('  Video editing project scaffold · cross-platform\n')
    )
}

function printTree(projectName, structure) {
    console.log('')
    console.log(chalk.bold(`  ${projectName}/`))

    const lines = buildTree(structure)
    lines.forEach((l) => console.log(chalk.dim('  ') + chalk.cyan(l)))

    console.log('')
}

function applyPlaceholder(structure, softwareLabel, ext) {
    return structure.map((entry, i) => {
        const e = { ...entry }
        if (
            e.placeholder !== undefined ||
            e.name.toLowerCase().includes('project') ||
            i === 0
        ) {
            if (ext) e.placeholder = `project${ext}`
            else delete e.placeholder
        }

        return e
    })
}

async function run() {
    printBanner()

    // ── 1. Software ───────────────────────────────────────────────────────────
    const software = await promptSoftware()

    // ── 2. Project name ───────────────────────────────────────────────────────
    const projectName = await input({
        message: chalk.bold('  Project name:'),
        default: 'my-video-project',
        validate: (v) => {
            if (!v.trim()) return 'Project name cannot be empty'
            if (/[<>:"/\\|?*]/.test(v))
                return 'Name contains invalid characters'

            return true
        },
    })

    // ── 3. Load saved presets ─────────────────────────────────────────────────
    const userPresets = await loadPresets()
    const presetNames = Object.keys(userPresets)

    const modeChoices = [
        {
            name:
                chalk.white('full') +
                chalk.dim('        — all standard directories'),
            value: 'full',
        },
        {
            name:
                chalk.white('minimal') +
                chalk.dim('     — bare-bones, 3 folders'),
            value: 'minimal',
        },
        ...presetNames.map((p) => ({
            name: chalk.green(p) + chalk.dim('  (saved preset)'),
            value: `preset:${p}`,
        })),
        {
            name:
                chalk.yellow('customize') +
                chalk.dim('   — pick exactly what you want'),
            value: 'customize',
        },
    ]

    // ── 4. Pick template ──────────────────────────────────────────────────────
    const mode = await select({
        message: chalk.bold('  Choose a template:'),
        choices: modeChoices,
        loop: false,
        pageSize: modeChoices.length,
    })

    let structure

    if (mode === 'full') {
        structure = JSON.parse(JSON.stringify(DEFAULT_STRUCTURE))
    } else if (mode === 'minimal') {
        structure = JSON.parse(JSON.stringify(MINIMAL_STRUCTURE))
    } else if (mode.startsWith('preset:')) {
        structure = JSON.parse(JSON.stringify(userPresets[mode.slice(7)]))
    } else {
        structure = await runCustomize()
    }

    structure = applyPlaceholder(structure, software.label, software.ext)

    // ── 5. Preview & confirm ──────────────────────────────────────────────────
    printTree(projectName, structure)

    const ok = await confirm({
        message: chalk.bold('  Create this structure?'),
        default: true,
    })

    if (!ok) {
        console.log(chalk.dim('\n  Aborted. Nothing was created.\n'))

        return
    }

    // ── 6. Create folders ─────────────────────────────────────────────────────
    const targetPath = path.resolve(process.cwd(), projectName)
    await createStructure(targetPath, structure)

    console.log('')
    console.log(
        chalk.bold.green('  ✓ Project created: ') + chalk.white(targetPath)
    )

    if (software.ext) {
        console.log(
            chalk.dim('  ✓ Project file:   ') +
                chalk.white(`project${software.ext}`) +
                chalk.dim(' inside 01_project/')
        )
    }

    // ── 7. Save preset offer (customize only) ────────────────────────────────
    if (mode === 'customize') {
        console.log('')
        const wantSave = await confirm({
            message: chalk.bold('  Save this layout as a global preset?'),
            default: false,
        })

        if (wantSave) {
            const presetName = await input({
                message: chalk.bold('  Preset name:'),
                default: 'my-preset',
                validate: (v) => {
                    if (!v.trim()) return 'Preset name cannot be empty'
                    if (presetNames.includes(v.trim()))
                        return `"${v.trim()}" already exists. Choose a different name.`

                    return true
                },
            })

            await savePreset(presetName.trim(), structure)

            console.log(
                chalk.green(`\n  ✓ Preset "${presetName.trim()}" saved!`) +
                    chalk.dim(" It'll appear next time you run vid-scaffold.")
            )
        }
    }

    console.log('')
    console.log(chalk.dim('  Happy editing! 🎞️\n'))
}

module.exports = { run }
