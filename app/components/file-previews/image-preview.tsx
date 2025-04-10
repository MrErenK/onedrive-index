import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Icons } from "../icons";

interface ImagePreviewProps {
  url: string;
  name: string;
}

export function ImagePreview({ url, name }: ImagePreviewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen]);

  const handleWheel = (e: React.WheelEvent) => {
    if (containerRef.current?.contains(e.target as Node)) {
      e.preventDefault();

      // Make zooming more smooth by using a smaller delta
      const zoomSensitivity = 0.1;
      const delta = e.deltaY < 0 ? zoomSensitivity : -zoomSensitivity;
      const newScale = Math.min(Math.max(scale + delta, 0.5), 3);

      // Calculate cursor position relative to image
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Calculate new position to zoom towards cursor
      if (newScale !== scale) {
        const scaleChange = newScale / scale;
        const newX = position.x - (x - rect.width / 2) * (scaleChange - 1);
        const newY = position.y - (y - rect.height / 2) * (scaleChange - 1);

        setScale(newScale);
        setPosition({ x: newX, y: newY });
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setStartPosition({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - startPosition.x,
        y: e.clientY - startPosition.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDoubleClick = () => {
    // Toggle between 1x and 2x zoom on double click
    const newScale = scale === 1 ? 2 : 1;
    setScale(newScale);
    if (newScale === 1) {
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleZoom = (delta: number) => {
    const newScale = Math.min(Math.max(scale + delta, 0.5), 3);
    setScale(newScale);
    if (newScale === 1) {
      setPosition({ x: 0, y: 0 });
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      closeModal();
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen]);

  // Thumbnail preview in container
  const thumbnailPreview = (
    <div
      className="relative h-full w-full overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 via-white to-gray-100 p-4 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-950"
      onClick={openModal}
    >
      <div className="flex h-full w-full items-center justify-center">
        <motion.img
          src={url}
          alt={name}
          className="max-h-full max-w-full cursor-zoom-in object-contain"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          draggable={false}
        />
      </div>

      <motion.button
        className="absolute bottom-6 right-6 flex items-center gap-2 rounded-full bg-black/80 px-4 py-2 text-sm text-white backdrop-blur-sm transition-all hover:bg-black/90"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Icons.Search className="h-4 w-4" />
        <span>Click to zoom</span>
      </motion.button>
    </div>
  );

  // Full screen modal
  const modalContent = isModalOpen && (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] backdrop-blur-sm"
        onClick={closeModal}
      >
        <div className="fixed inset-0 bg-black/90" />

        <div
          ref={containerRef}
          className="fixed inset-0 z-10 flex items-center justify-center"
          onWheel={handleWheel}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={(e) => e.stopPropagation()}
        >
          <motion.img
            src={url}
            alt={name}
            className="max-h-[90vh] max-w-[90vw] select-none object-contain"
            style={{
              cursor: isDragging ? "grabbing" : scale > 1 ? "grab" : "default",
              transform: `scale(${scale})`,
              transformOrigin: "center",
              translate: `${position.x}px ${position.y}px`,
              transition: isDragging ? "none" : "transform 0.2s ease-out",
            }}
            onMouseDown={handleMouseDown}
            onDoubleClick={handleDoubleClick}
            draggable={false}
          />

          {/* Zoom controls */}
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-black/80 px-4 py-2 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleZoom(-0.2)}
                className="text-white hover:text-blue-400 transition-colors"
                disabled={scale <= 0.5}
              >
                <Icons.Search className="h-5 w-5" />
              </button>
              <span className="text-white min-w-[60px] text-center">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={() => handleZoom(0.2)}
                className="text-white hover:text-blue-400 transition-colors"
                disabled={scale >= 3}
              >
                <Icons.Search className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={closeModal}
            className="fixed right-6 top-6 rounded-full bg-black/80 p-2 text-white hover:bg-black/90 transition-colors"
          >
            <Icons.Close className="h-6 w-6" />
          </button>

          {/* Instructions */}
          <div className="fixed top-6 left-6 text-sm text-white/70">
            <p>Scroll to zoom • Double click to toggle zoom • Drag to pan</p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );

  return (
    <>
      {thumbnailPreview}
      {typeof document !== "undefined" &&
        modalContent &&
        createPortal(modalContent, document.body)}
    </>
  );
}
