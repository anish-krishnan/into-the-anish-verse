export function buildPrompt(title: string, description: string): string {
  return `A fun, expressive cartoon illustration of an Indian-American man in his mid-20s as the "${title}" character. ${description}.

Style: colorful cartoon/comic book illustration, expressive face and pose, cel-shaded with bold outlines, slightly exaggerated proportions for comedic effect. Close-up framing showing head and upper body. Character should be the main focus taking up most of the frame.

Background: simple dark navy blue gradient, subtle. Do not make the background elaborate or distracting.

CRITICAL: Do not include ANY text, words, letters, numbers, labels, titles, names, or stat bars anywhere in the image. The image must be purely visual with zero text or typography of any kind. Do not include any borders, frames, or UI elements around the image. Do not include multiple people. Do not make it photorealistic or hyperrealistic. Do not show full body — crop at chest/waist level.`;
}
