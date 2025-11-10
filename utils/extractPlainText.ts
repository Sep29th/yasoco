export function extractPlainTextFromEditorJson(content: any): string {
  if (!content) return "";
  if (typeof content === "string") return content;

  const blocks = content.blocks || [];
  const texts: string[] = [];

  for (const block of blocks) {
    if (!block) continue;
    const type = block.type;
    const data = block.data || {};

    if (type === "paragraph" || type === "header" || type === "quote") {
      texts.push(data.text || "");
    } else if (type === "list") {
      if (Array.isArray(data.items)) texts.push(data.items.join(" "));
    } else if (type === "image") {
      texts.push(data.caption || "");
    } else {
      // fallback: stringify
      texts.push(JSON.stringify(data));
    }
  }

  return texts.join(" ");
}
