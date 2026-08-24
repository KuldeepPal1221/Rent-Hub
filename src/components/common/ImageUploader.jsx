import React, { useState } from 'react';
import { UploadCloud, X, Image as ImageIcon, Plus, Link as LinkIcon, Loader2, Star } from 'lucide-react';
import { uploadService } from '../../services/api.js';
import { useToast } from './Toast.jsx';

export const ImageUploader = ({ images = [], setImages, maxImages = 6 }) => {
  const toast = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlField, setShowUrlField] = useState(false);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (images.length + files.length > maxImages) {
      toast.error(`You can upload a maximum of ${maxImages} images per product.`);
      return;
    }

    // Validate size (<10MB) and type
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File "${file.name}" exceeds the 10MB size limit.`);
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error(`File "${file.name}" is not an image file.`);
        return;
      }
    }

    try {
      setIsUploading(true);
      const res = await uploadService.uploadMultiple(files);
      if (res.success && res.urls) {
        setImages([...images, ...res.urls]);
        toast.success(`Uploaded ${res.urls.length} image(s).`);
      }
    } catch (err) {
      toast.error(err.message || 'Image upload failed.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleAddUrl = (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    if (images.length >= maxImages) {
      toast.error(`Maximum of ${maxImages} images allowed.`);
      return;
    }

    const trimmed = urlInput.trim();
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      toast.error('Please enter a valid image URL starting with http:// or https://');
      return;
    }

    setImages([...images, trimmed]);
    setUrlInput('');
    setShowUrlField(false);
    toast.success('Image URL added.');
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages(images.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSetPrimary = (index) => {
    if (index === 0) return;
    const selected = images[index];
    const rest = images.filter((_, idx) => idx !== index);
    setImages([selected, ...rest]);
    toast.info('Primary cover image updated.');
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {/* Upload Trigger Button */}
        {images.length < maxImages && (
          <label className={`border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/50 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all aspect-square relative ${isUploading ? 'opacity-60 pointer-events-none' : ''}`}>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              className="sr-only"
            />
            {isUploading ? (
              <div className="flex flex-col items-center gap-2 text-emerald-600">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="text-xs font-semibold">Uploading...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-500 group-hover:text-emerald-600">
                <div className="w-10 h-10 rounded-full bg-white shadow-xs flex items-center justify-center text-emerald-600 border border-slate-200">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-800">Upload Photo</span>
                <span className="text-[10px] text-slate-400">PNG, JPG up to 10MB</span>
              </div>
            )}
          </label>
        )}

        {/* Existing Images Thumbnails */}
        {images.map((imgUrl, index) => (
          <div
            key={index}
            className="relative group aspect-square rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-xs"
          >
            <img
              src={imgUrl}
              alt={`Product preview ${index + 1}`}
              className="w-full h-full object-cover"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
              <div className="flex justify-between items-center">
                {index === 0 ? (
                  <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-md flex items-center gap-1 shadow">
                    <Star className="w-3 h-3 fill-current" /> Cover
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(index)}
                    className="text-[10px] font-bold bg-slate-900/80 hover:bg-slate-900 text-white px-2 py-0.5 rounded-md transition-colors"
                  >
                    Set Cover
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="p-1 rounded-full bg-rose-600 hover:bg-rose-700 text-white transition-colors shadow"
                  title="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <span className="text-[10px] text-white/90 text-right font-medium">
                Photo {index + 1}
              </span>
            </div>

            {/* Always visible cover badge on primary */}
            {index === 0 && (
              <div className="absolute bottom-2 left-2 group-hover:hidden">
                <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-md shadow flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" /> Cover Photo
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Alternative: Add Image by URL toggle */}
      <div className="pt-1">
        {!showUrlField ? (
          <button
            type="button"
            onClick={() => setShowUrlField(true)}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5"
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Or paste an image web URL</span>
          </button>
        ) : (
          <form onSubmit={handleAddUrl} className="flex gap-2 items-center max-w-md bg-slate-50 p-2 rounded-xl border border-slate-200">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="flex-1 text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              className="px-3 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
            >
              Add URL
            </button>
            <button
              type="button"
              onClick={() => setShowUrlField(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
