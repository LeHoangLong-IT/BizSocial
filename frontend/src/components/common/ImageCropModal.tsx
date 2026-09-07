"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Modal, Slider, Button, Tooltip, Upload, App } from 'antd';
import {
  RotateLeftOutlined,
  RotateRightOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  UploadOutlined,
  ScissorOutlined,
  RedoOutlined,
  CheckOutlined,
  CloseOutlined,
} from '@ant-design/icons';

interface ImageCropModalProps {
  open: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onCropComplete: (croppedBase64: string) => void;
  aspectRatio?: number; // 1 for Avatar (1:1), 3.2 for Banner (16:5)
  title?: string;
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  open,
  imageSrc: initialImageSrc,
  onClose,
  onCropComplete,
  aspectRatio = 1,
  title = 'Chỉnh sửa & Cắt ảnh',
}) => {
  const { message } = App.useApp();
  const [imgSrc, setImgSrc] = useState<string | null>(initialImageSrc);
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const isBanner = aspectRatio !== 1;

  // Sync initial image src when modal opens
  useEffect(() => {
    setImgSrc(initialImageSrc);
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  }, [initialImageSrc, open]);

  // Load image object
  useEffect(() => {
    if (!imgSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imgSrc;
    img.onload = () => {
      imageRef.current = img;
      drawCanvas();
    };
  }, [imgSrc]);

  // Draw on canvas whenever zoom, rotation, or position changes
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const canvasWidth = 420;
    const canvasHeight = 360;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    ctx.save();
    // Move to center of canvas for rotation & scaling
    ctx.translate(canvasWidth / 2 + position.x, canvasHeight / 2 + position.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    // Calculate scale to fit image appropriately inside target crop region
    const scale = Math.min(canvasWidth / img.width, canvasHeight / img.height);
    const drawWidth = img.width * scale;
    const drawHeight = img.height * scale;

    ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    ctx.restore();
  }, [zoom, rotation, position]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Handle Mouse / Touch Dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Quick rotation buttons
  const rotateLeft = () => setRotation((prev) => (prev - 90) % 360);
  const rotateRight = () => setRotation((prev) => (prev + 90) % 360);
  const resetTransform = () => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  // Handle new image upload inside crop modal
  const handleSelectNewImage = (file: File) => {
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Kích thước ảnh phải nhỏ hơn 5MB!');
      return false;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImgSrc(e.target.result as string);
        resetTransform();
      }
    };
    reader.readAsDataURL(file);
    return false; // Prevent auto upload
  };

  // Generate Cropped Image Base64
  const handleConfirmCrop = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) {
      message.warning('Vui lòng chọn ảnh trước khi xác nhận!');
      return;
    }

    const cropCanvas = document.createElement('canvas');
    let outWidth = 300;
    let outHeight = 300;
    let cropRegionW = 280;
    let cropRegionH = 280;

    if (isBanner) {
      outWidth = 800;
      outHeight = 250;
      cropRegionW = 380;
      cropRegionH = 120;
    }

    cropCanvas.width = outWidth;
    cropCanvas.height = outHeight;
    const cropCtx = cropCanvas.getContext('2d');

    if (!cropCtx) return;

    const sourceCenterX = canvas.width / 2;
    const sourceCenterY = canvas.height / 2;

    // Draw the cropped central area onto cropCanvas
    cropCtx.drawImage(
      canvas,
      sourceCenterX - cropRegionW / 2,
      sourceCenterY - cropRegionH / 2,
      cropRegionW,
      cropRegionH,
      0,
      0,
      outWidth,
      outHeight
    );

    const croppedBase64 = cropCanvas.toDataURL('image/jpeg', 0.92);
    onCropComplete(croppedBase64);
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title={
        <div className="flex items-center gap-2 text-slate-800 dark:text-white font-bold text-base">
          <ScissorOutlined className="text-indigo-500 text-lg" />
          <span>{title}</span>
        </div>
      }
      width={520}
      centered
      destroyOnHidden
      className="rounded-2xl overflow-hidden"
    >
      <div className="space-y-5 pt-2">
        {/* Canvas Workspace Container */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="relative w-full h-[360px] bg-slate-900 rounded-2xl flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing select-none shadow-inner border border-slate-800"
        >
          {/* Main Canvas rendering edited image */}
          <canvas ref={canvasRef} className="pointer-events-none" />

          {/* Overlay Mask */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {isBanner ? (
              // Banner Rectangular Mask
              <div className="w-[380px] h-[120px] rounded-2xl border-2 border-indigo-400/90 shadow-[0_0_0_9999px_rgba(15,23,42,0.65)] flex items-center justify-center relative">
                <div className="w-full h-full rounded-2xl border border-white/40 border-dashed animate-pulse" />
              </div>
            ) : (
              // Avatar Circular Mask
              <div className="w-[280px] h-[280px] rounded-full border-2 border-indigo-400/90 shadow-[0_0_0_9999px_rgba(15,23,42,0.65)] flex items-center justify-center relative">
                <div className="w-full h-full rounded-full border border-white/40 border-dashed animate-pulse" />
              </div>
            )}
          </div>

          {!imgSrc && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 space-y-2">
              <UploadOutlined className="text-4xl text-slate-500" />
              <span className="text-sm font-medium">Kéo thả hoặc chọn ảnh để chỉnh sửa</span>
            </div>
          )}
        </div>

        {/* Action Controls & Sliders */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl space-y-3 border border-slate-200/80 dark:border-slate-700/60">
          {/* Zoom Slider */}
          <div className="flex items-center gap-3">
            <ZoomOutOutlined className="text-slate-400 text-base" />
            <Slider
              min={0.5}
              max={3.0}
              step={0.05}
              value={zoom}
              onChange={(val) => setZoom(val)}
              className="flex-1"
              tooltip={{ formatter: (val) => `${Math.round((val || 1) * 100)}%` }}
            />
            <ZoomInOutlined className="text-slate-400 text-base" />
          </div>

          {/* Rotation Slider & Quick Action Buttons */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1.5">
              <Tooltip title="Xoay trái 90°">
                <Button
                  shape="circle"
                  icon={<RotateLeftOutlined />}
                  onClick={rotateLeft}
                  className="bg-white dark:bg-slate-700 hover:border-indigo-500"
                />
              </Tooltip>
              <Tooltip title="Xoay phải 90°">
                <Button
                  shape="circle"
                  icon={<RotateRightOutlined />}
                  onClick={rotateRight}
                  className="bg-white dark:bg-slate-700 hover:border-indigo-500"
                />
              </Tooltip>
              <Tooltip title="Đặt lại vị trí & xoay">
                <Button
                  shape="circle"
                  icon={<RedoOutlined />}
                  onClick={resetTransform}
                  className="bg-white dark:bg-slate-700 hover:border-indigo-500"
                />
              </Tooltip>
            </div>

            <Upload
              beforeUpload={handleSelectNewImage}
              showUploadList={false}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />} className="text-xs font-semibold rounded-lg">
                Chọn ảnh khác
              </Button>
            </Upload>
          </div>
        </div>

        {/* Modal Bottom Action Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button
            onClick={onClose}
            icon={<CloseOutlined />}
            className="rounded-xl font-medium px-5"
          >
            Hủy bỏ
          </Button>

          <Button
            type="primary"
            onClick={handleConfirmCrop}
            icon={<CheckOutlined />}
            className="bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold px-6 shadow-md shadow-indigo-600/20"
          >
            Xác nhận cắt ảnh
          </Button>
        </div>
      </div>
    </Modal>
  );
};
