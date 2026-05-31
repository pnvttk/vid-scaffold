#!/usr/bin/env node
import { run } from '../src-ts/index.js'

run().catch((err: unknown) => {
    if (err instanceof Error && err.name === 'ExitPromptError') {
        console.log('\n  Cancelled. See you next time! 👋')
        process.exit(0)
    }

    console.error(err)
    process.exit(1)
})
