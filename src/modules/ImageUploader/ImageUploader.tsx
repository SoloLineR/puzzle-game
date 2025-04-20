import { Input } from "@/components/ui/input";
import { useState } from "react";

export const ImageUploader = () => {
  const [selectedImg, setSelectedImg] = useState<string>();
  return (
    <div>
      <Input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          setSelectedImg(file ? URL.createObjectURL(file) : undefined);
        }}
      />
      {selectedImg && (
        <img
          src={selectedImg}
          width={200}
          height={200}
          alt="preview"
          className="object-contain max-h-[200px]"
        />
      )}
    </div>
  );
};
