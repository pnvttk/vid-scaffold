'use strict'

const { select, input } = require('@inquirer/prompts')
const chalk = require('chalk')

const SOFTWARE_LIST = [
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

async function promptSoftware() {
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
            value: '__CUSTOM__',
        },
    ]

    const picked = await select({
        message: chalk.bold('  Which editing software do you use?'),
        choices,
        loop: false,
        pageSize: choices.length, // show all — never scroll
    })

    if (picked === '__CUSTOM__') {
        const customExt = await input({
            message:
                chalk.yellow('  Project file extension') +
                chalk.dim(' (e.g. .myapp — leave blank for none):'),
        })
        const ext = customExt.trim() || null
        const normExt = ext && !ext.startsWith('.') ? '.' + ext : ext

        return { label: 'Custom', ext: normExt }
    }

    const found = SOFTWARE_LIST.find((s) => s.name === picked)

    return { label: picked, ext: found.ext }
}

module.exports = { promptSoftware, SOFTWARE_LIST }
