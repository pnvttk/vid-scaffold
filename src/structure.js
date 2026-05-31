'use strict'

/**
 * Default directory structure for video editing projects.
 * Each entry has:
 *   - name: folder name
 *   - children: optional array of sub-folders (same shape)
 *   - placeholder: optional file to create inside (keeps folder in git)
 */
const DEFAULT_STRUCTURE = [
    {
        name: '01_project',
        children: [],
        placeholder: null, // filled in at runtime based on chosen software
    },
    { name: '02_a-roll' },
    { name: '03_b-roll' },
    { name: '04_music' },
    { name: '05_sfx' },
    { name: '06_subtitles' },
    {
        name: '07_exports',
        children: [{ name: 'drafts' }, { name: 'final' }, { name: 'shorts' }],
    },
]

const MINIMAL_STRUCTURE = [
    { name: '01_project', placeholder: null },
    { name: '02_footage' },
    { name: '03_exports', children: [{ name: 'final' }] },
]

module.exports = { DEFAULT_STRUCTURE, MINIMAL_STRUCTURE }
