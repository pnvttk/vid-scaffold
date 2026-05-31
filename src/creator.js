'use strict'

const path = require('path')
const fs = require('fs-extra')

/**
 * Recursively create folders (and optional placeholder files) from a structure array.
 * @param {string} basePath - Root directory to create inside
 * @param {Array}  structure - Array of { name, children?, placeholder? }
 */
async function createStructure(basePath, structure) {
    for (const entry of structure) {
        const dirPath = path.join(basePath, entry.name)
        await fs.ensureDir(dirPath)

        // Create placeholder file if specified
        if (entry.placeholder) {
            const filePath = path.join(dirPath, entry.placeholder)
            if (!(await fs.pathExists(filePath))) {
                await fs.createFile(filePath)
            }
        }

        // Recurse into children
        if (entry.children && entry.children.length > 0) {
            await createStructure(dirPath, entry.children)
        }
    }
}

/**
 * Build a tree string for display (like `tree` command output).
 */
function buildTree(structure, prefix = '') {
    const lines = []

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

module.exports = { createStructure, buildTree }
