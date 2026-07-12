# ObsidianSSH

A dark, rail-based terminal/SSH/SFTP client — a skinned fork of [electerm](https://github.com/electerm/electerm).

ObsidianSSH keeps everything electerm can do (terminal, ssh, sftp, ftp, telnet, serialport, RDP, VNC, Spice) and replaces the stock interface with a custom UI:

- Left icon rail + collapsible bookmarks sidebar instead of the stock tab chrome
- Unified dark theme based on the Obsidian design system (see [OBSIDIAN_DESIGN_SYSTEM.md](OBSIDIAN_DESIGN_SYSTEM.md))
- Reworked macros panel, tab strip, and top bar
- Consistent pill-style scrollbars everywhere
- Custom splash screen and branding

All connection, terminal, and transfer functionality is inherited from upstream electerm — this fork only changes the UI layer, gated behind a single build flag, so it can keep pulling upstream fixes and features.

## Install

Grab the latest `.tar.gz` from [Releases](https://github.com/ImStillBlue/ObsidianSSH/releases) (Linux x64), extract it anywhere, and run the `electerm` binary inside. Or build from source:

```sh
git clone https://github.com/ImStillBlue/ObsidianSSH.git
cd ObsidianSSH
npm install
npm run b     # build renderer + prepare app bundle
npm run pb    # copy electron-builder config to repo root
WORKFLOW_NAME=local node_modules/.bin/electron-builder --linux tar.gz --publish never
```

The packaged app lands in `dist/` (`linux-unpacked/` plus a `.tar.gz`). For macOS/Windows swap `--linux tar.gz` for `--mac` / `--win` (untested by this fork).

### Building the stock electerm UI instead

The custom UI is the default. To build or run with the original electerm interface, set `CUSTOM_UI=0`:

```sh
CUSTOM_UI=0 npm run b
```

## Development

```sh
npm install
npm start           # vite dev server
npm run app         # electron app against the dev server (separate terminal)
```

Set `CUSTOM_UI=0` in the environment (or `build/vite/.env`) to develop against the stock UI.

## Staying current with upstream

This fork tracks [electerm/electerm](https://github.com/electerm/electerm):

```sh
git remote add upstream https://github.com/electerm/electerm.git
git fetch upstream
git merge upstream/master
```

Because the skin lives in `src/client/components/custom-ui/` and is gated on one flag, upstream merges are usually conflict-free.

## Credits & license

ObsidianSSH is a fork of [electerm](https://github.com/electerm/electerm) by [ZHAO Xudong](https://github.com/zxdong262) and contributors — all core functionality is theirs. See the upstream project for full documentation ([wiki](https://github.com/electerm/electerm/wiki)), the web version, downloads of stock electerm, and to support the original author.

Like upstream, this project is licensed under the [MIT License](LICENSE).
