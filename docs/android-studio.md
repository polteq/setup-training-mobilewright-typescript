# Android Studio & SDK

The training runs Android tests via `mobilecli`, which drives devices
through `adb` and the Android emulator. You need:

- Android Studio (for the SDK Manager, AVD Manager, and bundled Java)
- The Android SDK, with `platform-tools` (`adb`) and `emulator` on your `PATH`
- At least one Android Virtual Device (AVD)

## Install Android Studio

Download from [developer.android.com/studio](https://developer.android.com/studio)
and run the installer for your platform. Accept the default "Standard"
setup — it installs the SDK, an emulator image, and a bundled JDK for you.

## Set environment variables

`npm run check` in this project will detect a missing `ANDROID_HOME` and
offer to set it for you automatically. If you'd rather do it by hand:

### macOS

Add to `~/.zshrc`:

```bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"
```

Then restart your terminal (or `source ~/.zshrc`).

### Windows 11

Open **System Properties → Environment Variables** and add:

- `ANDROID_HOME` = `%LOCALAPPDATA%\Android\Sdk`
- Append to `Path`: `%ANDROID_HOME%\platform-tools` and `%ANDROID_HOME%\emulator`

Open a **new** terminal afterwards so the change takes effect.

## Create an Android Virtual Device (AVD)

1. Open Android Studio → **More Actions → Virtual Device Manager** (or the
   Device Manager panel).
2. Click **Create Device**, pick a phone (e.g. Pixel 9), and a recent system
   image (API 34+).
3. Finish the wizard. You can start the emulator once from Android Studio to
   confirm it boots — `mobilecli`/`mobilewright` will start it on demand
   during the training if it isn't already running.

## Verify

```bash
adb --version
emulator -list-avds
```

Then re-run `npm run check` from this project.
