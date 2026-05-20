# Product

## Register

brand

> Note: index.html is brand register (landing, marketing, conversion). app.html is product register (tool, PWA, feed). Both surfaces have equal design weight. The default register here is brand; override to product when working on app.html.

## Users

Music lovers, primarily in Chile and Latin America, ages roughly 20–35. Already using Spotify or Last.fm. They're in shared physical spaces — commuting, cafes, events, streets — and are curious about the people around them. Not audiophiles searching for new artists; they want the raw social signal of what's actually playing near them right now.

## Product Purpose

Real-time social music radar. See what people near you are listening to this moment. Anonymous chat with strangers who share your taste (or don't). No algorithm, no curation, no recommendations — just what's actually happening, nearby, now.

Free. No RAdAR account. Connects via Spotify or Last.fm. Installable as a PWA.

Success looks like: someone opens the app in a new place, recognizes a song someone nearby is playing, and feels a tiny jolt of unexpected connection.

## Brand Personality

Crudo, honesto, técnico.

Voice: direct and lowercase. No marketing warmth. No exclamation marks. Speaks like a system readout, not a pitch deck. Humor is dry and unannounced.

Emotional goal: the slight unease of being seen + the relief of finding a signal in the noise.

## Anti-references

- **SaaS genérico**: floating mockup heroes, soft gradients, Inter everywhere, green CTAs, "Connect with your team" copy. Safe, frictionless, forgettable.
- **Startup latinoam cool**: vibrant brand colors, flat illustrations, designed explicitly "for young people." Enthusiasm as aesthetic.

## Design Principles

1. **Señal sobre ruido.** Every element transmits information. Nothing is decorative for decoration's sake. If it doesn't carry signal, cut it.
2. **Honestidad técnica.** The UI looks like a real system, not a marketing surface. Monospace labels, borders that describe structure, copy that states facts.
3. **La música es el héroe.** Song titles, artists, distances, proximity — the content is always the most prominent element. Branding stays in the margins.
4. **Sin manipulación.** No dark patterns, no urgency tricks, no social proof theater. Shows what's there; doesn't push.
5. **Extrañeza controlada.** Familiar enough to feel navigable, strange enough to be memorable. The CRT grain, the yellow-green, the radar rings — distinctiveness as strategy.

## Accessibility & Inclusion

- Language: Spanish (es_CL). All UI copy stays in Spanish.
- WCAG AA minimum. Contrast ratios must pass for both normal and large text.
- `prefers-reduced-motion` honored throughout (already implemented in both HTML files).
- No account creation friction. Spotify and Last.fm OAuth are the only gates.
