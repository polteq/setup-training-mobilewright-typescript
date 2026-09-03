# iOS (optional, macOS only)

The course runs **Android by default**. iOS is an optional addendum for
attendees on macOS who want to try it — it's not required to complete the
main training.

## Install Xcode Command Line Tools

```bash
xcode-select --install
```

This gives you `xcrun`, `git`, etc. — enough for most of the training.

## Install Xcode (needed for the iOS Simulator)

The Simulator app and its device runtimes only ship with the full **Xcode**,
not the Command Line Tools. Install it from the
[Mac App Store](https://apps.apple.com/app/xcode/id497799835), then open it
once and let it finish its first-run setup (installs the default simulator
runtime).

To add more device/OS versions later: Xcode → Settings → Platforms.

## Verify

```bash
xcode-select -p
xcrun simctl list devices available
```

The first should print a path such as
`/Applications/Xcode.app/Contents/Developer`. The second should list at
least one iPhone simulator.

Then re-run `npm run check` from this project.
