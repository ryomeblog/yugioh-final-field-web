import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { decodeShareData, shareDataToCombo } from "@/utils/share";
import { useCombo } from "@/hooks/useCombo";
import { useImageCache } from "@/hooks/useImageCache";

export function SharedComboPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const encoded = searchParams.get("d");
  const { addCombo } = useCombo();
  const { addImageFromUrl } = useImageCache();
  const [error, setError] = useState(false);
  const importedRef = useRef(false);

  useEffect(() => {
    if (!encoded || importedRef.current) return;
    importedRef.current = true;

    (async () => {
      try {
        const data = decodeShareData(encoded);

        // 各画像を IndexedDB に保存し、生成された UUID を取得
        const imageIds: string[] = [];
        for (const url of data.imgs) {
          const cached = await addImageFromUrl(url);
          imageIds.push(cached.id);
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
      } catch {
        setError(true);
      }
    })();
  }, [encoded, addCombo, addImageFromUrl, navigate]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="text-center">
          <p className="text-gray-500">共有データの読み込みに失敗しました</p>
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
