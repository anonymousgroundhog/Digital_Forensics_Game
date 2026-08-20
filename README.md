# 🔍 Digital Forensics Detective

An interactive browser game that teaches digital forensics concepts from
*Digital Forensics, Investigation, and Response* (Chapters 1–4).

You play a forensic investigator working real case scenarios. **Each case is
its own animated world** with its own soundtrack. Every case is a chain of
decisions — seize evidence correctly, keep the chain of custody intact, pick
the right tools, analyze, and survive cross-examination in court. One wrong
move can make your evidence **inadmissible**. Each answer is graded with an
explanation tied back to the source chapter, so you learn by doing.

### Worlds, sound & animation

- **Animated canvas worlds** (one per case): data-stream rain (phishing),
  a dark blinking server room (Ophcrack), a red packet swarm flooding a
  server (DDoS), and spinning RAID platters with an XOR bitstream (RAID).
- **Synthesized audio** — all sound is generated in-code via the Web Audio API
  (no audio files): click/correct/wrong SFX plus a unique ambient drone per
  world. Toggle with the 🔊 button (top-right); preference is saved.
- Per-world color theming, screen flashes on right/wrong answers, and smooth
  world-enter transitions.

> Browsers require a user gesture before audio starts — the ambient sound
> kicks in on your first click or keypress. That's expected.

## Run it

Node.js only — **zero dependencies**. Node 14+ (uses `URL`, `String.startsWith`,
`https.request`); Node 18+ recommended.

```bash
node server.js
```

Then open **http://localhost:3000** in a browser.

Port 3000 already in use? Pick another:

```bash
PORT=4600 node server.js
```

### Windows

Install Node from [nodejs.org](https://nodejs.org/) (the LTS installer — tick
"Add to PATH"), then open a terminal **in the project folder**:

- **File Explorer** → navigate into `Digital_Forensics_Game` → type `cmd` (or
  `powershell`) in the address bar → Enter.
- Or open PowerShell and `cd C:\path\to\Digital_Forensics_Game`.

Then:

```powershell
node server.js
```

Open **http://localhost:3000**.

**Setting a different port.** The `PORT=4600 node server.js` form above is
bash-only — it fails on Windows. Use your shell's syntax instead:

```powershell
# PowerShell
$env:PORT=4600; node server.js
```

```bat
:: Command Prompt (cmd.exe)
set PORT=4600 && node server.js
```

Same pattern for the leaderboard URL (`APPS_SCRIPT_URL`).

**"Cannot find module 'C:\...\server.js'"** — you're in the wrong directory.
`cd` into the folder that contains `server.js`; check with `dir` (cmd) or
`ls` (PowerShell). Node resolves the path relative to the current directory,
not to where the file lives.

**"'node' is not recognized..."** — Node isn't on `PATH`. Reopen the terminal
after installing (PATH changes don't apply to already-open windows); if it
still fails, re-run the installer and enable the PATH option.

**Port already in use** (`EADDRINUSE`) — find and kill the holder:

```powershell
netstat -ano | findstr :3000
taskkill /PID <pid> /F
```

**Firewall prompt** on first run — allow it, or just click Cancel. Localhost
still works either way; the prompt only concerns other machines reaching you.

**Leaderboard fails but the game works** — the leaderboard needs outbound HTTPS
to `script.google.com`. Corporate proxies and TLS-inspecting antivirus block it.
The game is fully playable without it.

Everything else — audio, animation, saved progress — is browser-side and behaves
the same on Windows. Use Chrome, Edge, or Firefox; the Web Audio API needs a
click or keypress before sound starts.

## The cases

Each chapter is split into a **Core** and (where needed) an **Advanced** case so
that together the 7 cases (60 questions) cover **every section** of the chapter
notes. Every case drills exactly one chapter.

| Case | Chapter | Tier | Focus |
|------|---------|------|-------|
| First Principles | Ch 1 | Core | Definitions, process, evidence types, chain of custody, Daubert, laws, warrants, federal guidelines |
| Under the Hood | Ch 1 | Advanced | Memory/volatility, drives & interfaces, file systems, networks/MAC, anti-forensics |
| Know Your Enemy | Ch 2 | Core | Crime roles, phishing, spyware, SQLi, XSS/pharming, Ophcrack |
| The Wider War | Ch 2 | Advanced | Cyberstalking, fraud (pump-dump/419/piracy), DoS/DDoS, viruses, logic bombs, cyberterror |
| By The Book | Ch 3 | Core | Locard, DFRWS/SWGDE, lab security, tools, certifications, expert report |
| First on Scene | Ch 4 | Core | Volatile capture, pull-the-plug, hashing, swap file, Exif, deleted data, timelines |
| The Array | Ch 4 | Advanced | Media handling, HPA/slack, forensic formats, write-blocker/wipe, dd/netcat, RAID/XOR |

**Concepts covered:** order of volatility, RAM capture, write-blockers,
forensic imaging, hashing (MD5/SHA2), chain of custody, the Daubert standard,
expert reports, phishing, SQL injection, XSS, Ophcrack & rainbow tables,
privilege escalation, SYN floods, DDoS botnets, MAC vs. IP spoofing, RAID
levels & XOR parity, hidden data (unallocated/slack space, HPA, bad blocks),
and courtroom admissibility.

Grade **A** on every case = evidence admissible, case holds up in court.

## Project layout

```
server.js          zero-dep Node static file server
public/
  index.html       app shell + HUD + world canvas
  styles.css       forensic-terminal (CRT) theme + per-world accents/animations
  cases.js         all case + decision data (edit here to add cases)
  audio.js         Web Audio synth: SFX + per-world ambient drones
  worlds.js        canvas animation engine (one scene per world)
  game.js          game engine / state machine (wires audio + worlds)
```

## Add your own case

Append an object to the `CASES` array in `public/cases.js`. Each stage needs a
`prompt` and 2–4 `choices`; mark exactly one choice `correct: true` with
`points: 20`, and give every choice an `explain` string. Set the case's
`world` to one of the existing scenes (`phishing`, `server`, `ddos`, `raid`)
plus an `accent` color, `scene` name, and `icon`. That's it — the menu,
scoring, grading, animated world, and soundtrack pick it up automatically.

To add a **brand-new world**, add a scene to `SCENES` in `worlds.js` and an
ambient config to `WORLDS` in `audio.js` using the same key, then reference
that key as the case's `world`.

Progress (best grade per case) is saved in the browser via `localStorage`.
