'use strict'

const { checkbox, input, confirm } = require('@inquirer/prompts')
const chalk = require('chalk')
const { DEFAULT_STRUCTURE } = require('./structure')

const CREATE_CUSTOM_VALUE = '__CREATE_CUSTOM__'

async function promptLevel(title, defaultEntries = [], breadcrumb = '') {
    const choices = [
        {
            name: chalk.yellow('+ add custom folder'),
            value: CREATE_CUSTOM_VALUE,
            checked: false,
        },
        ...defaultEntries.map((e) => ({
            name: e.name,
            value: e.name,
            checked: true,
        })),
    ]

    if (breadcrumb) {
        console.log(chalk.dim(`\n  in: ${breadcrumb}`))
    }

    const selected = await checkbox({
        message: title,
        choices,
        loop: false,
        pageSize: choices.length + 1, // show all — never scroll
        instructions: chalk.dim(
            'space = toggle  ·  a = all  ·  i = invert  ·  enter = confirm'
        ),
    })

    // Collect custom folder names
    const customNames = []
    if (selected.includes(CREATE_CUSTOM_VALUE)) {
        let keepAdding = true
        while (keepAdding) {
            const name = await input({
                message: chalk.yellow('  Folder name:'),
                validate: (v) => (v.trim() ? true : 'Name cannot be empty'),
            })

            customNames.push(name.trim())

            keepAdding = await confirm({
                message: chalk.dim('  Add another custom folder?'),
                default: false,
            })
        }
    }

    // Build result: selected defaults in order, customs appended
    const result = []
    for (const val of selected) {
        if (val === CREATE_CUSTOM_VALUE) continue

        const original = defaultEntries.find((e) => e.name === val)

        result.push(original ? { ...original } : { name: val })
    }

    for (const name of customNames) {
        result.push({ name })
    }

    // Ask about children for every selected folder
    for (const entry of result) {
        const defaultKids = Array.isArray(entry.children) ? entry.children : []
        const hasKids = defaultKids.length > 0

        const wantChildren = await confirm({
            message:
                chalk.cyan(`  ${entry.name}/`) +
                chalk.dim(
                    hasKids ? '  configure sub-folders?' : '  add sub-folders?'
                ),
            default: hasKids,
        })

        if (wantChildren) {
            const crumb =
                (breadcrumb ? breadcrumb + entry.name : entry.name) + '/'
            entry.children = await promptLevel(
                chalk.bold(`  ${entry.name}/`) + chalk.dim(' — sub-folders'),
                defaultKids,
                crumb
            )
        } else {
            delete entry.children
        }
    }

    return result
}

async function runCustomize() {
    const structure = await promptLevel(
        chalk.bold('  Choose top-level folders'),
        DEFAULT_STRUCTURE
    )

    return structure
}

module.exports = { runCustomize }
