const CORS_PROXY = "https://api.codetabs.com/v1/proxy?quest=";
const BASE_URL = "https://www.db.yugioh-card.com/yugiohdb/";
const IMAGE_REGEX =
  /get_image\.action\?type=1&lang=ja&cid=(\d+)&ciid=(\d+)&enc=([^"&']+)/g;

/** Neuron デッキURLかどうかを判定 */
export function isNeuronDeckUrl(url: string): boolean {
  return /yugioh-card\.com\/yugiohdb\/member_deck\.action/.test(url);
}

/** Neuron画像URLからcidを抽出 */
export function extractCid(imageUrl: string): string | null {
  const match = imageUrl.match(/[?&]cid=(\d+)/);
  return match ? match[1] : null;
}

/** Neuron デッキURLからカード画像URLを取得 */
export async function fetchNeuronCardUrls(
  neuronDeckUrl: string,
): Promise<string[]> {
  const proxyUrl = CORS_PROXY + encodeURIComponent(neuronDeckUrl);
  const res = await fetch(proxyUrl);
  if (!res.ok) throw new Error(`デッキページの取得に失敗しました: ${res.status}`);
  const html = await res.text();

  // cid で重複排除しつつ画像URLを抽出
  const seen = new Set<string>();
  const urls: string[] = [];

  for (const match of html.matchAll(IMAGE_REGEX)) {
    const cid = match[1];
    if (seen.has(cid)) continue;
    seen.add(cid);
    const ciid = match[2];
    const enc = match[3];
    urls.push(
      `${BASE_URL}get_image.action?type=1&lang=ja&cid=${cid}&ciid=${ciid}&enc=${enc}&osplang=1`,
    );
  }

  if (urls.length === 0) {
    throw new Error(
      "カード画像が見つかりませんでした。URLが正しいか確認してください。",
    );
  }

  return urls;
}
