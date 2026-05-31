import { checkbox, input, confirm } from '@inquirer/prompts'
import chalk from 'chalk'
import type { DirEntry } from './types.js'
import { DEFAULT_STRUCTURE } from './structure.js'

const CREATE_CUSTOM_VALUE = '__CREATE_CUSTOM__'

/**
 * Prompt the user to select and configure folders at one level of the tree.
 *
 * - "add custom folder" is always the first option
 * - loop: false — no wrap-around at top/bottom
 * - pageSize = full list — never scrolls
 * - every selected folder (default or custom) gets an "add sub-folders?" offer
 */
async function promptLevel(
    title: string,
    defaultEntries: DirEntry[] = [],
    breadcrumb = ''
): Promise<DirEntry[]> {
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
        pageSize: choices.length + 1,
        instructions: chalk.dim(
            'space = toggle  ·  a = all  ·  i = invert  ·  enter = confirm'
        ),
    })

    // Gather custom folder names
    const customNames: string[] = []
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

    // Build result: selected defaults in original order, then custom names
    const result: DirEntry[] = []

    for (const val of selected) {
        if (val === CREATE_CUSTOM_VALUE) continue
        const original = defaultEntries.find((e) => e.name === val)
        // Spread to avoid mutating the shared DEFAULT_STRUCTURE constant
        result.push(original ? { ...original } : { name: val })
    }
    for (const name of customNames) {
        result.push({ name })
    }

    // Ask about children for every selected folder
    for (const entry of result) {
        const defaultKids: DirEntry[] = Array.isArray(entry.children)
            ? entry.children
            : []
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

export async function runCustomize(): Promise<DirEntry[]> {
    return promptLevel(
        chalk.bold('  Choose top-level folders'),
        DEFAULT_STRUCTURE
    )
}
