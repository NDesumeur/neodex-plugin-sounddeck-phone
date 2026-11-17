# SoundDeck

Make retro sound effects for your games, in a few clicks: 16 families, 23 settings, mixes and jingles.

*Version française : [README.md](README.md)*

![SoundDeck](screenshots/1.jpg)

## Phone version

Same look as on PC, in one column: the sound and pads on top, the settings below. Tapping a pad plays it or stores the sound there; a long press takes it back, renames or clears it. The keyboard is replaced by a row of notes (C to C). Exported files are saved to the phone's Downloads/NeoDex folder.

## Pick a random sound

16 families: **coin**, **jump**, **laser**, **explosion**, **power-up**, **hit**, **blip**, **door**, **shot**, **step**, **magic**, **alarm**, **engine**, **menu**, **ouch** and **rise**. Each click draws a new sound from the family and plays it. **🎲 Variant** slightly changes the current sound, **🎲 Full random** draws every setting.

## Tune

- 6 waveforms: square, sawtooth, sine, triangle, noise and metal noise (the NES "short" noise).
- 23 sliders in 5 sections:
  - **Pitch**: pitch, slide, repeat (the slide starting again, for sirens and rises), square width and moving width.
  - **Envelope**: attack, sustain, decay, punch.
  - **Modulation**: vibrato, arpeggio (a pitch jump at a given time), tremolo, and their speeds.
  - **Filters**: filter with resonance, high-pass.
  - **Effects**: distortion, crush (more "8-bit" sound), echo and its delay, volume.
- **🔒** next to a slider (or the waveform): lock it. Variant, Random and the families no longer touch it.
- The waveform is drawn live (the echo in purple), with a cursor while playing; click it (or **Space**) to play the sound.
- **✎** renames the sound, **↶ ↷** (or **Ctrl+Z / Ctrl+Y**) undo and redo. The **history** keeps the last 12 sounds drawn.
- **Keyboard**: **A S D F G H J K** (and **W E T Y U** for sharps) play the sound as notes, over one octave.

## Mix

Stack up to 12 sounds, each with its start time and volume: **+ Current sound** adds it at the end. **Jingles** gives five ready-made ones (victory, defeat, next level, bonus, game over), to edit. **▶ Mix** to listen, **WAV** to export it, and right click on an empty pad to store it there.

## Pads

12 pads to store your sounds (♪) and mixes (♫): click an empty pad to store the current sound, click a full pad to play it, right click to take it back, rename it or clear it. Keys **1** to **9**, **0**, **-** and **=** play the pads, like a drum machine. **Export the bank** and **Open a bank**: the 12 pads in one file. **All as WAV**: one file per pad.

## Export

**Export WAV**: the current sound, mono, at 44.1, 22 or 11 kHz and 16 or 8 bits, ready for a game engine.

## Data

The current sound, the locks, the mix and the pads are kept in the plugin folder. Permission: `storage` only.
