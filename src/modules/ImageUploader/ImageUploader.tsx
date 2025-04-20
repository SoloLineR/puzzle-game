import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

export const ImageUploader = () => {
  const [selectedImg, setSelectedImg] = useState<string>();
  const [error, setError] = useState<string | null>(null);
  const [inputKey, setInputKey] = useState(0);
  useEffect(() => {
    return () => {
      if (selectedImg) {
        URL.revokeObjectURL(selectedImg); // Освобождаем память
      }
    };
  }, [selectedImg]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedImg) {
      URL.revokeObjectURL(selectedImg);
    }
    setSelectedImg(undefined);
    setError(null);

    const file = e.target.files?.[0];

    if (!file) {
      setInputKey((prevKey) => prevKey + 1);
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/svg"];
    if (!allowedTypes.includes(file.type)) {
      setError("Недопустимый формат файла. Выберите JPEG, PNG, WEBP или SVG.");
      setInputKey((prevKey) => prevKey + 1);
      return;
    }

    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      const maxSizeMB = maxSizeBytes / (1024 * 1024);
      setError(`Файл слишком большой. Максимальный размер: ${maxSizeMB} MB.`);
      setInputKey((prevKey) => prevKey + 1);
      return;
    }
    try {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImg(imageUrl);
      // При успешном выборе файла инпут можно не сбрасывать сразу,
      // но если вы хотите позволить пользователю выбрать тот же файл снова
      // (хотя браузеры обычно не срабатывают onChange для того же файла),
      // или просто обеспечить полный сброс UI, можно сбросить и здесь.
      // В данном случае оставляем его так, чтобы имя файла оставалось видно при успехе.
    } catch (err) {
      console.error("Error creating object URL:", err);
      setError("Не удалось создать предварительный просмотр изображения.");
      // Если ошибка при создании URL, сбрасываем инпут
      setInputKey((prevKey) => prevKey + 1);
    }
  };

  return (
    <div>
      <Input
        key={inputKey}
        type="file"
        accept="image/jpeg, image/png, image/svg, image/webp"
        onChange={handleFileChange}
      />
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      {selectedImg && !error && (
        <img
          src={selectedImg}
          width={200}
          height={200}
          alt="Предварительный просмотр изображения"
          className="object-contain max-h-[200px] mt-2"
        />
      )}
    </div>
  );
};
