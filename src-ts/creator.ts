import path from 'path'
import fs from 'fs-extra'
import type { DirEntry } from './types.js'

/**
 * Recursively create folders (and optional placeholder files) on disk.
 */
export async function createStructure(
    basePath: string,
    structure: DirEntry[]
): Promise<void> {
    for (const entry of structure) {
        const dirPath = path.join(basePath, entry.name)
        await fs.ensureDir(dirPath)

        if (entry.placeholder) {
            const filePath = path.join(dirPath, entry.placeholder)
            if (!(await fs.pathExists(filePath))) {
                await fs.createFile(filePath)
            }
        }

        if (entry.children && entry.children.length > 0) {
            await createStructure(dirPath, entry.children)
        }
    }
}

/**
 * Build an array of lines that look like `tree` command output.
 */
export function buildTree(structure: DirEntry[], prefix = ''): string[] {
    const lines: string[] = []

    structure.forEach((entry, i) => {
        const isLast = i === structure.length - 1
        const connector = isLast ? '└── ' : '├── '
        const childPrefix = isLast ? '    ' : '│   '

        lines.push(prefix + connector + entry.name + '/')

        if (entry.placeholder) {
            lines.push(prefix + childPrefix + '└── ' + entry.placeholder)
        }

        if (entry.children && entry.children.length > 0) {
            lines.push(...buildTree(entry.children, prefix + childPrefix))
        }
    })

    return lines
}
