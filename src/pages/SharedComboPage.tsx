import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { decodeShareData, shareDataToCombo } from "@/utils/share";
import { fetchNeuronCardUrls, extractCid } from "@/utils/neuron";
import { useCombo } from "@/hooks/useCombo";
import { useImageCache } from "@/hooks/useImageCache";

export function SharedComboPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const encoded = searchParams.get("d");
  const { addCombo } = useCombo();
  const { addImageFromUrl } = useImageCache();
  const [error, setError] = useState<string | null>(null);
  const importedRef = useRef(false);

  useEffect(() => {
    if (!encoded || importedRef.current) return;
    importedRef.current = true;

    (async () => {
      try {
        const data = decodeShareData(encoded);

        // 画像を解決して IndexedDB に保存
        const imageIds: string[] = [];

        if (data.n) {
          // Neuron URL あり → imgs は cid の配列
          // Neuron からデッキ全カード画像を取得
          const neuronUrls = await fetchNeuronCardUrls(data.n);
          const cidToId = new Map<string, string>();

          // 全カード画像を保存し、cid→UUID マップを構築
          for (const url of neuronUrls) {
            const cached = await addImageFromUrl(url);
            const cid = extractCid(url);
            if (cid) cidToId.set(cid, cached.id);
          }

          // imgs の cid を UUID に解決
          for (const cid of data.imgs) {
            const imgId = cidToId.get(cid);
            if (!imgId)
              throw new Error(
                `カードID ${cid} がNeuronデッキに見つかりません`,
              );
            imageIds.push(imgId);
          }
        } else {
          // Neuron URL なし → imgs は完全な画像URL
          for (const url of data.imgs) {
            const cached = await addImageFromUrl(url);
            imageIds.push(cached.id);
          }
        }

        // ShareData → Combo (実際の画像IDで構築)
        const { combo } = shareDataToCombo(data, imageIds);

        // neuronUrl を復元
        if (data.n) {
          combo.neuronUrl = data.n;
        }

        // IndexedDB に保存
        await addCombo(combo);

        // 詳細画面にリダイレクト
        navigate(`/combo/${combo.id}`, { replace: true });
      } catch (e) {
        setError(e instanceof Error ? e.message : "読み込みに失敗しました");
      }
    })();
  }, [encoded, addCombo, addImageFromUrl, navigate]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="text-center">
          <p className="text-gray-500">共有データの読み込みに失敗しました</p>
          <p className="mt-2 text-xs text-gray-600">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 rounded-md bg-gray-700 px-4 py-2 text-sm text-gray-300 hover:bg-gray-600"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <p className="text-gray-400">展開を読み込み中...</p>
    </div>
  );
}
