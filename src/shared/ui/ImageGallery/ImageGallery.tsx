import Image from "next/image";
import React from "react";

// 1. Добавляем описание типа для одной картинки
export type GalleryImage = {
  id: string;
  src: string;
};

// 2. Описываем пропсы компонента
interface ImageGalleryProps {
  images: GalleryImage[];
}

// 3. Применяем тип к компоненту
const ImageGallery: React.FC<ImageGalleryProps> = ({ images = [] }) => {
  return (
    <div className="h-full w-full overflow-y-auto p-3">
      <div className="grid grid-cols-3 gap-2">
        {images.map((photo) => (
          <div
            key={photo.id}
            className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100"
          >
            <Image
              src={photo.src}
              alt="фото"
              fill
              sizes="(max-width: 768px) 33vw, 25vw"
              style={{ objectFit: "cover" }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageGallery;
