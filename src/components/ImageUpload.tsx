// components/ImageUpload.tsx
import { useState } from "react";
import { uploadService } from "@/lib/api/services";
import { Upload, X, Loader } from "lucide-react";

interface ImageUploadProps {
  multiple?: boolean;
  maxFiles?: number;
  onUploadComplete: (urls: string[]) => void;
  existingImages?: string[];
}

export default function ImageUpload({
  multiple = false,
  maxFiles = 10,
  onUploadComplete,
  existingImages = [],
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<string[]>(existingImages);
  const [error, setError] = useState("");

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

    try {
      if (multiple) {
        const response = await uploadService.uploadMultiple(files);
        const newUrls = response.data.map((file: any) => file.url);
        const updatedImages = [...images, ...newUrls];
        setImages(updatedImages);
        onUploadComplete(updatedImages);
      } else {
        const response = await uploadService.uploadSingle(files[0]);
        const newUrl = response.data.url;
        setImages([newUrl]);
        onUploadComplete([newUrl]);
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = "";
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

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <div>
        <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
          <div className="text-center">
            {uploading ? (
              <>
                <Loader className="mx-auto h-8 w-8 text-blue-500 animate-spin" />
                <p className="mt-2 text-sm text-gray-600">Uploading...</p>
              </>
            ) : (
              <>
                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  Click to upload {multiple ? "images" : "an image"}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  PNG, JPG, GIF up to 5MB
                </p>
              </>
            )}
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            multiple={multiple}
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Image Preview */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Upload ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border border-gray-200"
              />
              <button
                onClick={() => handleRemoveImage(url)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Image Count */}
      {multiple && images.length > 0 && (
        <p className="text-sm text-gray-500">
          {images.length} / {maxFiles} images uploaded
        </p>
      )}
    </div>
  );
}
