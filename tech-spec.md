# Anish-Verse Trading Card Generator — Product Spec

## Overview

A web app for Anish's going-away party ("Into the Anish-Verse") where guests can create custom trading cards of themselves dressed as a version of Anish. Users fill out a short form, an AI image model generates the card artwork, and they can view/download their finished card. An admin gallery stores all generated cards.

**Live URL target:** Vercel deployment, shareable link for the Partiful invite.

---

## User Flow

### 1. Landing Page
- Full-screen hero with the "SELECT YOUR ANISH" arcade vibe
- Animated title text with neon glow effect
- Brief tagline: something like *"Create your own Anish trading card"*
- Single CTA button: **"Create Your Card"** (scrolls to or navigates to the form)
- The cover image from the Partiful invite can optionally be displayed here

### 2. Card Creation Form

The form should feel fun and interactive, not like a boring form. Think: arcade machine inserting a coin.

**Fields:**

| Field | Type | Details |
|-------|------|---------|
| Card Title | Text input | The character class name. Placeholder/default: *"What's your favorite Anish?"* Examples: "RUNNER", "CHEF", "GYM BRO". Max ~30 chars. |
| Character Description | Textarea | Prompt describing how the character should look. Placeholder: *"Describe your version of Anish..."* This is the main input for the image generation prompt. Max ~300 chars. |
| Stat 1 Name | Text input | e.g. "SPD", "STR", "CHA". Max ~12 chars. |
| Stat 1 Level | Slider | Scale of 1–6 (rendered as filled/empty blocks like ████░░) |
| Stat 2 Name | Text input | e.g. "INT", "FLV", "EMO". Max ~12 chars. |
| Stat 2 Level | Slider | Scale of 1–6 (same visual) |

**Form UX notes:**
- Sliders should show the stat bar preview in real-time as the user drags (the ████░░ blocks updating live)
- Pre-populate with fun defaults so users can hit generate immediately if they want (e.g. Title: "GYM BRO", Stat 1: "STR" at 5, Stat 2: "SPD" at 3)
- Include a "Randomize" button that fills in a random preset (pick from ~8-10 fun presets like the archetypes from the party invite)
- Validate that all fields are filled before allowing generation
- Mobile: single-column stacked layout. Desktop: can be wider but keep it centered and contained (~500px max form width)

### 3. Generation / Loading State
- After hitting "Generate", show a fun loading state
- Arcade-themed: a "NOW LOADING..." screen with pixel art animation, or a fake "inserting coin" animation
- Show a progress indicator — even if it's just a spinner with cycling flavor text like:
  - *"Scanning the Anish-Verse..."*
  - *"Calibrating neon levels..."*
  - *"Generating your variant..."*
  - *"Almost there..."*
- Expect generation to take 5–15 seconds depending on the model
- If generation fails, show a friendly error with a "Try Again" button

### 4. Card Display / Result
- Show the generated trading card image prominently
- Overlay the card metadata on top of or below the generated image to create the final composite card:
  - **Card title** at the bottom in arcade font
  - **Two stat bars** rendered below the title
  - **Neon border/glow** around the card matching the vibe
- **"Download"** button — downloads the final composite card as a PNG
- **"Create Another"** button — returns to the form (cleared or with new randomized defaults)
- The final downloadable image should be the composite (generated image + overlaid title + stats), not just the raw AI image

### 5. Admin Gallery (`/admin?key=<SECRET>`)
- Protected by a secret query parameter (env var `ADMIN_SECRET`)
- If `?key=` doesn't match, show a 404 or redirect to home
- Displays a grid of ALL generated cards (newest first)
- Each card shows: the composite image, title, stats, timestamp
- Click to view full-size
- Download individual cards or bulk download all as a zip
- Simple, functional UI — doesn't need the full arcade theme (but dark theme to stay consistent is nice)

---

## Visual Design & Theme

### Overall Vibe
Arcade / retro gaming character select screen. Think neon-soaked, dark backgrounds, glowing UI elements. The whole app should feel like you're standing at an arcade cabinet.

### Color Palette
- **Background:** Dark navy/black (#0a0a1a or similar)
- **Primary accent:** Neon cyan/blue (#00f0ff)
- **Secondary accent:** Neon pink/magenta (#ff00aa)
- **Tertiary:** Neon green (#00ff88), neon orange (#ff8800) — used sparingly
- **Text:** White with subtle glow effects
- **Card borders:** Gradient neon glow (cycling or based on stat values)

### Typography
- **Headings / Title:** A pixel/arcade-style font. Options:
  - "Press Start 2P" (Google Fonts — true pixel font)
  - "Orbitron" (Google Fonts — clean futuristic)
  - Or any free arcade-style font
- **Body / Form labels:** Clean sans-serif (Inter, system font) for readability
- **Stat labels on cards:** Monospace or pixel font to match the ████░░ aesthetic

### Key Visual Elements
- Subtle animated background: a dark NYC skyline silhouette with slowly pulsing neon lights or floating particles/stars
- Neon glow effects on buttons and interactive elements (CSS `box-shadow` with color spread)
- Stat bars rendered as filled/empty blocks: `████░░` style, with the filled portion glowing in the card's accent color
- Card borders with animated gradient glow
- Scanline or CRT overlay effect (very subtle, CSS only) for extra retro flavor — optional, should be toggleable or very light so it doesn't interfere with readability on mobile

### Mobile Considerations
- Touch-friendly slider controls (larger hit targets)
- Full-width card display
- No hover-dependent interactions
- Buttons minimum 44px tap targets
- Form should be comfortable to fill out with one thumb

---

## Image Generation

### Provider: Google Gemini — Nano Banana Pro

We're using **Nano Banana Pro** (Gemini 3 Pro Image Preview), Google's state-of-the-art image generation model. It's part of the Gemini API and excels at rendering text in images, following complex prompts, and producing high-fidelity stylized output — all of which matter for our trading card use case.

**Model details:**
- **Model ID:** `gemini-3-pro-image-preview`
- **Fallback model:** `gemini-2.5-flash-image` (Nano Banana — faster, cheaper, lower quality)
- **Node.js SDK:** `@google/genai`
- **Pricing:**
  - Nano Banana Pro: ~$0.134/image at 1K-2K resolution, ~$0.24/image at 4K
  - Nano Banana (Flash): ~$0.039/image at 1K resolution
- **Output:** Returns base64-encoded image data inline in the response
- **All images include a SynthID watermark** (invisible, standard for all Gemini-generated images)

**Recommendation:** Start with Nano Banana Pro (`gemini-3-pro-image-preview`) for quality. If cost or speed becomes an issue, fall back to `gemini-2.5-flash-image`. At ~300 images with Pro, total cost is ~$40. With Flash, ~$12.

### Node.js Integration

Install the SDK:
```bash
npm install @google/genai
```

Server-side generation code (in API route):
```typescript
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateCardImage(prompt: string): Promise<Buffer> {
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-image-preview",  // or "gemini-2.5-flash-image" for fallback
    contents: prompt,
    config: {
      responseModalities: ["TEXT", "IMAGE"],
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return Buffer.from(part.inlineData.data, "base64");
    }
  }

  throw new Error("No image returned from Gemini");
}
```

**Important notes:**
- The response can contain both text and image parts — iterate through `parts` and check for `inlineData`
- The image is returned as base64 — decode it to a Buffer for storage/processing
- Set `responseModalities: ["TEXT", "IMAGE"]` to enable image output
- No separate "negative prompt" parameter — instead, include guidance in the prompt itself (e.g., "do not include multiple people")

### Prompt Engineering

The user provides a character description, but the actual prompt sent to the model should be wrapped in a template that ensures visual consistency:

```
Template:
"Video game character select portrait, [CARD_TITLE] character class, [USER_DESCRIPTION], 
Indian-American man in his mid-20s, stylized NYC skyline at night background with neon lights, 
character portrait in rectangular panel with [GLOW_COLOR] neon glow border, 
semi-realistic cel-shaded art style, vibrant neon color palette, arcade game aesthetic, 
Street Fighter character select screen style, upper body portrait, facing forward.
Do not include multiple people. Do not make it photorealistic."
```

Where:
- `[CARD_TITLE]` = the user's card title
- `[USER_DESCRIPTION]` = the user's character description
- `[GLOW_COLOR]` = derived from the card or randomized (cyan, pink, green, orange, purple, gold)

Nano Banana Pro is particularly good at following complex, multi-constraint prompts thanks to its "Thinking" reasoning layer, so the template can be detailed.

### Image Specs
- **Output resolution:** Request 1024x1024 (1K) to keep costs at ~$0.134/image with Pro
- **Format:** PNG (decoded from base64 response)
- **Generation timeout:** 30 seconds, then show error

### Composite Card Assembly
After the AI generates the raw character image, the app composites the final trading card:

**Option A (Recommended): Server-side compositing with Sharp or Canvas**
- Take the generated image
- Add a styled border/frame overlay
- Render the card title text at the bottom
- Render the two stat bars below the title
- Export as final PNG

**Option B: Client-side compositing with HTML Canvas**
- Render the card as an HTML element with the image + overlays
- Use `html2canvas` or Canvas API to capture as PNG for download

Option A is preferred for consistency and download quality. The card template/frame should be a pre-designed asset.

### Card Layout (Final Composite)

```
┌──────────────────────────┐
│ ┌──────────────────────┐ │  ← Neon glow border
│ │                      │ │
│ │                      │ │
│ │   AI GENERATED       │ │
│ │   CHARACTER          │ │
│ │   IMAGE              │ │
│ │                      │ │
│ │                      │ │
│ ├──────────────────────┤ │
│ │  ══ CARD TITLE ══    │ │  ← Arcade font, centered
│ │                      │ │
│ │  STR ████████░░░░    │ │  ← Stat 1 with glow
│ │  SPD ██████░░░░░░    │ │  ← Stat 2 with glow
│ └──────────────────────┘ │
└──────────────────────────┘
```

---

## Tech Stack

### Frontend
- **Next.js 14+** (App Router)
- **TypeScript**
- **Tailwind CSS** for styling
- **Framer Motion** for animations (loading states, transitions)
- Custom CSS for neon glow effects, scanlines, and arcade aesthetics

### Backend (Next.js API Routes)
- `POST /api/generate` — accepts form data, calls Gemini API (Nano Banana Pro), composites final card, stores images in Supabase Storage, saves metadata to Supabase Postgres, returns card image URL
- `GET /api/cards` — returns all cards (admin only, requires secret)
- `GET /api/cards/[id]` — returns a specific card's metadata + image URLs
- `GET /api/cards/download-all` — bulk download as zip (admin only)

### Storage & Database: Supabase (Free Tier)

Supabase provides both file storage and a Postgres database in one platform. The free tier is more than sufficient for this project.

**Free tier limits:**
- **Database:** 500 MB (we'll use ~1 MB for card metadata — plenty of headroom)
- **File storage:** 1 GB (at ~500KB per image × 300 cards × 2 versions = ~300 MB — well within limits)
- **Bandwidth:** 10 GB (5 GB cached + 5 GB uncached)
- **Max file size:** 50 MB per file (our images will be ~500KB-1MB)
- **Auth users:** 50K MAU (not using auth, but available)
- **⚠️ Important:** Free projects pause after 1 week of inactivity. You'll need to keep the project active during the party window (just visit the dashboard periodically, or ping it with a cron)

**What we use:**
- **Supabase Storage** — store raw AI-generated images and final composite card images in a public bucket
- **Supabase Postgres** — store card metadata (title, stats, timestamps, image URLs)
- **Supabase JS Client** — `@supabase/supabase-js` for both server-side and (if needed) client-side access

Install:
```bash
npm install @supabase/supabase-js
```

**Storage bucket setup:**
- Create a public bucket called `cards` (so images can be served via URL without auth)
- Upload both `raw/` and `composite/` images with the card ID as filename

**Database table: `cards`**
```sql
CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  stat1_name TEXT NOT NULL,
  stat1_level INTEGER NOT NULL CHECK (stat1_level BETWEEN 1 AND 6),
  stat2_name TEXT NOT NULL,
  stat2_level INTEGER NOT NULL CHECK (stat2_level BETWEEN 1 AND 6),
  raw_image_path TEXT,
  composite_image_path TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

Image URLs are constructed from the storage bucket path:
```
https://<project-ref>.supabase.co/storage/v1/object/public/cards/composite/<card-id>.png
```

### Image Processing
- **Sharp** (server-side) for compositing the final card image (overlay text, stats, border onto the AI-generated image)
- Or **@napi-rs/canvas** for more complex rendering with text layout

### Key Dependencies
```json
{
  "@google/genai": "...",           // Gemini API (Nano Banana Pro)
  "@supabase/supabase-js": "...",   // Supabase client
  "sharp": "...",                   // Image compositing
  "framer-motion": "...",           // Animations
  "archiver": "..."                 // Zip file generation for bulk download
}
```

### Environment Variables
```
GEMINI_API_KEY=             # Google AI Studio API key for Nano Banana Pro
GEMINI_MODEL=               # Model ID (default: "gemini-3-pro-image-preview", fallback: "gemini-2.5-flash-image")
NEXT_PUBLIC_SUPABASE_URL=   # Supabase project URL (e.g. https://xxxxx.supabase.co)
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # Supabase anon/public key (safe for client-side)
SUPABASE_SERVICE_ROLE_KEY=  # Supabase service role key (server-side only, for storage uploads)
ADMIN_SECRET=               # Secret key for admin gallery access
MAX_GENERATIONS=            # Hard cap on total generations (default: 500)
```

---

## Data Model

### Card (TypeScript type, mirrors Supabase Postgres table)
```typescript
interface Card {
  id: string;                  // UUID (auto-generated by Postgres)
  title: string;               // Card class name ("RUNNER", "CHEF", etc.)
  description: string;         // User's character description (the prompt input)
  stat1_name: string;          // e.g. "SPD"
  stat1_level: number;         // 1-6
  stat2_name: string;          // e.g. "STR"
  stat2_level: number;         // 1-6
  raw_image_path: string;      // Supabase Storage path (e.g. "raw/<id>.png")
  composite_image_path: string; // Supabase Storage path (e.g. "composite/<id>.png")
  created_at: string;          // ISO timestamp (auto-generated by Postgres)
}
```

---

## API Routes

### `POST /api/generate`

**Request body:**
```json
{
  "title": "RUNNER",
  "description": "Short shorts, race bib, AirPods in, mid-stride with intense stare",
  "stat1Name": "SPD",
  "stat1Level": 5,
  "stat2Name": "STR",
  "stat2Level": 3
}
```

**Process:**
1. Validate input (all fields required, levels 1–6, reasonable string lengths)
2. Check generation count against MAX_GENERATIONS cap
3. Construct the image generation prompt from the template + user input
4. Call Gemini API (Nano Banana Pro) — response contains base64-encoded image
5. Decode the base64 image to a Buffer
6. Composite the final trading card using Sharp (add border, title, stats onto the generated image)
7. Upload both raw and composite images to Supabase Storage (`cards/raw/<id>.png`, `cards/composite/<id>.png`)
8. Insert card metadata into Supabase Postgres `cards` table
9. Return the composite image URL + card ID

**Response:**
```json
{
  "id": "abc123",
  "compositeImageUrl": "https://...",
  "rawImageUrl": "https://..."
}
```

**Error handling:**
- 400: Validation errors
- 500: Image generation failure (return user-friendly message)
- 504: Timeout (generation took too long)
- Rate limit: Consider a simple rate limit (e.g. max 3 generations per minute per IP) to prevent abuse

### `GET /api/cards?key=<ADMIN_SECRET>`
- Returns array of all cards, newest first
- 401 if key doesn't match

### `GET /api/cards/[id]`
- Returns card metadata + image URLs
- Public (so download links work)

### `GET /api/cards/download-all?key=<ADMIN_SECRET>`
- Generates a zip of all composite images
- Returns as file download

---

## Presets / Randomizer

Include ~8-10 preset configurations for the "Randomize" button. These correspond to the Anish archetypes:

```typescript
const PRESETS = [
  {
    title: "RUNNER",
    description: "Short shorts, race bib pinned on, AirPods in, mid-stride with intense thousand-yard stare, holding phone showing Strava",
    stat1Name: "SPD", stat1Level: 6,
    stat2Name: "STR", stat2Level: 3,
  },
  {
    title: "CHEF",
    description: "Apron splattered with turmeric stains, wooden spoon raised like a sword, big grin, surrounded by clouds of spice and steam, pot of curry bubbling behind",
    stat1Name: "STR", stat1Level: 4,
    stat2Name: "FLV", stat2Level: 6,
  },
  {
    title: "TRAVELER",
    description: "Massive overstuffed backpack, camera around neck, Google Maps open on 3 devices, wide-eyed expression of wonder, boarding pass tucked behind ear",
    stat1Name: "DEX", stat1Level: 2,
    stat2Name: "WIS", stat2Level: 6,
  },
  {
    title: "GUITARIST",
    description: "Acoustic guitar slung over shoulder, eyes closed in deep feeling, playing to an audience of zero, single warm spotlight",
    stat1Name: "CHA", stat1Level: 5,
    stat2Name: "EMO", stat2Level: 6,
  },
  {
    title: "PERFORMATIVE",
    description: "Walking with canvas tote bag over shoulder, copy of Norwegian Wood poking out with spine visible, iced coffee in other hand, expression says I hope someone notices what I'm reading",
    stat1Name: "CHA", stat1Level: 6,
    stat2Name: "REL", stat2Level: 1,
  },
  {
    title: "DID YOU KNOW I USED TO WORK AT CITADEL?",
    description: "Wearing oversized crewneck sweatshirt with giant Citadel logo, casually bringing it up to someone who didn't ask, proud smirk",
    stat1Name: "INT", stat1Level: 6,
    stat2Name: "HON", stat2Level: 1,
  },
  {
    title: "FINANCE BRO",
    description: "Patagonia vest over button-down, Bloomberg terminal reflected in eyes, checking portfolio on phone, pretending to be casual about it",
    stat1Name: "INT", stat1Level: 5,
    stat2Name: "CHA", stat2Level: 4,
  },
  {
    title: "AI PILLED",
    description: "Multiple monitors showing ChatGPT, wearing a hoodie, explaining transformers to someone at a party, glazed look in eyes",
    stat1Name: "INT", stat1Level: 6,
    stat2Name: "SOC", stat2Level: 1,
  },
];
```

---

## Non-Functional Requirements

### Performance
- Page load: < 2 seconds (Vercel edge, optimized images)
- Image generation: aim for < 15 seconds. Show engaging loading state.
- Final composite rendering: < 2 seconds server-side

### Rate Limiting
- Max 3 card generations per IP per 10-minute window
- Show friendly message: "Whoa, slow down! The Anish-Verse needs a moment to recharge."

### Cost Management
- **Nano Banana Pro:** ~$0.134/image at 1K resolution
- **Nano Banana (Flash):** ~$0.039/image at 1K resolution
- At ~100 party guests with 2-3 cards each = ~300 generations
  - With Pro: ~$40 total
  - With Flash: ~$12 total
- Set a hard cap via env var (`MAX_GENERATIONS=500`) and show a "sold out" message after
- **Supabase:** Free tier, $0
- **Vercel:** Free tier for hobby, $0
- **Total estimated cost: $12-40** depending on model choice

### Accessibility
- Form inputs properly labeled
- Sufficient color contrast on interactive elements (neon on dark is generally fine)
- Keyboard navigable
- Loading states announced to screen readers

### Browser Support
- Modern mobile browsers (Safari iOS, Chrome Android) — primary
- Desktop Chrome, Firefox, Safari — secondary
- No IE support needed

---

## File Structure (Suggested)

```
/app
  /page.tsx                  # Landing + form (single page app feel)
  /admin/page.tsx            # Admin gallery
  /api
    /generate/route.ts       # POST: generate card
    /cards/route.ts          # GET: list all cards (admin)
    /cards/[id]/route.ts     # GET: single card
    /cards/download-all/route.ts  # GET: bulk download
/components
  /CardForm.tsx              # The creation form
  /CardDisplay.tsx           # Result display with download
  /StatBar.tsx               # Reusable stat bar component (████░░)
  /LoadingScreen.tsx         # Arcade-style loading animation
  /NeonButton.tsx            # Styled button component
  /AdminGallery.tsx          # Admin grid view
/lib
  /image-generator.ts        # Gemini API wrapper (Nano Banana Pro / Flash)
  /card-compositor.ts        # Server-side card compositing logic
  /supabase.ts               # Supabase client (server + public)
  /db.ts                     # Card metadata CRUD (Supabase Postgres)
  /storage.ts                # Image upload/download (Supabase Storage)
  /prompts.ts                # Prompt templates
  /presets.ts                # Card presets
  /rate-limit.ts             # Rate limiting logic
/public
  /fonts/                    # Arcade fonts
  /assets/                   # Card frame template, background images
```

---

## Out of Scope (v1)

- User accounts / authentication (beyond admin)
- Card sharing via unique public URLs
- Social media sharing integration
- Card trading / collecting mechanics
- Real-time multiplayer card reveals
- Custom color/border selection per card
- Gallery voting or ranking

---

## Launch Checklist

- [ ] Create Supabase project and set up `cards` table + `cards` storage bucket (public)
- [ ] Get Gemini API key from Google AI Studio (https://aistudio.google.com/apikey)
- [ ] Deploy to Vercel
- [ ] Set all env vars in Vercel dashboard (GEMINI_API_KEY, SUPABASE_*, ADMIN_SECRET, MAX_GENERATIONS)
- [ ] Test on iPhone Safari (primary device for party guests)
- [ ] Test on Android Chrome
- [ ] Test on desktop
- [ ] Verify admin gallery works with secret key
- [ ] Verify rate limiting works
- [ ] Verify Supabase free tier is not paused (visit dashboard to keep active)
- [ ] Test download functionality
- [ ] Generate a few test cards to verify prompt quality
- [ ] Set MAX_GENERATIONS cap
- [ ] Add the app URL to the Partiful invite
