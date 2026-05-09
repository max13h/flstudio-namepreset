import type { Preset } from '../types';
import { parse } from '../utils/parser';

export interface DefaultPresetList {
  id: string;
  label: string;
  description: string;
  presets: Preset[];
}

// Raw text is the exact format FL Studio writes to its NamePreset files.
// Each line: Name,$BGRCOLOR,IconIndex  (or Name,, for category rows)
const RAW: Record<string, string> = {
  channel: `Drums,$5926555,4
Perc,$927655,7
Bass,$555792,14
Chords,$579288,12
Hook,$928855,70
Arp,$559288,12
Lead,$556892,13
Pad,$8B9255,86
SFX,$885592,26
Foley,$92557A,24
Kick,$926555,5
Snare,$555792,4
Clap,$689255,43
Hat,$559288,6
Ride,$556892,6
Crash,$92557A,6
Piano,$579255,12
Strings,$928855,3
Harp,$885592,11
Guitar,$556892,2
Acoustic,$557A92,1
Brass,$559288,8
Bell,$62AB9F,78
Organ,$579255,9
Vocal,$885592,20
Synth,$925568,16
Sample,$555792,18
Loop,$559276,19
Control,$928855,36
MIDI,$925557,96`,

  mixerSlot: `EQ,$555792,86
Compressor,$925557,82
Reverb,$559288,87
Delay,$579255,18
Flanger,$555792,16
Chorus,$925557,20
Phaser,$559288,73
Filter,$579255,114
Distortion,$555792,26
Limiter,$925557,36
Glitch,$555792,19
Pitch,$928855,15
Gate,$557A92,17
Lo-fi,$579255,23
Bit crusher,$555792,66
Decimator,$925557,17
Enhancer,$559288,24
Vocoder,$885592,23
Convolution,$555792,18
Multi FX,$925557,109
Expander,$4C4D7F,75
De-esser,$925557,30
Multi band,$556892,72
LFO,$579255,16
Controller,$4C4D7F,36
Gain,$925557,36
Stereo,$4C4D7F,56
Container,$925557,110
Meter,$559288,18
Spectrum,$579255,73`,

  mixerTrack: `Drums,$5926555,4
Perc,$927655,7
Bass,$555792,14
Chords,$579288,12
Hook,$928855,70
Arp,$559288,109
Lead,$556892,13
Pad,$8B9255,86
SFX,$885592,26
Foley,$92557A,24
Kick,$926555,5
Snare,$555792,4
Clap,$689255,43
Hat,$559288,6
Ride,$556892,6
Crash,$92557A,6
Piano,$579255,12
Strings,$928855,3
Harp,$885592,11
Guitar,$556892,2
Acoustic,$557A92,1
Brass,$559288,8
Bell,$62AB9F,78
Organ,$579255,9
Vocal,$885592,20
Synth,$925568,16
Sample,$555792,18
Loop,$559276,19
Control,$928855,36
MIDI,$925557,96
Sub mix,$555792,40
Drum mix,$925557,40
Melodic mix,$559288,40
Pre master,$579255,40
Verb send,$8B9255,87
Delay send,$556892,18
High pass,$6264AB,115
Low pass,$AB6264,114
Mono,$8A5D5E,55
Stereo,$5D5E8A,56
Left chan,$5D788A,57
Right chan,$5D8A75,58
Mid,$8A5D5E,55
Side,$5D5E8A,56
Glitch,$4D7F4C,19
Filter,$4C4D7F,114
Metronome,$885592,99
Preview,$925568,29
Input,$559288,33
Output,$579255,34`,

  playlistTrack: `Drums,$5926555,4
Perc,$927655,7
Bass,$555792,14
Chords,$579288,12
Hook,$928855,70
Arp,$559288,109
Lead,$556892,13
Pad,$8B9255,86
SFX,$885592,26
Foley,$92557A,24
Kick,$926555,5
Snare,$555792,4
Clap,$689255,43
Hat,$559288,6
Ride,$556892,6
Crash,$92557A,6
Piano,$579255,12
Strings,$928855,3
Harp,$885592,11
Guitar,$556892,2
Acoustic,$557A92,1
Brass,$559288,8
Bell,$62AB9F,78
Organ,$579255,9
Vocal,$885592,20
Synth,$925568,16
Sample,$555792,18
Loop,$559276,19
Control,$928855,36
MIDI,$925557,96
Fade in,$916454,74
Fade out,$917554,87
Gating,$545691,17
Filter auto,$54974E,114
Chops,$978B4E,19
Layer,$4E8F97,39
Drop,$4E5097,14
Patterns,$916454,71
Audio,$54974E,75
Automation,$545691,74`,

  pattern: `Drums,$5926555,4
Perc,$927655,7
Bass,$555792,14
Chords,$579288,12
Hook,$928855,70
Arp,$559288,109
Lead,$556892,13
Pad,$8B9255,86
SFX,$885592,26
Foley,$92557A,24
Kick,$926555,5
Snare,$555792,4
Clap,$689255,43
Hat,$559288,6
Ride,$556892,6
Crash,$92557A,6
Piano,$579255,12
Strings,$928855,3
Harp,$885592,11
Guitar,$556892,2
Acoustic,$557A92,1
Brass,$559288,8
Bell,$62AB9F,78
Organ,$579255,9
Vocal,$885592,20
Synth,$925568,16
Sample,$555792,18
Loop,$559276,19
Control,$928855,36
MIDI,$925557,96
Intro,$5926555,71
Chorus,$927655,71
Verse,$555792,71
Bridge,$579288,71
Outro,$928855,71
Breakdown,$518639,71
Drop,$556892,71
Solo,$8B9255,71
Refrain,$885592,71
Theme,$92557A,71`,
};

export const DEFAULT_PRESET_LISTS: DefaultPresetList[] = [
  {
    id: 'channel',
    label: 'Channel',
    description: 'Instrument channels in the Channel Rack',
    presets: parse(RAW.channel),
  },
  {
    id: 'mixerSlot',
    label: 'Mixer Slot',
    description: 'Effect inserts in the Mixer',
    presets: parse(RAW.mixerSlot),
  },
  {
    id: 'mixerTrack',
    label: 'Mixer Track',
    description: 'Mixer routing tracks, groups, and sends',
    presets: parse(RAW.mixerTrack),
  },
  {
    id: 'playlistTrack',
    label: 'Playlist Track',
    description: 'Arrangement tracks in the Playlist',
    presets: parse(RAW.playlistTrack),
  },
  {
    id: 'pattern',
    label: 'Pattern',
    description: 'Patterns placed in the Playlist',
    presets: parse(RAW.pattern),
  },
];
