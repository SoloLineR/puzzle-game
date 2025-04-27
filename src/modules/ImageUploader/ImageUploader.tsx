// src/components/ImageUploader.tsx (С предпросмотром)

import { Input } from "@/components/ui/input"; // Ваш компонент Input
import React, { useState, useEffect } from "react"; // useEffect нужен для очистки предпросмотра
import { toast } from "sonner";
import { allowedTypes, maxSizeBytes } from "./constants"; // Убедитесь, что путь правильный

interface ImageUploaderProps {
  // Callback, который будет вызван при успешной валидации файла
  onFileValidated: (file: File) => void;
  // Callback для сброса файла в родительском компоненте при ошибке или отмене
  onFileReset: () => void;
  // Пропсы для Input
  className?: string;
  accept?: string; // Можно прокидывать accept извне, или использовать дефолтный
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onFileValidated,
  onFileReset,
  className,
  accept = "image/jpeg, image/png, image/svg, image/webp", // Дефолтный accept
}) => {
  // Возвращаем состояние для URL предварительного просмотра
  const [selectedImg, setSelectedImg] = useState<string>();
  const [error, setError] = useState<string | null>(null);
  const [inputKey, setInputKey] = useState(0);

  // Возвращаем эффект для очистки URL предварительного просмотра
  useEffect(() => {
    return () => {
      if (selectedImg) {
        URL.revokeObjectURL(selectedImg); // Освобождаем память
      }
    };
  }, [selectedImg]); // Зависимость от selectedImg

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Очищаем предыдущий предпросмотр и ошибку при выборе нового файла
    if (selectedImg) {
      URL.revokeObjectURL(selectedImg);
    }
    setSelectedImg(undefined); // Сбрасываем предпросмотр
    setError(null); // Сбрасываем предыдущую ошибку валидации

    const file = e.target.files?.[0];

    if (!file) {
      // Если пользователь отменил выбор файла
      onFileReset(); // Уведомляем родителя о сбросе
      setInputKey((prevKey) => prevKey + 1); // Сбрасываем input визуально
      return;
    }

    // --- Валидация файла (тип и размер) ---
    if (!allowedTypes.includes(file.type)) {
      const msg =
        "Недопустимый формат файла. Выберите JPEG, PNG, WEBP или SVG.";
      setError(msg); // Отображение ошибки под input
      toast.error(msg); // Уведомление sonner
      onFileReset(); // Уведомляем родителя о сбросе при ошибке
      setInputKey((prevKey) => prevKey + 1); // Сбрасываем input визуально
      return; // Останавливаем обработку
    }

    if (file.size > maxSizeBytes) {
      const maxSizeMB = maxSizeBytes / (1024 * 1024);
      const msg = `Файл слишком большой. Максимальный размер: ${maxSizeMB} MB.`;
      setError(msg); // Отображение ошибки под input
      toast.error(msg); // Уведомление sonner
      onFileReset(); // Уведомляем родителя о сбросе при ошибке
      setInputKey((prevKey) => prevKey + 1); // Сбрасываем input визуально
      return; // Останавливаем обработку
    }

    // --- Если валидация успешна ---
    setError(null); // Убедимся, что нет ошибки
    onFileValidated(file); // <-- Передаем ВАЛИДНЫЙ ФАЙЛ родителю для обработки пазлов

    // Создаем URL для предварительного просмотра СРАЗУ после успешной валидации
    try {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImg(imageUrl); // <-- Устанавливаем предпросмотр ЗДЕСЬ
    } catch (err) {
      console.error("Error creating object URL for preview:", err);
      // Отображаем ошибку предпросмотра ЗДЕСЬ (она специфична для предпросмотра)
      setError("Не удалось создать предварительный просмотр изображения.");
      // Уведомляем родителя, что, возможно, нужно сбросить логику пазлов
      onFileReset();
      // Сбрасываем input визуально, если предпросмотр не удался
      setInputKey((prevKey) => prevKey + 1);
      toast.error("Не удалось создать предварительный просмотр изображения.");
    }

    // inputKey не сбрасываем здесь, чтобы имя файла оставалось видно при успехе и предпросмотре.
  };

  return (
    <div className="flex flex-col items-center">
      {/* Input для выбора файла с key для визуального сброса */}
      <Input
        key={inputKey} // Ключ для сброса элемента
        type="file"
        accept={accept} // Используем prop accept
        onChange={handleFileChange}
        className={className} // Передаем className из пропсов
      />

      {/* Сообщение об ошибке валидации Input */}
      {error && (
        <p style={{ color: "red", fontSize: "0.875rem", marginTop: "0.5rem" }}>
          {error}
        </p>
      )}

      {/* Возвращаем предварительный просмотр изображения */}
      {selectedImg &&
        !error && ( // Показываем предпросмотр, если есть URL и нет ошибки валидации input
          <img
            src={selectedImg}
            // Размеры предпросмотра можно сделать фиксированными или прокинуть пропом
            width={400}
            height={400}
            alt="Предварительный просмотр изображения"
            className="object-contain max-h-[400px] mt-2"
          />
        )}
    </div>
  );
};
