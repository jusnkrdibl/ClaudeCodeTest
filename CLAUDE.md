# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working in this repository.

## Running the Games

No build step. Open any HTML file directly in a browser:

```bash
open tictactoe.html
open shooter.html
```

## Git & GitHub Workflow

**After every meaningful change, always commit and push immediately.** This is a hard requirement — never leave completed work uncommitted. Each feature, fix, or improvement gets its own commit before moving on.

```bash
git add <specific-files>
git commit -m "short imperative description"
git push
```

Commit message format: imperative present tense, lowercase, no period. Examples:
- `add dash ability to player`
- `fix enemy spawning at wrong edge on level 3`
- `increase tank health for level 5 balance`

Remote: https://github.com/jusnkrdibl/ClaudeCodeTest

## Project Structure

All games are **single self-contained HTML files** — HTML, CSS, and JS in one file, no dependencies, no build tools, no external assets.

### `shooter.html` — Top-Down Shooter

The entire game lives inside one `<script>` tag, organized by comment sections in this order:

| Section | Purpose |
|---|---|
| `CONSTANTS` | Canvas size (800×600), `TAU`, state machine string constants |
| `CANVAS SETUP` | CSS scaling to fit viewport while keeping logical 800×600 |
| `AUDIO ENGINE` | Web Audio API — procedural sound via oscillators, lazily initialized on first click |
| `INPUT` | `keys{}` map (keydown/keyup), `mouse{x,y,down}` with CSS-scale correction |
| `PARTICLES` | Object pool: `spawnParticles(x,y,count,color)`, update with friction (`*= 0.88`), alpha fade |
| `BULLETS` | Pool with trail array (last 4 positions), lifetime-based culling |
| `ENEMIES` | `Enemy` class + `ENEMY_TYPES` config object; 3 types: `chaser`, `speeder`, `tank` |
| `PLAYER` | Plain object (not a class); `resetPlayer()` for full reset, `processInput()` normalizes diagonal |
| `LEVEL SYSTEM` | `LEVELS` array config → `initLevel(n)` → `spawnQueues` → `spawnScheduler(dt)` |
| `COLLISION` | `circlesOverlap()` uses squared distance (no sqrt); damage is per-second × dt |
| `HUD` | Canvas-drawn health bar with color lerp, score, enemy count, cooldown bar |
| `SCREENS` | `drawMainMenu`, `drawGameOver`, `drawLevelComplete` — store button rects in `btnRects{}` for click detection |
| `GAME STATE` | `handleClick(x,y)` routes clicks based on current `state` string |
| `GAME LOOP` | `requestAnimationFrame`; dt clamped to 50ms max; update → render order |

**State machine:** `MENU → PLAYING → LEVEL_COMPLETE → PLAYING` (repeat) or `PLAYING → GAME_OVER`

**Sprites:** All drawn with Canvas 2D primitives inside `ctx.save()/translate(x,y)/rotate(angle)/restore()` — no image files.

**High score** persisted via `localStorage` key `tds_highscore`.

### `tictactoe.html` — Tic Tac Toe

Simple DOM-based game. Board is 9 `<div class="cell">` elements in a CSS Grid. State: flat `board[9]` array, `current` player (`'X'`/`'O'`), `scores` object. Win detection checks all 8 lines on every move.

## Key Conventions

- **Delta time**: all movement is `position += velocity * dt` (seconds). `dt` is clamped to `0.05s` to prevent physics explosions when the tab is backgrounded.
- **Entity lifecycle**: entities have an `alive` boolean; `cullDead()` filters all pools each frame.
- **Audio**: `ensureAudio()` must be called from a user gesture before any sound plays (browser autoplay policy). Hit sounds are throttled to 50ms minimum gap.
- **Mouse coordinates**: always corrected for CSS scaling — `(e.clientX - rect.left) * (W / rect.width)`.
- **Adding a level**: append an entry to the `LEVELS` array in `shooter.html`. Each entry needs `level`, `title`, `speedMult`, and an `enemies` array of `{type, count, interval}`.
- **Adding an enemy type**: add an entry to `ENEMY_TYPES`, implement a `_drawTypeName(ctx)` method on `Enemy`, and add the case to `Enemy.draw()`.
