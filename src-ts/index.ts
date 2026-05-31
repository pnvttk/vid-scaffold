import path from 'path'
import { select, input, confirm } from '@inquirer/prompts'
import chalk from 'chalk'

import type { DirEntry, SoftwareChoice } from './types.js'
import { DEFAULT_STRUCTURE, MINIMAL_STRUCTURE } from './structure.js'
import { runCustomize } from './customize.js'
import { createStructure, buildTree } from './creator.js'
import { loadPresets, savePreset } from './presets.js'
import { promptSoftware } from './software.js'

// ── Helpers ──────────────────────────────────────────────────────────────────

function printBanner(): void {
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

function printTree(projectName: string, structure: DirEntry[]): void {
    console.log('')
    console.log(chalk.bold(`  ${projectName}/`))

    buildTree(structure).forEach((l) =>
        console.log(chalk.dim('  ') + chalk.cyan(l))
    )

    console.log('')
}

/**
 * Inject the chosen software's project file extension into the structure.
 * Targets the first folder whose name contains "project", or falls back to
 * the very first folder if none match.
 */
function applyPlaceholder(
    structure: DirEntry[],
    software: SoftwareChoice
): DirEntry[] {
    return structure.map((entry, i) => {
        const e: DirEntry = { ...entry }
        const isProjectFolder =
            'placeholder' in e ||
            e.name.toLowerCase().includes('project') ||
            i === 0

        if (isProjectFolder) {
            if (software.ext) {
                e.placeholder = `project${software.ext}`
            } else {
                delete e.placeholder
            }
        }

        return e
    })
}

// ── Main ──────────────────────────────────────────────────────────────────────

export async function run(): Promise<void> {
    printBanner()

    // 1. Software
    const software = await promptSoftware()

    // 2. Project name
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

    // 3. Load presets + build template choices
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

    // 4. Pick template
    const mode = await select({
        message: chalk.bold('  Choose a template:'),
        choices: modeChoices,
        loop: false,
        pageSize: modeChoices.length,
    })

    let structure: DirEntry[]

    if (mode === 'full') {
        structure = structuredClone(DEFAULT_STRUCTURE)
    } else if (mode === 'minimal') {
        structure = structuredClone(MINIMAL_STRUCTURE)
    } else if (mode.startsWith('preset:')) {
        structure = structuredClone(userPresets[mode.slice(7)]!)
    } else {
        structure = await runCustomize()
    }

    structure = applyPlaceholder(structure, software)

    // 5. Preview + confirm
    printTree(projectName, structure)

    const ok = await confirm({
        message: chalk.bold('  Create this structure?'),
        default: true,
    })

    if (!ok) {
        console.log(chalk.dim('\n  Aborted. Nothing was created.\n'))

        return
    }

    // 6. Create on disk
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

    // 7. Offer to save preset (customize only)
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
