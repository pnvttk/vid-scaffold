'use strict'

/**
 * Return a page size that fills most of the terminal height.
 * Falls back to 16 when stdout isn't a TTY (e.g. piped / CI).
 * Subtracts `overhead` lines reserved for the prompt label, instructions,
 * border, etc.
 */
function pageSize(overhead = 4) {
    const rows = process.stdout.rows
    if (!rows) return 16

    return Math.max(4, rows - overhead)
}

/**
 * Clear the terminal screen and move the cursor to the top-left.
 * Uses the standard ANSI sequences that work on Windows (ConEmu, WT, cmd),
 * macOS Terminal, and Linux terminals.
 */
function clearScreen() {
    // \x1B[2J  — erase entire display
    // \x1B[H   — move cursor to row 1, col 1
    process.stdout.write('\x1B[2J\x1B[H')
}

module.exports = { pageSize, clearScreen }
