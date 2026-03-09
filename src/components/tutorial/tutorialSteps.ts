export interface TutorialStep {
  /** 画像パス (publictutorial/ 配下) */
  image: string;
  /** 解説テキスト */
  text: string;
}

export type TutorialPageKey = "home" | "comboEdit" | "comboDetail";

export const TUTORIAL_STEPS: Record<TutorialPageKey, TutorialStep[]> = {
  home: [
    {
      image: "tutorial/home-1.png",
      text: "展開の一覧がここに表示されます。カードをタップすると詳細を見られます。",
    },
    {
      image: "tutorial/home-2.png",
      text: "ヘッダーのボタンからインポート・ダウンロード・新規作成・設定ができます。",
    },
    {
      image: "tutorial/home-2.png",
      text: "インポートボタン（↑）でZIPファイルから展開データを取り込めます。",
    },
    {
      image: "tutorial/home-2.png",
      text: "ダウンロードボタン（↓）で展開をZIPファイルとしてダウンロードできます。",
    },
    {
      image: "tutorial/home-2.png",
      text: "「+」ボタンで新しい展開を作成できます。",
    },
    {
      image: "tutorial/home-2.png",
      text: "歯車ボタンの設定画面でチュートリアルの再表示ができます。",
    },
  ],
  comboEdit: [
    {
      image: "tutorial/edit-1.png",
      text: "こちらの画面では、展開を作成・編集できます。まず、展開のタイトルを入力します。",
    },
    {
      image: "tutorial/edit-1.png",
      text: "初動札エリアには画面下部の画像一覧からドラッグ&ドロップで初動札を配置できます。タップで削除できます。",
    },
    {
      image: "tutorial/edit-2.png",
      text: "「+」ボタンでステップを追加します。各ステップにテキストと盤面を設定できます。",
    },
    {
      image: "tutorial/edit-3.png",
      text: "ステップの盤面にカードを配置できます。画像一覧からドラッグ&ドロップで配置してください。",
    },
    {
      image: "tutorial/edit-4.png",
      text: "盤面上のカードをタップするとメニューが表示されます。チェーン番号の追加・編集、攻撃/守備表示の切り替え、削除ができます。",
    },
    {
      image: "tutorial/edit-5.png",
      text: "左端のハンドル（≡）をドラッグしてステップの順番を並び替えられます。",
    },
    {
      image: "tutorial/edit-6.png",
      text: "画像一覧です。画像を盤面や初動札にドラッグ&ドロップして配置します。スマホでは長押しでドラッグ開始です。削除エリアにドロップすると画像を削除できます。",
    },
    {
      image: "tutorial/edit-7.png",
      text: "ヘッダーのボタンから、インポート（↑）・ダウンロード（↓）・保存（💾）・削除（🗑）ができます。",
    },
  ],
  comboDetail: [
    {
      image: "tutorial/detail-1.png",
      text: "こちらの画面では、展開の詳細を表示します。初動札は展開で使用するカードを示します。",
    },
    {
      image: "tutorial/detail-2.png",
      text: "展開のステップについては作成時の順番に表示されます。各ステップにはテキストと盤面があります。チェーン番号や攻撃/守備表示も反映されます。",
    },
    {
      image: "tutorial/detail-3.png",
      text: "ヘッダーのボタンから、ダウンロード（↓）・編集（✏️）・削除（🗑）ができます。削除時は確認ダイアログが表示されます。",
    },
  ],
};
