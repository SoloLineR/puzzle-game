import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { PuzzlePiece } from "../../components/PuzzlePiece"; // Импортируем компонент части
import { StorageManager } from "../../store/StorageManager";
import { ImageUploader } from "../ImageUploader/ImageUploader";
const FIXED_ROWS = 3;
const FIXED_COLS = 3;
const containerStyles: React.CSSProperties = {
  marginTop: "20px",
  display: "grid",
  gridTemplateColumns: `repeat(${FIXED_COLS}, 1fr)`,
  gap: "1px",
  border: "1px solid #ccc",
  width: "fit-content",
};
export const PuzzleBoard: React.FC = () => {
  const [validFile, setValidFile] = useState<File | null>(null);
  const [puzzlePieces, setPuzzlePieces] = useState<string[]>([]);
  const [boardError, setBoardError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const loadSavedPuzzle = async () => {
      setIsLoading(true);
      setBoardError(null);
      try {
        const savedState = await StorageManager.loadPuzzleState();
        if (savedState) {
          setPuzzlePieces(savedState.pieces);
          console.log("Загружено состояние пазла из хранилища.");
        } else {
          console.log("Нет сохраненного пазла для загрузки.");
        }
      } catch (err) {
        console.error("Ошибка при загрузке сохраненного пазла:", err);
        setBoardError("Ошибка при загрузке сохраненного пазла.");
        setPuzzlePieces([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedPuzzle();
  }, []);

  useEffect(() => {
    let reader: FileReader | null = null;

    // Условие для запуска разделения: есть только валидный файл
    if (!validFile) {
      // Если нет валидного файла, убеждаемся, что индикаторы выключены
      // (если они не связаны с загрузкой сохраненного)
      if (puzzlePieces.length === 0 && !isLoading) {
        // setIsLoading(false); // Handled by loadSavedPuzzle or handleValidatedFile
      }
      return;
    }
    setIsLoading(true);
    setBoardError(null);
    setPuzzlePieces([]);
    reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = async () => {
        try {
          // --- Логика ресайза и разделения (теперь использует фиксированные размеры) ---
          const MAX_DISPLAY_SIZE = 400; // пикселей (максимум для ширины или высоты)
          const aspectRatio = img.width / img.height;
          let displayWidth, displayHeight;

          if (img.width > img.height) {
            displayWidth = MAX_DISPLAY_SIZE;
            displayHeight = MAX_DISPLAY_SIZE / aspectRatio;
          } else {
            displayHeight = MAX_DISPLAY_SIZE;
            displayWidth = MAX_DISPLAY_SIZE * aspectRatio;
          }

          const resizeCanvas = document.createElement("canvas");
          resizeCanvas.width = displayWidth;
          resizeCanvas.height = displayHeight;
          const resizeCtx = resizeCanvas.getContext("2d");
          if (!resizeCtx)
            throw new Error(
              "Не удалось получить 2D контекст canvas для ресайза."
            );
          resizeCtx.drawImage(img, 0, 0, displayWidth, displayHeight);

          // Используем ФИКСИРОВАННЫЕ размеры для вычисления частей
          const pieceWidth = displayWidth / FIXED_COLS;
          const pieceHeight = displayHeight / FIXED_ROWS;
          const piecesDataUrls: string[] = [];

          for (let i = 0; i < FIXED_ROWS; i++) {
            // Цикл по ФИКСИРОВАННЫМ рядам
            for (let j = 0; j < FIXED_COLS; j++) {
              // Цикл по ФИКСИРОВАННЫМ столбцам
              const pieceCanvas = document.createElement("canvas");
              pieceCanvas.width = pieceWidth;
              pieceCanvas.height = pieceHeight;
              const pieceCtx = pieceCanvas.getContext("2d");
              if (!pieceCtx)
                throw new Error(
                  `Не удалось получить 2D контекст canvas для части ${
                    i * FIXED_COLS + j
                  }.`
                );
              pieceCtx.drawImage(
                resizeCanvas,
                j * pieceWidth,
                i * pieceHeight,
                pieceWidth,
                pieceHeight,
                0,
                0,
                pieceWidth,
                pieceHeight
              );
              piecesDataUrls.push(pieceCanvas.toDataURL("image/png"));
            }
          }

          setPuzzlePieces(piecesDataUrls);
          setIsLoading(false);

          try {
            await StorageManager.savePuzzleState({
              pieces: piecesDataUrls,
              rows: FIXED_ROWS,
              cols: FIXED_COLS,
            }); // Сохраняем фиксированные размеры
          } catch (saveError) {
            console.error(
              "Ошибка при сохранении пазла после обработки:",
              saveError
            );
            setBoardError("Пазл обработан, но не удалось сохранить.");
            toast.error("Пазл обработан, но не удалось сохранить.");
          }
        } catch (processErr: any) {
          console.error("Ошибка при обработке изображения:", processErr);
          setBoardError(
            `Ошибка при обработке изображения: ${
              processErr.message || "Неизвестная ошибка"
            }`
          );
          setPuzzlePieces([]);
          setIsLoading(false);
        }
      };

      img.onerror = () => {
        setBoardError("Не удалось загрузить изображение для обработки.");
        setIsLoading(false);
      };

      // Запускаем загрузку изображения в объект Image
      if (e.target && typeof e.target.result === "string") {
        img.src = e.target.result;
      } else {
        setBoardError("Не удалось прочитать файл как Data URL изображения.");
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      setBoardError("Ошибка при чтении файла.");
      setIsLoading(false);
    };

    reader.readAsDataURL(validFile);

    return () => {
      if (reader && reader.readyState === 1) {
        reader.abort();
      }
    };
  }, [validFile]); // Зависимость только от validFile. Изменение размеров сетки НЕ запускает пересчет.

  const handleValidatedFile = (file: File) => {
    // Сбрасываем предыдущие состояния, связанные с файлом/пазлом
    // previewUrl не здесь, очистка не нужна
    setPuzzlePieces([]);
    setBoardError(null); // Сбрасываем общие ошибки PuzzleBoard
    setIsLoading(false); // Сбрасываем индикатор загрузки

    setValidFile(file); // Устанавливаем валидный файл. Это запустит useEffect для разделения.
  };

  const handleFileReset = () => {
    setValidFile(null); // Сбрасываем файл
    setPuzzlePieces([]); // Сбрасываем пазлы
    setBoardError(null); // Сбрасываем общие ошибки
    setIsLoading(false);
    console.log("Файл сброшен или не прошел валидацию в ImageUploader.");
  };
  const handleClearSaved = async () => {
    setIsLoading(true);
    setBoardError(null);
    try {
      await StorageManager.clearPuzzleState();
      setPuzzlePieces([]);
      setValidFile(null);
    } catch (err) {
      console.error("Ошибка при удалении сохраненного пазла:", err);
      setBoardError("Не удалось удалить сохраненный пазл.");
      toast.error("Не удалось удалить сохраненный пазл.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="flex flex-col items-center">
      <h1>Разделение изображения на пазлы</h1>

      <div
        style={{ marginBottom: "20px" }}
        className="flex flex-col items-center"
      >
        <ImageUploader
          onFileValidated={handleValidatedFile}
          onFileReset={handleFileReset}
          className="max-w-[400px]"
        />

        <div style={{ marginTop: "10px" }}>
          {(puzzlePieces.length > 0 ||
            localStorage.getItem("puzzleState") !== null) && (
            <button
              onClick={handleClearSaved}
              className="ml-4 px-3 py-1 border rounded"
            >
              Очистить сохраненный (3x3)
            </button>
          )}
        </div>
      </div>

      {isLoading && <p style={{ color: "blue" }}>Загрузка и обработка...</p>}

      {boardError && !isLoading && (
        <p style={{ color: "red", marginTop: "10px" }}>{boardError}</p>
      )}

      {puzzlePieces.length > 0 && !boardError && (
        <div style={containerStyles}>
          {puzzlePieces.map((dataUrl, index) => (
            <PuzzlePiece key={index} imgUrl={dataUrl} index={index} />
          ))}
        </div>
      )}
    </div>
  );
};
