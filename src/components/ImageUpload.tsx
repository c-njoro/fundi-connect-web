// components/ImageUpload.tsx
import { useEffect, useState, useRef } from "react";
import { uploadService } from "@/lib/api/services";
import {
  Upload,
  X,
  Camera,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Trash2,
  ChevronRight,
  Grid3x3,
} from "lucide-react";

interface ImageUploadProps {
  multiple?: boolean;
  maxFiles?: number;
  onUploadComplete: (urls: string[]) => void;
  existingImages?: string[];
}

interface UploadProgress {
  fileName: string;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
}

export default function ImageUpload({
  multiple = false,
  maxFiles = 10,
  onUploadComplete,
  existingImages = [],
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<string[]>(existingImages);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"gallery" | "camera">("gallery");
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setImages(existingImages);
  }, [existingImages]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      setError("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setCapturedImage(null);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      context?.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageDataUrl = canvas.toDataURL("image/jpeg");
      setCapturedImage(imageDataUrl);
    }
  };

  const saveCapturedImage = async () => {
    if (!capturedImage) return;

    setUploading(true);
    setError("");

    try {
      // Convert data URL to blob
      const blob = await (await fetch(capturedImage)).blob();
      const file = new File([blob], `camera-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });

      const response = await uploadService.uploadSingle(file);
      const newUrl = response.data.url;

      const updatedImages = multiple ? [...images, newUrl] : [newUrl];
      setImages(updatedImages);
      onUploadComplete(updatedImages);

      stopCamera();
      setCapturedImage(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save image");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate file count
    if (images.length + files.length > maxFiles) {
      setError(`Maximum ${maxFiles} images allowed`);
      return;
    }

    setUploading(true);
    setError("");

    // Initialize progress tracking
    const progressItems: UploadProgress[] = files.map((file) => ({
      fileName: file.name,
      progress: 0,
      status: "pending",
    }));
    setUploadProgress(progressItems);

    try {
      if (multiple) {
        // Simulate progress for multiple files
        const totalSize = files.reduce((sum, file) => sum + file.size, 0);
        let uploadedSize = 0;

        // Update progress
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) =>
            prev.map((item) => {
              if (item.status === "uploading") {
                const estimatedProgress = Math.min(
                  95,
                  (uploadedSize / totalSize) * 100
                );
                return { ...item, progress: estimatedProgress };
              }
              return item;
            })
          );
        }, 100);

        const response = await uploadService.uploadMultiple(files);
        clearInterval(progressInterval);

        const newUrls = response.data.map((file: any) => file.url);
        const updatedImages = [...images, ...newUrls];

        // Mark all as completed
        setUploadProgress((prev) =>
          prev.map((item) => ({ ...item, progress: 100, status: "completed" }))
        );

        setTimeout(() => {
          setImages(updatedImages);
          onUploadComplete(updatedImages);
          setUploadProgress([]);
        }, 500);
      } else {
        const file = files[0];
        setUploadProgress([
          {
            fileName: file.name,
            progress: 0,
            status: "uploading",
          },
        ]);

        const response = await uploadService.uploadSingle(file);
        const newUrl = response.data.url;

        setUploadProgress([
          {
            fileName: file.name,
            progress: 100,
            status: "completed",
          },
        ]);

        setTimeout(() => {
          setImages([newUrl]);
          onUploadComplete([newUrl]);
          setUploadProgress([]);
        }, 500);
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.response?.data?.message || "Upload failed");
      setUploadProgress((prev) =>
        prev.map((item) => ({ ...item, status: "error" }))
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = async (url: string) => {
    try {
      await uploadService.deleteImage(url);
      const updatedImages = images.filter((img) => img !== url);
      setImages(updatedImages);
      onUploadComplete(updatedImages);
    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete image");
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab("gallery")}
          className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
            activeTab === "gallery"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <ImageIcon size={18} />
          Gallery
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("camera");
            if (!cameraActive) startCamera();
          }}
          className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
            activeTab === "camera"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Camera size={18} />
          Camera
        </button>
      </div>

      {/* Camera View */}
      {activeTab === "camera" && (
        <div className="space-y-4">
          {!capturedImage ? (
            <>
              <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                  <button
                    onClick={captureImage}
                    className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                    disabled={!cameraActive}
                  >
                    <div className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center">
                      <div className="w-12 h-12 bg-red-400 rounded-full" />
                    </div>
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={stopCamera}
                  className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Close Camera
                </button>
                <button
                  onClick={openFileDialog}
                  className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Upload size={18} />
                  Upload Instead
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-video">
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  <button
                    onClick={() => setCapturedImage(null)}
                    className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setCapturedImage(null)}
                  className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Retake
                </button>
                <button
                  onClick={saveCapturedImage}
                  disabled={uploading}
                  className="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:bg-gray-400"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      <span>Use This Photo</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Gallery View */}
      {activeTab === "gallery" && (
        <>
          {/* Upload Area */}
          <div
            onClick={openFileDialog}
            className="border-3 border-dashed border-gray-300 rounded-2xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all group"
          >
            <div className="max-w-xs mx-auto">
              <div className="relative">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Upload className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <PlusIcon />
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Drag & drop or click to upload
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Upload up to {maxFiles} images. PNG, JPG, WebP up to 5MB each.
              </p>

              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <span>Supports: JPG, PNG, WebP</span>
                <ChevronRight size={16} />
                <span>Max: 5MB each</span>
              </div>
            </div>
          </div>

          {/* Progress Bars */}
          {uploadProgress.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">
                Upload Progress
              </h4>
              {uploadProgress.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium truncate max-w-[200px]">
                      {item.fileName}
                    </span>
                    <span
                      className={`font-medium ${
                        item.status === "completed"
                          ? "text-green-600"
                          : item.status === "error"
                          ? "text-red-600"
                          : "text-blue-600"
                      }`}
                    >
                      {item.status === "completed"
                        ? "Complete"
                        : item.status === "error"
                        ? "Failed"
                        : `${Math.round(item.progress)}%`}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${
                        item.status === "completed"
                          ? "bg-green-500"
                          : item.status === "error"
                          ? "bg-red-500"
                          : "bg-gradient-to-r from-blue-500 to-purple-500"
                      }`}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
              <AlertCircle className="flex-shrink-0" size={20} />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          {/* Upload Stats */}
          {images.length > 0 && (
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Grid3x3 className="text-blue-600" size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {images.length} image{images.length !== 1 ? "s" : ""}{" "}
                    uploaded
                  </h4>
                  <p className="text-sm text-gray-600">
                    {images.length}/{maxFiles} slots used
                  </p>
                </div>
              </div>
              {images.length > 0 && (
                <button
                  onClick={() => {
                    setImages([]);
                    onUploadComplete([]);
                  }}
                  className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((url, index) => (
            <div
              key={index}
              className="relative group overflow-hidden rounded-xl border border-gray-200 hover:border-blue-400 transition-all"
            >
              <img
                src={url}
                alt={`Upload ${index + 1}`}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* Hover Overlay */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleRemoveImage(url)}
                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                  title="Remove image"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Bottom Gradient */}
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent text-white transform translate-y-full group-hover:translate-y-0 transition-transform">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate">
                    Image {index + 1}
                  </span>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-300 hover:text-white"
                  >
                    View Full
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        multiple={multiple}
        onChange={handleFileChange}
        disabled={uploading}
      />

      {/* Hidden Canvas for Camera Capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

// Custom Plus Icon Component
function PlusIcon() {
  return (
    <svg
      className="w-4 h-4 text-white"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={3}
        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
      />
    </svg>
  );
}
