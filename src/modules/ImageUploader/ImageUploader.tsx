import {Input} from '@/components/ui/input';
import React, {useState, useEffect} from 'react';
import {toast} from 'sonner';
import {allowedTypes, maxSizeBytes} from './constants';

export const ImageUploader: React.FC = () => {
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
    if (selectedImg) {
      URL.revokeObjectURL(selectedImg);
    }
    setSelectedImg(undefined);
    setError(null);
    const file = e.target.files?.[0];

    if (!file) {
      setInputKey(prevKey => prevKey + 1);
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      const msg = 'Недопустимый формат файла. Выберите JPEG, PNG, WEBP или SVG.';
      setError(msg);
      toast.error(msg);

      setInputKey(prevKey => prevKey + 1);
      return;
    }

    if (file.size > maxSizeBytes) {
      const maxSizeMB = maxSizeBytes / (1024 * 1024);
      const msg = `Файл слишком большой. Максимальный размер: ${maxSizeMB} MB.`;
      setError(msg);
      toast.error(msg);

      setInputKey(prevKey => prevKey + 1);
      return;
    }

    setError(null);

    try {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImg(imageUrl);
    } catch (err) {
      console.error('Error creating object URL for preview:', err);

      setError('Не удалось создать предварительный просмотр изображения.');

      setInputKey(prevKey => prevKey + 1);
      toast.error('Не удалось создать предварительный просмотр изображения.');
    }
  };

  return (
    <div className="flex flex-col items-center">
      <Input key={inputKey} type="file" onChange={handleFileChange} />

      {selectedImg && !error && (
        <img
          src={selectedImg}
          width={400}
          height={400}
          alt="Предварительный просмотр изображения"
          className="mt-2 max-h-[400px] object-contain"
        />
      )}
    </div>
  );
};
