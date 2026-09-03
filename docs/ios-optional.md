# iOS (optional, macOS only)

The course runs **Android by default**. iOS is an optional addendum for
attendees on macOS who want to try it — it's not required to complete the
main training.

## Install Xcode Command Line Tools

```bash
xcode-select --install
```

This installs enough tooling (`xcrun`, `simctl`, etc.) for `mobilecli` to
drive the iOS Simulator. A full Xcode install is not required for the
addendum.

## Verify

```bash
xcode-select -p
```

Should print a path such as `/Library/Developer/CommandLineTools` or
`/Applications/Xcode.app/Contents/Developer`.

Then re-run `npm run check` from this project.
