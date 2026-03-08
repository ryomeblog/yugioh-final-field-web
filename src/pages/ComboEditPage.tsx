import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
  PointerSensor,
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
import { useCombo } from "@/hooks/useCombo";
import { useImageCache } from "@/hooks/useImageCache";
import { useZip } from "@/hooks/useZip";
import type { Combo, ComboStep, BoardState, StartingCard } from "@/types";
import { createEmptyBoard, CARD_RATIO } from "@/types";

const OVERLAY_W = 70;
const OVERLAY_H = Math.round(OVERLAY_W * CARD_RATIO);

export function ComboEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id;
  const { state, addCombo, updateCombo, deleteCombo } = useCombo();
  const { images, getImageUrl, addImage, addImageFromBlob } = useImageCache();
  const { exportCombos, importZip } = useZip();

  // 編集時: 既存データから初期値を取得
  const existingCombo = !isNew
    ? state.combos.find((c) => c.id === id)
    : undefined;

  const [title, setTitle] = useState(() => existingCombo?.title ?? "");
  const [startingCards, setStartingCards] = useState<StartingCard[]>(() =>
    existingCombo ? [...existingCombo.startingCards] : [],
  );
  const [steps, setSteps] = useState<ComboStep[]>(() =>
    existingCombo
      ? [...existingCombo.steps].sort((a, b) => a.order - b.order)
      : [],
  );
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeDragImageId, setActiveDragImageId] = useState<string | null>(
    null,
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
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

  async function handleSave() {
    const now = new Date().toISOString();
    const combo: Combo = {
      id: id || uuidv4(),
      title,
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
    navigate("/");
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
    setSelectedStepId(newStep.id);
    markDirty();
  }

  function deleteStep(stepId: string) {
    setSteps((prev) => prev.filter((s) => s.id !== stepId));
    if (selectedStepId === stepId) setSelectedStepId(null);
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

    // ギャラリーから盤面へのドロップ
    if (
      activeData?.type === "gallery-image" &&
      overData?.type === "board-cell"
    ) {
      const imageId = activeData.imageId as string;
      const { row, col } = overData as { row: number; col: number };
      // 選択中のステップの盤面にのみドロップ
      if (selectedStepId) {
        const step = steps.find((s) => s.id === selectedStepId);
        if (step && step.board.cells[row][col] !== null) {
          const newCells = step.board.cells.map((r) =>
            r.map((c) => (c ? { ...c } : null)),
          );
          newCells[row][col] = {
            imageId,
            chainNumber: null,
            position: "attack",
          };
          updateStepBoard(selectedStepId, { cells: newCells });
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
      await addImageFromBlob(img.id, img.fileName, img.blob);
    }
    if (combos.length > 0) {
      const combo = combos[0];
      setTitle(combo.title);
      setStartingCards(combo.startingCards);
      setSteps(combo.steps.sort((a, b) => a.order - b.order));
      markDirty();
    }
  }

  async function handleDownload() {
    const now = new Date().toISOString();
    const combo: Combo = {
      id: id || uuidv4(),
      title,
      startingCards,
      steps: steps.map((s, i) => ({ ...s, order: i })),
      createdAt: now,
      updatedAt: now,
    };
    await exportCombos([combo]);
  }

  async function handleAddImages(files: FileList) {
    for (const file of Array.from(files)) {
      await addImage(file);
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
              className="rounded-md bg-gray-600 p-2 text-gray-400 hover:bg-gray-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FiTrash2 size={14} />
            </button>
          </>
        }
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 space-y-4 overflow-y-auto p-4 pb-72">
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

          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
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
                    isSelected={selectedStepId === step.id}
                    onSelect={() => setSelectedStepId(step.id)}
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

            {/* Fixed Image Gallery */}
            <div className="fixed bottom-0 left-0 right-0 z-10">
              <ImageGallery
                images={images}
                getImageUrl={getImageUrl}
                onAddImages={handleAddImages}
              />
            </div>

            {/* Drag Overlay - カードがマウスに追従 */}
            <DragOverlay dropAnimation={null}>
              {dragImageUrl && (
                <div
                  className="rounded border border-gray-400 shadow-lg shadow-black/50"
                  style={{
                    width: OVERLAY_W,
                    height: OVERLAY_H,
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
        </div>
      </div>

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
    </div>
  );
}
