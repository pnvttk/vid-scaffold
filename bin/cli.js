#!/usr/bin/env node

'use strict'

const { run } = require('../src/index')

run().catch((err) => {
    if (err.name === 'ExitPromptError') {
        console.log('\n  Cancelled. See you next time! 👋')
        process.exit(0)
    }

    console.error(err)
    process.exit(1)
})
