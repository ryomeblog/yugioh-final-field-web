import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import {
  FiArrowLeft,
  FiUpload,
  FiDownload,
  FiSave,
  FiTrash2,
  FiPlus,
} from "react-icons/fi";
import { Header } from "@/components/layout/Header";
import { StartingCards } from "@/components/combo/StartingCards";
import { StepCard } from "@/components/combo/StepCard";
import { ImageGallery } from "@/components/combo/ImageGallery";
import { ImportModal } from "@/components/common/ImportModal";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { TutorialOverlay } from "@/components/tutorial/TutorialOverlay";
import { useCombo } from "@/hooks/useCombo";
import { useImageCache } from "@/hooks/useImageCache";
import { useZip } from "@/hooks/useZip";
import { useTutorial } from "@/hooks/useTutorial";
import type { Combo, ComboStep, BoardState, StartingCard } from "@/types";
import { createEmptyBoard, CARD_RATIO } from "@/types";
import { useIsMobile } from "@/hooks/useIsMobile";
import { fetchNeuronCardUrls, extractCid } from "@/utils/neuron";

export function ComboEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id;
  const { state, addCombo, updateCombo, deleteCombo } = useCombo();
  const {
    images,
    getImageUrl,
    addImage,
    addImageFromUrl,
    saveImage,
    removeImage,
  } = useImageCache();
  const { exportCombos, importZip } = useZip();
  const isMobile = useIsMobile();
  const tutorial = useTutorial("comboEdit");

  const overlayW = isMobile ? 48 : 70;
  const overlayH = Math.round(overlayW * CARD_RATIO);

  // 編集時: 既存データから初期値を取得
  const existingCombo = !isNew
    ? state.combos.find((c) => c.id === id)
    : undefined;

  const [title, setTitle] = useState(() => existingCombo?.title ?? "");
  const [neuronUrl, setNeuronUrl] = useState(
    () => existingCombo?.neuronUrl ?? "",
  );
  const [neuronLoading, setNeuronLoading] = useState(false);
  const [neuronError, setNeuronError] = useState<string | null>(null);
  const [startingCards, setStartingCards] = useState<StartingCard[]>(() =>
    existingCombo ? [...existingCombo.startingCards] : [],
  );
  const [steps, setSteps] = useState<ComboStep[]>(() =>
    existingCombo
      ? [...existingCombo.steps].sort((a, b) => a.order - b.order)
      : [],
  );
  const [isDirty, setIsDirty] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeDragImageId, setActiveDragImageId] = useState<string | null>(
    null,
  );
  const [galleryOpen, setGalleryOpen] = useState(true);

  // この展開に属する画像IDを管理 (展開間で画像を分離)
  const [comboImageIds, setComboImageIds] = useState<Set<string>>(() => {
    if (!existingCombo) return new Set();
    const ids = new Set<string>();
    for (const sc of existingCombo.startingCards) ids.add(sc.imageId);
    for (const step of existingCombo.steps) {
      for (const row of step.board.cells) {
        for (const cell of row) {
          if (cell?.imageId) ids.add(cell.imageId);
        }
      }
    }
    return ids;
  });

  const addComboImageId = useCallback((id: string) => {
    setComboImageIds((prev) => new Set(prev).add(id));
  }, []);

  const removeComboImageId = useCallback((id: string) => {
    setComboImageIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  // ギャラリーに表示する画像をこの展開のものだけにフィルタ
  const comboImages = useMemo(
    () => images.filter((img) => comboImageIds.has(img.id)),
    [images, comboImageIds],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
  );

  const markDirty = useCallback(() => setIsDirty(true), []);

  function handleBack() {
    if (isDirty) {
      setShowConfirm(true);
    } else {
      navigateBack();
    }
  }

  function navigateBack() {
    if (isNew) {
      navigate("/");
    } else {
      navigate(`/combo/${id}`);
    }
  }

  /** 現在の展開画像から既存cidのSetを構築 */
  function getExistingCids(): Set<string> {
    const cids = new Set<string>();
    for (const img of images) {
      if (comboImageIds.has(img.id) && img.externalUrl) {
        const cid = extractCid(img.externalUrl);
        if (cid) cids.add(cid);
      }
    }
    return cids;
  }

  /** Neuron URLから画像を取得し、既存cidと重複しないものだけ追加 */
  async function fetchAndAddNeuronImages(url: string) {
    const neuronUrls = await fetchNeuronCardUrls(url);
    const existingCids = getExistingCids();
    for (const imgUrl of neuronUrls) {
      const cid = extractCid(imgUrl);
      if (cid && existingCids.has(cid)) continue;
      const cached = await addImageFromUrl(imgUrl);
      addComboImageId(cached.id);
    }
  }

  // 編集画面を開いた時に neuronUrl があれば自動で全画像取得
  const neuronAutoFetched = useRef(false);
  useEffect(() => {
    if (neuronAutoFetched.current) return;
    const url = existingCombo?.neuronUrl;
    if (!url) return;
    neuronAutoFetched.current = true;
    setNeuronLoading(true);
    fetchAndAddNeuronImages(url)
      .catch(() => {
        // 自動取得失敗時は既存画像のみで表示
      })
      .finally(() => setNeuronLoading(false));
  });

  async function handleFetchNeuron() {
    if (!neuronUrl.trim()) return;
    setNeuronLoading(true);
    setNeuronError(null);
    try {
      await fetchAndAddNeuronImages(neuronUrl.trim());
      markDirty();
    } catch (e) {
      setNeuronError(e instanceof Error ? e.message : "取得に失敗しました");
    } finally {
      setNeuronLoading(false);
    }
  }

  async function handleSave() {
    const now = new Date().toISOString();
    const combo: Combo = {
      id: id || uuidv4(),
      title,
      ...(neuronUrl.trim() ? { neuronUrl: neuronUrl.trim() } : {}),
      startingCards,
      steps: steps.map((s, i) => ({ ...s, order: i })),
      createdAt: isNew
        ? now
        : (state.combos.find((c) => c.id === id)?.createdAt ?? now),
      updatedAt: now,
    };

    if (isNew) {
      await addCombo(combo);
    } else {
      await updateCombo(combo);
    }
    setIsDirty(false);
    navigate(`/combo/${combo.id}`);
  }

  async function handleDelete() {
    if (id) {
      await deleteCombo(id);
      navigate("/");
    }
  }

  function addStep() {
    const newStep: ComboStep = {
      id: uuidv4(),
      order: steps.length,
      text: "",
      board: createEmptyBoard(),
    };
    setSteps((prev) => [...prev, newStep]);
    markDirty();
  }

  function deleteStep(stepId: string) {
    setSteps((prev) => prev.filter((s) => s.id !== stepId));
    markDirty();
  }

  function updateStepText(stepId: string, text: string) {
    setSteps((prev) => prev.map((s) => (s.id === stepId ? { ...s, text } : s)));
    markDirty();
  }

  function updateStepBoard(stepId: string, board: BoardState) {
    setSteps((prev) =>
      prev.map((s) => (s.id === stepId ? { ...s, board } : s)),
    );
    markDirty();
  }

  function removeStartingCard(cardId: string) {
    setStartingCards((prev) => prev.filter((sc) => sc.id !== cardId));
    markDirty();
  }

  function handleDragStart(event: DragStartEvent) {
    const data = event.active.data.current;
    if (data?.type === "gallery-image") {
      setActiveDragImageId(data.imageId as string);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDragImageId(null);
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // ギャラリーから削除ゾーンへのドロップ
    if (
      activeData?.type === "gallery-image" &&
      overData?.type === "gallery-delete"
    ) {
      const imageId = activeData.imageId as string;
      removeComboImageId(imageId);
      removeImage(imageId);
      return;
    }

    // ギャラリーから盤面へのドロップ
    if (
      activeData?.type === "gallery-image" &&
      overData?.type === "board-cell"
    ) {
      const imageId = activeData.imageId as string;
      const { row, col } = overData as { row: number; col: number };
      // droppable ID: "step-{stepId}-{row}-{col}" からステップIDを抽出
      const overId = String(over.id);
      const match = overId.match(/^step-(.+)-\d+-\d+$/);
      if (match) {
        const stepId = match[1];
        const step = steps.find((s) => s.id === stepId);
        if (step && step.board.cells[row][col] !== null) {
          const newCells = step.board.cells.map((r) =>
            r.map((c) => (c ? { ...c } : null)),
          );
          newCells[row][col] = {
            imageId,
            chainNumber: null,
            position: "attack",
          };
          updateStepBoard(stepId, { cells: newCells });
        }
      }
      return;
    }

    // ギャラリーから初動札へのドロップ
    if (
      activeData?.type === "gallery-image" &&
      overData?.type === "starting-cards"
    ) {
      const imageId = activeData.imageId as string;
      const newCard: StartingCard = {
        id: uuidv4(),
        imageId,
        order: startingCards.length,
      };
      setStartingCards((prev) => [...prev, newCard]);
      markDirty();
      return;
    }

    // ステップカードの並び替え
    if (active.id !== over.id) {
      const oldIndex = steps.findIndex((s) => s.id === active.id);
      const newIndex = steps.findIndex((s) => s.id === over.id);
      if (oldIndex >= 0 && newIndex >= 0) {
        setSteps((prev) => arrayMove(prev, oldIndex, newIndex));
        markDirty();
      }
    }
  }

  async function handleImport(file: File) {
    const { combos, images: importedImages } = await importZip(file);
    for (const img of importedImages) {
      await saveImage(img);
      addComboImageId(img.id);
    }
    if (combos.length > 0) {
      const combo = combos[0];
      setTitle(combo.title);
      setNeuronUrl(combo.neuronUrl ?? "");
      setStartingCards(combo.startingCards);
      setSteps(combo.steps.sort((a, b) => a.order - b.order));
      markDirty();

      // neuronUrl があればデッキ全画像を取得 (既存cidと重複しないもののみ)
      if (combo.neuronUrl) {
        try {
          await fetchAndAddNeuronImages(combo.neuronUrl);
        } catch {
          // Neuron取得失敗時はインポート済み画像のみで継続
        }
      }
    }
  }

  async function handleDownload() {
    const now = new Date().toISOString();
    const combo: Combo = {
      id: id || uuidv4(),
      title,
      ...(neuronUrl.trim() ? { neuronUrl: neuronUrl.trim() } : {}),
      startingCards,
      steps: steps.map((s, i) => ({ ...s, order: i })),
      createdAt: now,
      updatedAt: now,
    };
    const safeName = (title || "combo").replace(/[/\\?%*:|"<>]/g, "_");
    await exportCombos([combo], `${safeName}.zip`);
  }

  async function handleAddImages(files: FileList) {
    for (const file of Array.from(files)) {
      const cached = await addImage(file);
      addComboImageId(cached.id);
    }
  }

  const dragImageUrl = activeDragImageId
    ? getImageUrl(activeDragImageId)
    : null;

  return (
    <div className="flex min-h-screen flex-col bg-gray-900">
      <Header
        title={isNew ? "展開作成" : "展開編集"}
        leftAction={
          <button
            onClick={handleBack}
            className="text-gray-300 hover:text-white"
          >
            <FiArrowLeft size={20} />
          </button>
        }
        actions={
          <>
            <button
              onClick={() => setShowImport(true)}
              className="rounded-md bg-blue-900 p-2 text-gray-200 hover:bg-blue-800"
            >
              <FiUpload size={14} />
            </button>
            <button
              onClick={handleDownload}
              className="rounded-md bg-blue-900 p-2 text-gray-200 hover:bg-blue-800"
            >
              <FiDownload size={14} />
            </button>
            <button
              onClick={handleSave}
              className="rounded-md bg-green-700 px-3 py-2 text-sm text-white hover:bg-green-600"
            >
              <FiSave size={14} />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isNew}
              className="rounded-md bg-red-700 p-2 text-red-200 hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FiTrash2 size={14} />
            </button>
          </>
        }
      />

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-1 flex-col overflow-hidden">
          <div
            className={`flex-1 space-y-4 overflow-y-auto p-3 sm:p-4 ${galleryOpen ? "pb-64 sm:pb-80" : "pb-20"}`}
          >
            {/* Title */}
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                markDirty();
              }}
              placeholder="展開タイトルを入力..."
              className="w-full rounded-md border border-gray-600 bg-gray-800 px-4 py-2 text-white placeholder-gray-500 outline-none focus:border-red-500"
            />

            {/* Neuron URL */}
            <div className="space-y-1">
              <label className="text-xs text-gray-400">NEURON URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={neuronUrl}
                  onChange={(e) => {
                    setNeuronUrl(e.target.value);
                    markDirty();
                  }}
                  placeholder="https://www.db.yugioh-card.com/yugiohdb/member_deck.action?..."
                  className="min-w-0 flex-1 rounded-md border border-gray-600 bg-gray-800 px-3 py-1.5 text-sm text-white placeholder-gray-500 outline-none focus:border-red-500"
                />
                <button
                  onClick={handleFetchNeuron}
                  disabled={neuronLoading || !neuronUrl.trim()}
                  className="shrink-0 rounded-md bg-blue-700 px-3 py-1.5 text-sm text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {neuronLoading ? "取得中..." : "取得"}
                </button>
              </div>
              {neuronError && (
                <p className="text-xs text-red-400">{neuronError}</p>
              )}
            </div>

            {/* Starting Cards */}
            <StartingCards
              cards={startingCards}
              editable
              onRemove={removeStartingCard}
              getImageUrl={getImageUrl}
            />

            {/* Steps */}
            <SortableContext
              items={steps.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {steps.map((step, i) => (
                  <StepCard
                    key={step.id}
                    step={step}
                    index={i}
                    onTextChange={(text) => updateStepText(step.id, text)}
                    onBoardChange={(board) => updateStepBoard(step.id, board)}
                    onDelete={() => deleteStep(step.id)}
                    getImageUrl={getImageUrl}
                  />
                ))}
              </div>
            </SortableContext>

            {/* Add Step */}
            <button
              onClick={addStep}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-600 py-4 text-gray-500 hover:border-gray-400 hover:text-gray-300"
            >
              <FiPlus size={18} />
            </button>
          </div>
        </div>

        {/* Fixed Image Gallery — space-y-4 の外に配置 */}
        <div className="fixed bottom-0 left-0 right-0 z-10">
          <ImageGallery
            images={comboImages}
            getImageUrl={getImageUrl}
            onAddImages={handleAddImages}
            onAddImageFromUrl={async (url) => {
              const cached = await addImageFromUrl(url);
              addComboImageId(cached.id);
            }}
            onClearImages={() => {
              for (const img of comboImages) {
                removeImage(img.id);
              }
              setComboImageIds(new Set());
            }}
            isOpen={galleryOpen}
            onToggle={() => setGalleryOpen((v) => !v)}
          />
        </div>

        {/* Drag Overlay - カードがマウスに追従 */}
        <DragOverlay dropAnimation={null}>
          {dragImageUrl && (
            <div
              className="rounded border border-gray-400 shadow-lg shadow-black/50"
              style={{
                width: overlayW,
                height: overlayH,
                cursor: "grabbing",
              }}
            >
              <img
                src={dragImageUrl}
                alt=""
                className="h-full w-full rounded object-cover opacity-90"
                draggable={false}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <ImportModal
        isOpen={showImport}
        onClose={() => setShowImport(false)}
        onImport={handleImport}
      />
      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => {
          setShowConfirm(false);
          navigateBack();
        }}
        title="編集内容が保存されていません"
        message="保存せずに戻りますか？"
        confirmLabel="保存せず戻る"
      />
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          setShowDeleteConfirm(false);
          handleDelete();
        }}
        title="展開を削除"
        message="この展開を削除しますか？この操作は取り消せません。"
        confirmLabel="削除する"
      />

      {tutorial.isActive && tutorial.currentStep && (
        <TutorialOverlay
          step={tutorial.currentStep}
          currentIndex={tutorial.currentStepIndex}
          totalSteps={tutorial.totalSteps}
          onNext={tutorial.next}
          onBack={tutorial.back}
          onSkip={tutorial.skip}
        />
      )}
    </div>
  );
}
