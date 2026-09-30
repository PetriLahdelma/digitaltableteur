# Garage Junction media alternative

Goal: expose the verified visual information without requiring sight, while preserving the original media and honestly retaining the unresolved caption gap.

The source is a static promotional card for the entire 34-second clip. Frame sampling in both available formats and FFmpeg freeze detection confirm this; the audio content has not been transcribed. The card contains the Garage Junction name, October 13th, a white G on orange and a white cross on a blue band.

Options considered: a visible text description; a narrated alternate version; both. The intended end state uses both, but only the verified visual text ships in this increment. The locally generated narration prototype is withheld because publication rights for the installed system voice are not cleared. Do not narrate over unreviewed original audio or invent its captions.

Reuse the page's Text primitive beside the original player and associate it with aria-describedby. Preserve the original WebM and MP4 files. A future narrated version must use an owned recording or a voice licensed for publication; it should introduce the static card, then retain the complete original audio. Keep the narration script below, but do not publish the experimental system-voice output.

Verification: regression for the visible description and programmatic relationship; rendered AA and reflow checks in every theme; production build and normal repository gates. A visual text alternative does not establish that the original audio is captioned or that every published video conforms.

## Narration script for an approved recording

Visual description. A static promotional card shows a white G in an orange square. Below it, blue text reads Garage Junction and October thirteenth. A white cross sits in a blue band below. The card remains on screen throughout the video. The original audio now follows.
