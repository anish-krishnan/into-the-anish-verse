import sharp from "sharp";
import path from "path";

// Set up fontconfig to find our bundled Press Start 2P font
const FONTS_DIR = path.join(process.cwd(), "public", "fonts");
if (!process.env.FONTCONFIG_FILE) {
  process.env.FONTCONFIG_FILE = path.join(FONTS_DIR, "fonts.conf");
}

const CARD_W = 1024;
const CARD_H = 1434; // 5:7 aspect ratio
const IMAGE_H = 1178; // 1:1.15 ratio image area
const PANEL_H = CARD_H - IMAGE_H; // 256px bottom panel
const BORDER_INSET = 16;
const CYAN = "#00f0ff";
const NAVY = "#0a0a1a";
const FONT_NAME = "Press Start 2P";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function createNeonBorder(
  width: number,
  height: number,
  color: string
): Promise<Buffer> {
  const r = 16;

  // Inner glow — inset so it doesn't bleed outside
  const innerGlowSvg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect x="${BORDER_INSET}" y="${BORDER_INSET}" width="${width - BORDER_INSET * 2}" height="${height - BORDER_INSET * 2}" rx="${r + 4}" ry="${r + 4}" fill="none" stroke="${color}" stroke-width="30" opacity="0.35"/>
  </svg>`;
  const innerGlow = await sharp(Buffer.from(innerGlowSvg))
    .blur(12)
    .png()
    .toBuffer();

  // Crisp border line
  const borderSvg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect x="${BORDER_INSET}" y="${BORDER_INSET}" width="${width - BORDER_INSET * 2}" height="${height - BORDER_INSET * 2}" rx="${r}" ry="${r}" fill="none" stroke="${color}" stroke-width="10" opacity="0.95"/>
  </svg>`;
  const borderLayer = await sharp(Buffer.from(borderSvg)).png().toBuffer();

  return sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      { input: innerGlow, blend: "screen" },
      { input: borderLayer, blend: "over" },
    ])
    .png()
    .toBuffer();
}

async function createGlowingDivider(width: number): Promise<{ image: Buffer; height: number }> {
  const divH = 60; // total height for line + glow
  const lineY = Math.round(divH / 2);

  // Crisp line
  const lineSvg = `<svg width="${width}" height="${divH}" xmlns="http://www.w3.org/2000/svg">
    <line x1="${BORDER_INSET + 10}" y1="${lineY}" x2="${width - BORDER_INSET - 10}" y2="${lineY}" stroke="${CYAN}" stroke-width="6" opacity="0.9"/>
  </svg>`;
  const lineBuffer = await sharp(Buffer.from(lineSvg)).png().toBuffer();

  // Glow version
  const glowSvg = `<svg width="${width}" height="${divH}" xmlns="http://www.w3.org/2000/svg">
    <line x1="${BORDER_INSET + 10}" y1="${lineY}" x2="${width - BORDER_INSET - 10}" y2="${lineY}" stroke="${CYAN}" stroke-width="18" opacity="0.4"/>
  </svg>`;
  const glowBuffer = await sharp(Buffer.from(glowSvg))
    .blur(10)
    .png()
    .toBuffer();

  const composited = await sharp({
    create: {
      width,
      height: divH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      { input: glowBuffer, blend: "screen" },
      { input: lineBuffer, blend: "over" },
    ])
    .png()
    .toBuffer();

  return { image: composited, height: divH };
}

async function renderTitle(title: string): Promise<{ image: Buffer; width: number; height: number }> {
  const escapedTitle = escapeXml(title.toUpperCase());

  // Render the title text in white using Press Start 2P
  const titleText = await sharp({
    text: {
      text: `<span foreground="white">${escapedTitle}</span>`,
      font: FONT_NAME,
      dpi: 400,
      rgba: true,
    },
  })
    .png()
    .toBuffer();

  const titleMeta = await sharp(titleText).metadata();
  let tw = titleMeta.width!;
  let th = titleMeta.height!;

  // Scale down if too wide
  const maxTitleWidth = CARD_W - 80;
  let scaledTitleText = titleText;
  if (tw > maxTitleWidth) {
    const scale = maxTitleWidth / tw;
    const newW = Math.round(tw * scale);
    const newH = Math.round(th * scale);
    scaledTitleText = await sharp(titleText)
      .resize(newW, newH, { fit: "inside" })
      .png()
      .toBuffer();
    tw = newW;
    th = newH;
  }

  // Create cyan glow version
  const glowText = await sharp({
    text: {
      text: `<span foreground="${CYAN}">${escapedTitle}</span>`,
      font: FONT_NAME,
      dpi: 400,
      rgba: true,
    },
  })
    .png()
    .toBuffer();

  let scaledGlowText = glowText;
  if (titleMeta.width! > maxTitleWidth) {
    scaledGlowText = await sharp(glowText)
      .resize(tw, th, { fit: "inside" })
      .png()
      .toBuffer();
  }

  // Blur for neon glow
  const glowBlurred = await sharp(scaledGlowText)
    .blur(10)
    .png()
    .toBuffer();

  const glowBlurredWide = await sharp(scaledGlowText)
    .blur(20)
    .png()
    .toBuffer();

  // Composite: glow layers + crisp white text
  const padX = 50;
  const padY = 10;
  const canvasW = tw + padX * 2;
  const canvasH = th + padY * 2;

  const composited = await sharp({
    create: {
      width: canvasW,
      height: canvasH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      { input: glowBlurredWide, left: padX, top: padY, blend: "screen" },
      { input: glowBlurred, left: padX, top: padY, blend: "screen" },
      { input: scaledTitleText, left: padX, top: padY, blend: "over" },
    ])
    .png()
    .toBuffer();

  return { image: composited, width: canvasW, height: canvasH };
}

async function buildGlowingBlocks(level: number, maxBlocks: number): Promise<{ image: Buffer; width: number; height: number }> {
  const blockW = 30;
  const blockH = 24;
  const blockGap = 5;
  const filledColor = CYAN;
  const emptyColor = "#444444";
  const svgW = maxBlocks * (blockW + blockGap) - blockGap;
  const svgH = blockH;
  const pad = 12; // padding for glow

  // Crisp blocks
  let rects = "";
  for (let i = 0; i < maxBlocks; i++) {
    const color = i < level ? filledColor : emptyColor;
    const opacity = i < level ? "1" : "0.5";
    const x = i * (blockW + blockGap);
    rects += `<rect x="${x}" y="0" width="${blockW}" height="${blockH}" rx="3" ry="3" fill="${color}" opacity="${opacity}"/>`;
  }
  const crispSvg = `<svg width="${svgW}" height="${svgH}" xmlns="http://www.w3.org/2000/svg">${rects}</svg>`;
  const crispBuf = await sharp(Buffer.from(crispSvg)).png().toBuffer();

  // Glow layer — only filled blocks
  let glowRects = "";
  for (let i = 0; i < maxBlocks; i++) {
    if (i < level) {
      const x = i * (blockW + blockGap);
      glowRects += `<rect x="${x}" y="0" width="${blockW}" height="${blockH}" rx="3" ry="3" fill="${filledColor}" opacity="0.6"/>`;
    }
  }
  const glowSvg = `<svg width="${svgW}" height="${svgH}" xmlns="http://www.w3.org/2000/svg">${glowRects}</svg>`;
  const glowBuf = await sharp(Buffer.from(glowSvg)).blur(6).png().toBuffer();

  const canvasW = svgW + pad * 2;
  const canvasH = svgH + pad * 2;

  const composited = await sharp({
    create: { width: canvasW, height: canvasH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([
      { input: glowBuf, left: pad, top: pad, blend: "screen" as const },
      { input: crispBuf, left: pad, top: pad, blend: "over" as const },
    ])
    .png()
    .toBuffer();

  return { image: composited, width: canvasW, height: canvasH };
}

async function renderStatLabel(name: string): Promise<{ image: Buffer; width: number; height: number }> {
  const escaped = escapeXml(name.toUpperCase());
  const buf = await sharp({
    text: {
      text: `<span foreground="white">${escaped}</span>`,
      font: FONT_NAME,
      dpi: 135,
      rgba: true,
    },
  })
    .png()
    .toBuffer();
  const meta = await sharp(buf).metadata();
  return { image: buf, width: meta.width!, height: meta.height! };
}

async function renderPipe(): Promise<{ image: Buffer; width: number; height: number }> {
  const buf = await sharp({
    text: {
      text: `<span foreground="#00a0aa">|</span>`,
      font: FONT_NAME,
      dpi: 135,
      rgba: true,
    },
  })
    .png()
    .toBuffer();
  const meta = await sharp(buf).metadata();
  return { image: buf, width: meta.width!, height: meta.height! };
}

async function buildStatBar(
  stat1Name: string,
  stat1Level: number,
  stat2Name: string,
  stat2Level: number
): Promise<{ image: Buffer; width: number; height: number }> {
  const maxBlocks = 6;
  const labelGap = 10;
  const pipeGap = 18;

  // Render all text labels and glowing blocks in parallel
  const [s1Label, s2Label, pipe, blocks1, blocks2] = await Promise.all([
    renderStatLabel(stat1Name),
    renderStatLabel(stat2Name),
    renderPipe(),
    buildGlowingBlocks(stat1Level, maxBlocks),
    buildGlowingBlocks(stat2Level, maxBlocks),
  ]);

  // Calculate total width
  const totalW =
    s1Label.width + labelGap + blocks1.width +
    pipeGap + pipe.width + pipeGap +
    s2Label.width + labelGap + blocks2.width;

  // Use the tallest element as row height
  const rowH = Math.max(s1Label.height, s2Label.height, blocks1.height, pipe.height);
  const canvasW = totalW + 20;
  const canvasH = rowH + 10;

  // Position each element, vertically centered
  const layers: { input: Buffer; left: number; top: number }[] = [];
  let x = 10;

  // Stat 1 label
  layers.push({ input: s1Label.image, left: x, top: Math.round((canvasH - s1Label.height) / 2) });
  x += s1Label.width + labelGap;

  // Stat 1 blocks (glowing)
  layers.push({ input: blocks1.image, left: x, top: Math.round((canvasH - blocks1.height) / 2) });
  x += blocks1.width + pipeGap;

  // Pipe
  layers.push({ input: pipe.image, left: x, top: Math.round((canvasH - pipe.height) / 2) });
  x += pipe.width + pipeGap;

  // Stat 2 label
  layers.push({ input: s2Label.image, left: x, top: Math.round((canvasH - s2Label.height) / 2) });
  x += s2Label.width + labelGap;

  // Stat 2 blocks (glowing)
  layers.push({ input: blocks2.image, left: x, top: Math.round((canvasH - blocks2.height) / 2) });

  const composited = await sharp({
    create: {
      width: canvasW,
      height: canvasH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(layers.map((l) => ({ ...l, blend: "over" as const })))
    .png()
    .toBuffer();

  return { image: composited, width: canvasW, height: canvasH };
}

export async function compositeCard(
  rawImageBuffer: Buffer,
  title: string,
  stat1Name: string,
  stat1Level: number,
  stat2Name: string,
  stat2Level: number
): Promise<Buffer> {
  // Generate layers in parallel
  const [resizedImage, border, titleResult, divider, statResult] = await Promise.all([
    sharp(rawImageBuffer)
      .resize(CARD_W, IMAGE_H, { fit: "cover" })
      .png()
      .toBuffer(),
    createNeonBorder(CARD_W, CARD_H, CYAN),
    renderTitle(title),
    createGlowingDivider(CARD_W),
    buildStatBar(stat1Name, stat1Level, stat2Name, stat2Level),
  ]);

  const statW = statResult.width;
  const statH = statResult.height;

  // Layout calculations for the bottom panel
  // Panel starts at IMAGE_H (1024), ends at CARD_H (1434) — 410px total
  const dividerY = IMAGE_H - Math.round(divider.height / 2); // straddles the image/panel boundary
  const panelContentStart = IMAGE_H + 10; // tight spacing for compact panel
  const panelContentEnd = CARD_H - BORDER_INSET - 10;
  const panelContentH = panelContentEnd - panelContentStart;

  // Center title + stats vertically in the panel
  const totalContentH = titleResult.height + 6 + statH;
  const contentStartY = panelContentStart + Math.round((panelContentH - totalContentH) / 2);

  const titleY = Math.max(panelContentStart, contentStartY);
  const titleX = Math.max(0, Math.round((CARD_W - titleResult.width) / 2));

  const statY = titleY + titleResult.height + 6;
  const statX = Math.max(0, Math.round((CARD_W - statW) / 2));

  // Create the full card on a dark navy background
  const assembled = await sharp({
    create: {
      width: CARD_W,
      height: CARD_H,
      channels: 4,
      background: { r: 10, g: 10, b: 26, alpha: 255 }, // navy #0a0a1a
    },
  })
    .composite([
      // Character image at the top
      { input: resizedImage, left: 0, top: 0, blend: "over" },
      // Glowing divider line at the boundary
      { input: divider.image, left: 0, top: dividerY, blend: "over" },
      // Title with glow in the panel
      { input: titleResult.image, left: titleX, top: titleY, blend: "over" },
      // Stat bar in the panel
      { input: statResult.image, left: statX, top: statY, blend: "over" },
      // Neon border on top of everything
      { input: border, left: 0, top: 0, blend: "over" },
    ])
    .png()
    .toBuffer();

  // Force-crop to exact dimensions
  return sharp(assembled)
    .extract({ left: 0, top: 0, width: CARD_W, height: CARD_H })
    .png()
    .toBuffer();
}
