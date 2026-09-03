#!/usr/bin/env node
// Checks that this machine meets the prerequisites for the Mobilewright
// training (training-mobilewright-typescript). macOS and Windows 11 only.

import { execSync } from 'node:child_process';
import { existsSync, appendFileSync } from 'node:fs';
import { platform, homedir } from 'node:os';
import { join } from 'node:path';
import { createInterface } from 'node:readline/promises';

const IS_MAC = platform() === 'darwin';
const IS_WIN = platform() === 'win32';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const DIM = '\x1b[2m';

const ok = (msg) => console.log(`  ${GREEN}✔${RESET}  ${msg}`);
const fail = (msg) => console.log(`  ${RED}✘${RESET}  ${msg}`);
const warn = (msg) => console.log(`  ${YELLOW}⚠${RESET}  ${msg}`);
const info = (msg) => console.log(`     ${DIM}${msg}${RESET}`);
const header = (msg) => console.log(`\n${BOLD}${CYAN}${msg}${RESET}`);

function run(cmd) {
  try {
    return execSync(cmd, { stdio: 'pipe', encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
}

function checkCommand(cmd, args = '--version') {
  return run(`${cmd} ${args}`);
}

async function ask(question) {
  if (!process.stdin.isTTY) return false;
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(question);
  rl.close();
  return /^y(es)?$/i.test(answer.trim());
}

let hasErrors = false;

async function check(label, fn) {
  try {
    await fn();
  } catch (err) {
    fail(`${label}: unexpected error - ${err.message}`);
    hasErrors = true;
  }
}

// ---------------------------------------------------------------------------
// Git (needed to clone the training repo)
// ---------------------------------------------------------------------------

header('Git');

await check('git', () => {
  const version = checkCommand('git');
  if (version) {
    ok(version);
    return;
  }
  fail('Git not found');
  hasErrors = true;
  if (IS_MAC) {
    info('Install the Xcode Command Line Tools: xcode-select --install');
  } else if (IS_WIN) {
    info('Download from https://git-scm.com/download/win');
    info('During install, keep the default "Git from the command line" PATH option.');
  }
});

// ---------------------------------------------------------------------------
// Node.js (training repo pins @types/node ^24, mobilewright requires Node >=18
// but this course is verified against Node 24+)
// ---------------------------------------------------------------------------

header('Node.js');

await check('node', () => {
  const version = checkCommand('node');
  if (!version) {
    fail('Node.js not found');
    hasErrors = true;
    info('See docs/node.md for install instructions.');
    return;
  }
  const match = version.match(/v(\d+)/);
  const major = match ? parseInt(match[1], 10) : 0;
  if (major >= 24) {
    ok(version);
  } else {
    fail(`${version} (need Node.js 24 or newer)`);
    hasErrors = true;
    info('See docs/node.md for install instructions.');
  }
});

await check('npm', () => {
  const version = checkCommand('npm');
  if (version) {
    ok(`npm ${version}`);
  } else {
    fail('npm not found (usually installed together with Node.js)');
    hasErrors = true;
  }
});

// ---------------------------------------------------------------------------
// Android SDK, adb, emulator
// ---------------------------------------------------------------------------

function detectSdkPath() {
  const home = homedir();
  const candidates = IS_MAC
    ? [join(home, 'Library', 'Android', 'sdk')]
    : [join(home, 'AppData', 'Local', 'Android', 'Sdk')];
  return candidates.find((p) => existsSync(join(p, 'platform-tools')));
}

function applyAndroidEnv(sdkPath) {
  process.env.ANDROID_HOME = sdkPath;
  process.env.PATH = `${join(sdkPath, 'platform-tools')}${IS_WIN ? ';' : ':'}${join(sdkPath, 'emulator')}${IS_WIN ? ';' : ':'}${process.env.PATH}`;
}

async function fixAndroidEnv(sdkPath) {
  const answer = await ask(`     Set ANDROID_HOME to ${sdkPath} and add it to PATH? [y/N] `);
  if (!answer) return false;

  if (IS_WIN) {
    run(`powershell -NoProfile -Command "[Environment]::SetEnvironmentVariable('ANDROID_HOME','${sdkPath}','User')"`);
    run(
      `powershell -NoProfile -Command "$p=[Environment]::GetEnvironmentVariable('Path','User'); if ($p -notlike '*platform-tools*') { [Environment]::SetEnvironmentVariable('Path', $p + ';${sdkPath}\\platform-tools;${sdkPath}\\emulator', 'User') }"`
    );
  } else {
    const profile = join(homedir(), '.zshrc');
    appendFileSync(
      profile,
      `\n# Android SDK (added by mobilewright training setup check)\nexport ANDROID_HOME="${sdkPath}"\nexport PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"\n`
    );
    info(`Added to ${profile}. Restart your terminal to pick it up.`);
  }
  applyAndroidEnv(sdkPath);
  return true;
}

function showAndroidManualInstructions(sdkPath) {
  info('See docs/android-studio.md for full instructions.');
  if (sdkPath) {
    info(`Detected SDK at: ${sdkPath}`);
    if (IS_WIN) {
      info(`Set ANDROID_HOME to that path and add platform-tools + emulator to PATH.`);
    } else {
      info(`Add to ~/.zshrc: export ANDROID_HOME="${sdkPath}"`);
      info(`export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"`);
    }
  } else {
    info('Install Android Studio, then create an SDK via its Setup Wizard.');
  }
}

header('Android');

let sdkPath = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;

await check('ANDROID_HOME', async () => {
  if (sdkPath && existsSync(join(sdkPath, 'platform-tools'))) {
    ok(`ANDROID_HOME = ${sdkPath}`);
    return;
  }
  const detected = detectSdkPath();
  if (!detected) {
    fail('ANDROID_HOME not set and no SDK found in the default location');
    hasErrors = true;
    showAndroidManualInstructions(undefined);
    return;
  }
  fail('ANDROID_HOME not set, but an SDK was found');
  const fixed = await fixAndroidEnv(detected);
  if (fixed) {
    sdkPath = detected;
    ok(`ANDROID_HOME = ${sdkPath}`);
  } else {
    hasErrors = true;
    showAndroidManualInstructions(detected);
  }
});

await check('adb', () => {
  let version = checkCommand('adb', '--version');
  if (!version && sdkPath) {
    version = checkCommand(join(sdkPath, 'platform-tools', 'adb'), '--version');
  }
  if (version) {
    ok(version.split('\n')[0]);
  } else {
    fail('adb not found on PATH');
    hasErrors = true;
    info('See docs/android-studio.md.');
  }
});

await check('Android emulator', () => {
  let avds = checkCommand('emulator', '-list-avds');
  if (avds === null && sdkPath) {
    avds = checkCommand(join(sdkPath, 'emulator', 'emulator'), '-list-avds');
  }
  if (avds === null) {
    fail('emulator command not found');
    hasErrors = true;
    info('See docs/android-studio.md.');
    return;
  }
  const list = avds.split('\n').map((l) => l.trim()).filter(Boolean);
  if (list.length === 0) {
    fail('No Android Virtual Devices (AVDs) found');
    hasErrors = true;
    info('Open Android Studio -> Device Manager and create one (e.g. Pixel 9, API 36).');
  } else {
    ok('Android emulator found. Available AVDs:');
    list.forEach((avd) => info(`  ${avd}`));
  }
});

await check('running devices', () => {
  const devices = checkCommand('adb', 'devices');
  const lines = (devices || '')
    .split('\n')
    .slice(1)
    .map((l) => l.trim())
    .filter((l) => l && l.endsWith('device'));
  if (lines.length > 0) {
    ok(`${lines.length} device(s)/emulator(s) currently running`);
  } else {
    warn('No running Android devices or emulators (fine before the training)');
  }
});

// ---------------------------------------------------------------------------
// Java (optional: only needed for some Android SDK command-line tooling, not
// documented as a hard mobilecli/mobilewright requirement)
// ---------------------------------------------------------------------------

function detectAndroidStudioPath() {
  if (IS_MAC) {
    const p = '/Applications/Android Studio.app/Contents/jbr/Contents/Home';
    return existsSync(p) ? p : undefined;
  }
  const p = join(homedir(), 'AppData', 'Local', 'Android', 'android-studio', 'jbr');
  return existsSync(p) ? p : undefined;
}

function detectJavaHome() {
  const studioJbr = detectAndroidStudioPath();
  if (studioJbr) return studioJbr;
  if (IS_MAC) {
    const found = run('/usr/libexec/java_home');
    if (found) return found;
  }
  return undefined;
}

async function fixJavaEnv(javaHome) {
  const answer = await ask(`     Set JAVA_HOME to ${javaHome}? [y/N] `);
  if (!answer) return false;
  if (IS_WIN) {
    run(`powershell -NoProfile -Command "[Environment]::SetEnvironmentVariable('JAVA_HOME','${javaHome}','User')"`);
  } else {
    const profile = join(homedir(), '.zshrc');
    appendFileSync(
      profile,
      `\n# Java (added by mobilewright training setup check)\nexport JAVA_HOME="${javaHome}"\n`
    );
    info(`Added to ${profile}. Restart your terminal to pick it up.`);
  }
  process.env.JAVA_HOME = javaHome;
  return true;
}

header('Java (optional)');
info('Only needed for some Android SDK command-line tools (e.g. avdmanager).');
info('Not required to run mobilecli, mobilewright, or adb itself.');

await check('JAVA_HOME', async () => {
  const current = process.env.JAVA_HOME;
  if (current && existsSync(current)) {
    ok(`JAVA_HOME = ${current}`);
    return;
  }
  const detected = detectJavaHome();
  if (!detected) {
    warn('JAVA_HOME not set and no JDK auto-detected (Android Studio bundles one)');
    return;
  }
  warn('JAVA_HOME not set, but a JDK was found (bundled with Android Studio)');
  const fixed = await fixJavaEnv(detected);
  if (fixed) ok(`JAVA_HOME = ${detected}`);
});

// ---------------------------------------------------------------------------
// iOS (macOS only, optional: the course is Android-first; Xcode Command Line
// Tools are only needed for the Module 10 iOS/simulator addendum)
// ---------------------------------------------------------------------------

header('iOS (macOS only, optional)');

if (IS_MAC) {
  info('Only needed for the optional iOS addendum. The course runs Android by default.');
  await check('Xcode Command Line Tools', () => {
    const xcodePath = run('xcode-select -p');
    if (xcodePath) {
      ok(`Command Line Tools, ${xcodePath}`);
    } else {
      warn('Xcode Command Line Tools not found (only needed for the optional iOS addendum)');
      info('Install with: xcode-select --install');
    }
  });
} else {
  info('Skipped on this platform. The course runs Android by default.');
}

// ---------------------------------------------------------------------------
// IDE (VS Code, optional but recommended: any IDE works, this just checks
// for the one the training materials are written against)
// ---------------------------------------------------------------------------

function detectVSCodeApp() {
  if (IS_MAC) {
    const p = '/Applications/Visual Studio Code.app';
    return existsSync(p) ? p : undefined;
  }
  const candidates = [
    join(homedir(), 'AppData', 'Local', 'Programs', 'Microsoft VS Code', 'Code.exe'),
    'C:\\Program Files\\Microsoft VS Code\\Code.exe',
  ];
  return candidates.find((p) => existsSync(p));
}

header('IDE');

await check('VS Code', () => {
  const version = checkCommand('code', '--version');
  if (version) {
    ok(`VS Code ${version.split('\n')[0]}`);
    return;
  }
  const appPath = detectVSCodeApp();
  if (appPath) {
    ok(`VS Code found at ${appPath} (not on PATH)`);
    if (IS_MAC) {
      info('Add it to PATH via VS Code -> View -> Command Palette -> "Shell Command: Install \'code\' command in PATH".');
    }
    return;
  }
  warn('VS Code not found — you need an IDE to open and run this code');
  info('Download from https://code.visualstudio.com/, or use any other IDE you prefer.');
});

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

console.log(`\n${DIM}${'─'.repeat(50)}${RESET}`);

if (hasErrors) {
  console.log(`\n${RED}${BOLD}Some checks failed.${RESET} See the docs/ folder for help, fix the items marked ✘, then run ${BOLD}npm run check${RESET} again.\n`);
  process.exit(1);
} else {
  console.log(`\n${GREEN}${BOLD}All checks passed!${RESET} Your machine is ready for the Mobilewright training.\n`);
}
