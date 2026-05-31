import type { DirEntry } from './types.js'

/**
 * Default "full" structure for a video editing project.
 * `placeholder` is null here — it gets filled at runtime based on
 * the user's chosen software (see applyPlaceholder in index.ts).
 */
export const DEFAULT_STRUCTURE: DirEntry[] = [
    { name: '01_project', children: [], placeholder: null },
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

/** Bare-bones three-folder template. */
export const MINIMAL_STRUCTURE: DirEntry[] = [
    { name: '01_project', placeholder: null },
    { name: '02_footage' },
    { name: '03_exports', children: [{ name: 'final' }] },
]
