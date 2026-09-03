# Mobilewright Training — Setup Check

A small script that checks whether your machine is ready for the **Mobilewright
training** (the two-day course based on
[`training-mobilewright-typescript`](https://github.com/polteq/training-mobilewright-typescript)),
*before* the training starts.

Run it, fix anything it flags, and you're ready for Module 3 on day one.

## Quick start

```bash
git clone <this-repo-url>
cd setup-training-mobilewright-typescript
npm install
npm run check
```

The script prints ✔ / ✘ / ⚠ for each requirement and, where possible, offers
to fix things automatically (e.g. setting `ANDROID_HOME`).

Supported platforms: **macOS** and **Windows 11**.

## Requirements

| Requirement | Why | Required? |
|---|---|---|
| Git | Clone the training repo | Yes |
| Node.js 24+ | Runs the training repo and its tools | Yes |
| Android Studio + SDK (`adb`, emulator, an AVD) | Run the app under test on Android | Yes |
| Java (JDK) | Some Android SDK command-line tools | Optional |
| Xcode Command Line Tools (macOS only) | Optional iOS addendum | Optional |
| An IDE (VS Code recommended) | Open and run the training code | Optional (but you need one) |

The course runs **Android by default**. iOS is an optional addendum and is
only relevant on macOS.

## What gets checked

1. **Git** — needed to clone the training repository.
2. **Node.js** — must be version 24 or newer (`npm` comes bundled with it).
3. **Android** — an SDK with `adb` and the `emulator` command on your `PATH`,
   and at least one Android Virtual Device (AVD) created in Android Studio.
4. **Java** *(optional)* — only used by a few Android SDK command-line tools;
   not required by `mobilecli` or `mobilewright` themselves.
5. **iOS** *(optional, macOS only)* — Xcode Command Line Tools, only needed
   if you plan to try the optional iOS addendum.
6. **IDE** — checks for VS Code (recommended) on `PATH` or in its usual
   install location; any IDE works, but you need one to open and run the
   training code.

> This project does **not** install or check `mobilewright`/`mobilecli`
> themselves — those are part of the training repo, not this prerequisite
> check.

## Setup guides

- [Node.js](docs/node.md)
- [Android Studio & SDK](docs/android-studio.md)
- [iOS Command Line Tools (optional)](docs/ios-optional.md)

## Example: all checks passing

```
Git
  ✔  git version 2.43.0

Node.js
  ✔  v24.4.0
  ✔  npm 10.9.0

Android
  ✔  ANDROID_HOME = /Users/you/Library/Android/sdk
  ✔  adb version 35.0.2
  ✔  Android emulator found. Available AVDs:
       Pixel_9_API_36
  ⚠  No running Android devices or emulators (fine before the training)

Java (optional)
  ✔  JAVA_HOME = /Applications/Android Studio.app/Contents/jbr/Contents/Home

iOS (macOS only, optional)
  ✔  Command Line Tools, /Library/Developer/CommandLineTools

IDE
  ✔  VS Code 1.135.0

All checks passed! Your machine is ready for the Mobilewright training.
```

## Troubleshooting

| Problem | Fix |
|---|---|
| `ANDROID_HOME not set` | Re-run `npm run check` and accept the auto-fix prompt, or see [docs/android-studio.md](docs/android-studio.md). |
| `No Android Virtual Devices (AVDs) found` | Open Android Studio → Device Manager → Create Device. |
| Script can't find `adb`/`emulator` after installing Android Studio | Restart your terminal (Windows) or open a new shell (macOS) so the updated `PATH`/env vars are picked up. |
| VS Code not found | Install from https://code.visualstudio.com/, or use any other IDE — it's not enforced. |

## What this project installs

This script has no dependencies of its own — it only inspects your machine
(commands on `PATH`, known install locations, environment variables) and
does not touch the real training repo or install anything system-wide
beyond what you approve via the prompts (Android/Java environment
variables). `mobilewright`/`mobilecli` are installed and verified later, as
part of the training repo itself.
