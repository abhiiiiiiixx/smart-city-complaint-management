import React, { useState } from 'react';
import { UploadCloud, X, Link, Image as ImageIcon } from 'lucide-react';
import { Button } from '../ui/Button';

interface ImageUploaderProps {
  images: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
  label?: string;
  helperText?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onChange,
  maxFiles = 3,
  label = 'Upload Complaint Photos',
  helperText = 'Attach clear photos of the civic problem (JPEG, PNG, max 5MB).',
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [showUrlField, setShowUrlField] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = maxFiles - images.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    filesToProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          onChange([...images, uploadEvent.target.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    if (images.length < maxFiles) {
      onChange([...images, urlInput.trim()]);
      setUrlInput('');
      setShowUrlField(false);
    }
  };

  const handleRemove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-slate-800">{label}</label>
        <span className="text-xs text-slate-500">
          {images.length} of {maxFiles} images added
        </span>
      </div>

      {images.length < maxFiles && (
        <div className="flex flex-col sm:flex-row gap-3">
          {/* File input zone */}
          <label className="flex-1 border-2 border-dashed border-slate-300 hover:border-teal-500 hover:bg-teal-50/20 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors text-center">
            <UploadCloud className="w-8 h-8 text-teal-600 mb-1" />
            <span className="text-sm font-semibold text-slate-700">
              Click to browse photo
            </span>
            <span className="text-xs text-slate-400 mt-0.5">{helperText}</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>

          {/* Or URL input toggle */}
          <div className="sm:w-36 flex flex-col justify-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => setShowUrlField(!showUrlField)}
            >
              <Link className="w-3.5 h-3.5 mr-1" />
              {showUrlField ? 'Hide URL' : 'Use Web URL'}
            </Button>
          </div>
        </div>
      )}

      {showUrlField && (
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="Paste image web link (https://...)"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-900"
          />
          <Button type="button" size="sm" onClick={handleAddUrl}>
            Add
          </Button>
        </div>
      )}

      {/* Image previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3 pt-1">
          {images.map((img, idx) => (
            <div
              key={idx}
              className="relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-100 aspect-video flex items-center justify-center"
            >
              <img
                src={img}
                alt={`Uploaded ${idx + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="p-1.5 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
