# Personal Website

Background-only foundation for a mathematics student's personal website.

The same lossless edited video background is used on six routes:

- `/` — Home
- `/research-interests`
- `/publications`
- `/notes-talks`
- `/cv`
- `/persona`

No visible text, navigation, controls, or other interactive interface has been
added yet.

## Development

```bash
npm ci
npm run dev
```

The reproducible frame-by-frame background edit is in
`scripts/process-background.py`. It requires Python, NumPy, SciPy, Pillow, and
FFmpeg. Version 4 intentionally renders no fragment overlay.
