# Node.js

The training repo requires **Node.js 24 or newer**.

## macOS

Using [nvm](https://github.com/nvm-sh/nvm) is recommended so you don't clash
with any Node version already installed by other tools:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
# restart your terminal, then:
nvm install 24
nvm use 24
```

Alternatively, install directly from [nodejs.org](https://nodejs.org/) (pick
the "24.x LTS" or later installer).

## Windows 11

Using [nvm-windows](https://github.com/coreybutler/nvm-windows) is
recommended:

1. Download and run the installer from the
   [nvm-windows releases page](https://github.com/coreybutler/nvm-windows/releases).
2. Open a **new** terminal, then run:
   ```powershell
   nvm install 24
   nvm use 24
   ```

Alternatively, install directly from [nodejs.org](https://nodejs.org/) (pick
the "24.x LTS" or later Windows installer).

## Verify

```bash
node --version   # should print v24.x.x or newer
npm --version
```

Then re-run `npm run check` from this project.
