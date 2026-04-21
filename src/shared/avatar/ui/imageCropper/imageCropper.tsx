"use client";

import Confirm from "@icons/confirm.svg";
import { useCallback, useState } from "react";
import Cropper, { Area } from "react-easy-crop";

import { getCroppedImg } from "../../lib/cropImage";
import { ZoomSlider } from "./zoomSlider";

type Props = {
  src: string;
  onConfirm: (image: string) => void;
  onClose?: () => void;
};

export const ImageCropper = ({ src, onConfirm }: Props) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setArea(croppedAreaPixels);
  }, []);

  const handleConfirm = async () => {
    if (!area) return;
    const img = await getCroppedImg(src, area);
    onConfirm(img);
  };

  return (
    <>
      <div className="w-full">
        <div className="relative h-80 overflow-hidden rounded-md">
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
      </div>
      <div className="mt-5 flex w-full items-center justify-between gap-6">
        <ZoomSlider value={zoom} onChange={setZoom} />

        <button onClick={handleConfirm} className="cursor-pointer">
          <Confirm className="text-primary h-9 w-9 transition duration-200 hover:opacity-80" />
        </button>
      </div>
    </>
  );
};
