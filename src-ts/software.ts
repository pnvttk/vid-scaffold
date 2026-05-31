import { select, input } from '@inquirer/prompts'
import chalk from 'chalk'
import type { SoftwareChoice } from './types.js'

interface SoftwareEntry {
    name: string
    ext: string | null
}

const SOFTWARE_LIST: SoftwareEntry[] = [
    { name: 'Kdenlive', ext: '.kdenlive' },
    { name: 'DaVinci Resolve', ext: '.drp' },
    { name: 'Adobe Premiere Pro', ext: '.prproj' },
    { name: 'Final Cut Pro', ext: '.fcpbundle' },
    { name: 'CapCut', ext: null },
    { name: 'Shotcut', ext: '.mlt' },
    { name: 'Vegas Pro', ext: '.veg' },
    { name: 'Avid Media Composer', ext: '.avb' },
    { name: 'Other / none', ext: null },
]

const CUSTOM_VALUE = '__CUSTOM__'

export async function promptSoftware(): Promise<SoftwareChoice> {
    const choices = [
        ...SOFTWARE_LIST.map((s) => ({
            name:
                chalk.white(s.name) +
                (s.ext
                    ? chalk.dim(`  ${s.ext}`)
                    : chalk.dim('  no project file')),
            value: s.name,
        })),
        {
            name: chalk.italic.dim('+ other (enter extension manually)'),
            value: CUSTOM_VALUE,
        },
    ]

    const picked = await select({
        message: chalk.bold('  Which editing software do you use?'),
        choices,
        loop: false,
        pageSize: choices.length,
    })

    if (picked === CUSTOM_VALUE) {
        const raw = await input({
            message:
                chalk.yellow('  Project file extension') +
                chalk.dim(' (e.g. .myapp — leave blank for none):'),
        })
        const trimmed = raw.trim() || null
        const ext =
            trimmed && !trimmed.startsWith('.') ? '.' + trimmed : trimmed

        return { label: 'Custom', ext }
    }

    const found = SOFTWARE_LIST.find((s) => s.name === picked)!

    return { label: picked, ext: found.ext }
}
