# 🎬 vid-scaffold

> Scaffold video editing project directory structures — interactively, cross-platform.

Works on **Windows**, **macOS**, and **Linux**.

---

## Usage

No install needed — just run:

```bash
npx vid-scaffold
```

Or install globally:

```bash
npm install -g vid-scaffold
vid-scaffold
```

---

## What it does

Launches an interactive CLI that asks you:

1. **Software** — which NLE you use (sets the project file extension)
2. **Project name** — the root folder to create
3. **Template** — full, minimal, your saved preset, or customize
4. **Customize mode** — pick folders, add your own, drill into nested ones
5. **Save as preset** — optionally save your layout for next time

### Supported software

| Software              | Project file             |
| --------------------- | ------------------------ |
| Kdenlive              | `project.kdenlive`       |
| DaVinci Resolve       | `project.drp`            |
| Adobe Premiere Pro    | `project.prproj`         |
| Final Cut Pro         | `project.fcpbundle`      |
| Shotcut               | `project.mlt`            |
| Vegas Pro             | `project.veg`            |
| Avid Media Composer   | `project.avb`            |
| CapCut / Other / none | _(no file created)_      |
| Custom                | enter your own extension |

### Default "full" structure

```
my-video-project/
├── 01_project/
│   └── project.kdenlive   ← depends on your software choice
├── 02_a-roll/
├── 03_b-roll/
├── 04_music/
├── 05_sfx/
├── 06_subtitles/
└── 07_exports/
    ├── drafts/
    ├── final/
    └── shorts/
```

---

## Presets

Saved presets are stored at:

| Platform      | Path                                       |
| ------------- | ------------------------------------------ |
| macOS / Linux | `~/.vid-scaffold/presets.json`             |
| Windows       | `%USERPROFILE%\.vid-scaffold\presets.json` |

---

## Contributing / Development

```bash
git clone https://github.com/your-username/vid-scaffold
cd vid-scaffold
npm install

# Compile TypeScript
npm run build

# Run locally
npm start

# Watch mode during development
npm run dev
```

### Project structure

```
vid-scaffold/
├── src-ts/           # TypeScript source
│   ├── types.ts      # Shared interfaces (DirEntry, SoftwareChoice, …)
│   ├── structure.ts  # Default & minimal templates
│   ├── software.ts   # NLE software selection prompt
│   ├── customize.ts  # Interactive folder picker (recursive)
│   ├── creator.ts    # Disk writer + tree printer
│   ├── presets.ts    # Save/load ~/.vid-scaffold/presets.json
│   └── index.ts      # Main orchestrator
├── bin-ts/
│   └── cli.ts        # #!/usr/bin/env node entry point
├── dist/             # Compiled output (generated — do not edit)
├── tsconfig.json
└── package.json
```

### Publishing

```bash
npm run build        # compiles src-ts/ → dist/
npm publish          # ships only the dist/ folder (see .npmignore)
```

---

## Requirements

- Node.js **18+**

---

## License

MIT
