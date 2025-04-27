import localforage from "localforage";
import { toast } from "sonner";

// Определяем интерфейс данных, которые будем хранить
interface PuzzleState {
  pieces: string[]; // Массив Data URL строк
  rows: number;
  cols: number;
  timestamp: number; // Метка времени сохранения
}

const STORAGE_KEY = "puzzleState"; // Ключ для хранения в IndexedDB

// Настраиваем localforage (опционально, но рекомендуется)
localforage.config({
  driver: [localforage.INDEXEDDB, localforage.WEBSQL, localforage.LOCALSTORAGE], // Порядок предпочтения
  name: "myPuzzleApp", // Имя вашей базы данных
  version: 1.0, // Версия базы данных
  storeName: "puzzles", // Имя хранилища объектов (Object Store)
  description: "Сохранение состояния пазла",
});

export const StorageManager = {
  /**
   * Сохраняет состояние пазла.
   * @param state - Объект состояния пазла (массив Data URL, ряды, столбцы).
   * @returns Promise<void>
   */
  async savePuzzleState(state: Omit<PuzzleState, "timestamp">): Promise<void> {
    try {
      const stateToSave: PuzzleState = {
        ...state,
        timestamp: Date.now(),
      };
      // localforage автоматически сериализует объект
      await localforage.setItem(STORAGE_KEY, stateToSave);
      console.log("Состояние пазла сохранено (IndexedDB).");
      // toast.success('Пазл сохранен!'); // Пример уведомления
    } catch (error) {
      console.error("Ошибка при сохранении состояния пазла:", error);
      // toast.error('Не удалось сохранить пазл.'); // Пример уведомления
      // Можете перебросить ошибку или обработать ее иначе
      throw error;
    }
  },

  /**
   * Загружает состояние пазла.
   * @returns Promise<PuzzleState | null>
   */
  async loadPuzzleState(): Promise<PuzzleState | null> {
    try {
      // localforage автоматически десериализует объект
      const state: PuzzleState | null = await localforage.getItem(STORAGE_KEY);

      if (state === null) {
        console.log("Сохраненное состояние пазла не найдено.");
        return null;
      }

      // Базовая валидация загруженных данных
      if (
        Array.isArray(state.pieces) &&
        state.pieces.every(
          (p) => typeof p === "string" && p.startsWith("data:image/")
        ) &&
        typeof state.rows === "number" &&
        state.rows > 0 &&
        typeof state.cols === "number" &&
        state.cols > 0 &&
        typeof state.timestamp === "number"
      ) {
        console.log("Состояние пазла успешно загружено (IndexedDB).");
        return state;
      } else {
        console.error(
          "Загруженные данные состояния пазла повреждены или некорректны."
        );
        // Можно удалить некорректные данные
        // await localforage.removeItem(STORAGE_KEY);
        return null;
      }
    } catch (error) {
      console.error("Ошибка при загрузке состояния пазла:", error);
      // toast.error('Не удалось загрузить пазл.'); // Пример уведомления
      throw error; // Перебрасываем ошибку для обработки в компоненте
    }
  },

  /**
   * Удаляет сохраненное состояние пазла.
   * @returns Promise<void>
   */
  async clearPuzzleState(): Promise<void> {
    try {
      await localforage.removeItem(STORAGE_KEY);
      console.log("Сохраненное состояние пазла удалено (IndexedDB).");
      toast.info("Сохраненный пазл удален!"); // Пример уведомления
    } catch (error) {
      console.error("Ошибка при удалении состояния пазла:", error);
      toast.error("Не удалось удалить сохраненный пазл."); // Пример уведомления
      throw error;
    }
  },
};

// Примечание: IndexedDB имеет гораздо больший лимит хранения, чем localStorage,
// но все равно не бесконечный. Хранение очень больших изображений (особенно множества)
// в виде Data URL может быть неоптимальным. Рассмотрите хранение Blob или файлов
// напрямую, если размер становится проблемой (требует более сложной логики).
