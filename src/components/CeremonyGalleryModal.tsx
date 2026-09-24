import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  Plus,
  Trash2,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Download,
  Image as ImageIcon,
  Sparkles,
  Link as LinkIcon,
  Check,
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import { Language } from '../types';
import {
  CeremonyPhoto,
  CEREMONY_THEMES,
  getCeremonyPhotos,
  addCeremonyPhoto,
  deleteCeremonyPhoto,
  resetCeremonyPhotos,
  compressImageFile
} from '../utils/ceremonyGalleryStorage';

interface CeremonyGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  ceremonyId: 'haldi' | 'mehndi' | 'baraat' | 'nikah' | 'rukhsati';
  language: Language;
  onPhotosUpdated?: (count: number) => void;
}

export const CeremonyGalleryModal: React.FC<CeremonyGalleryModalProps> = ({
  isOpen,
  onClose,
  ceremonyId,
  language,
  onPhotosUpdated
}) => {
  const [photos, setPhotos] = useState<CeremonyPhoto[]>(() => getCeremonyPhotos(ceremonyId));
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showUrlInput, setShowUrlInput] = useState<boolean>(false);
  const [urlInput, setUrlInput] = useState<string>('');
  const [captionInput, setCaptionInput] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const onPhotosUpdatedRef = useRef(onPhotosUpdated);
  onPhotosUpdatedRef.current = onPhotosUpdated;
  const theme = CEREMONY_THEMES[ceremonyId] || CEREMONY_THEMES.haldi;

  // Sync photos when modal opens or ceremonyId changes
  useEffect(() => {
    if (isOpen) {
      const loaded = getCeremonyPhotos(ceremonyId);
      setPhotos(loaded);
    }
  }, [isOpen, ceremonyId]);

  // Listen for real-time background updates
  useEffect(() => {
    const handleUpdateEvent = (e: any) => {
      if (e.detail?.ceremonyId === ceremonyId && Array.isArray(e.detail?.photos)) {
        setPhotos(e.detail.photos);
      }
    };

    window.addEventListener('ceremonyPhotosUpdated', handleUpdateEvent);
    return () => window.removeEventListener('ceremonyPhotosUpdated', handleUpdateEvent);
  }, [ceremonyId]);

  // Handle escape key to close modal or lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        if (selectedPhotoIndex !== null) {
          setSelectedPhotoIndex(null);
        } else {
          onClose();
        }
      } else if (selectedPhotoIndex !== null) {
        if (e.key === 'ArrowRight') {
          handleNext();
        } else if (e.key === 'ArrowLeft') {
          handlePrev();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedPhotoIndex, photos.length]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (selectedPhotoIndex === null) return;
    setSelectedPhotoIndex((selectedPhotoIndex + 1) % photos.length);
  };

  const handlePrev = () => {
    if (selectedPhotoIndex === null) return;
    setSelectedPhotoIndex((selectedPhotoIndex - 1 + photos.length) % photos.length);
  };

  // Process and save uploaded image files
  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setIsUploading(true);
    setStatusMessage(null);

    try {
      let updatedPhotos = photos;
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        if (!file.type.startsWith('image/')) continue;

        const compressedDataUrl = await compressImageFile(file);
        const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
        const newPhoto: CeremonyPhoto = {
          id: `${ceremonyId}-${Date.now()}-${i}`,
          url: compressedDataUrl,
          captionEn: fileNameWithoutExt || `${theme.tagEn} photo`,
          captionUr: `${theme.tagUr} کی تصویر`,
          captionHi: `${theme.tagHi} की तस्वीर`,
          isCustom: true,
          dateAdded: new Date().toLocaleDateString()
        };

        updatedPhotos = addCeremonyPhoto(ceremonyId, newPhoto);
      }

      setPhotos(updatedPhotos);
      if (onPhotosUpdatedRef.current) onPhotosUpdatedRef.current(updatedPhotos.length);
      setStatusMessage({
        type: 'success',
        text: language === 'ur' ? 'تصویر کامیابی سے شامل ہو گئی!' : language === 'hi' ? 'तस्वीर सफलतापूर्वक जोड़ दी गई!' : 'Photos added successfully!'
      });
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (err) {
      console.error('Failed to process image:', err);
      setStatusMessage({
        type: 'error',
        text: language === 'ur' ? 'تصویر اپلوڈ کرنے میں مسئلہ ہوا' : language === 'hi' ? 'फोटो अपलोड करने में त्रुटि हुई' : 'Failed to upload photo'
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Add photo via direct image link / URL
  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    const newPhoto: CeremonyPhoto = {
      id: `${ceremonyId}-${Date.now()}`,
      url: urlInput.trim(),
      captionEn: captionInput.trim() || `${theme.tagEn} memory`,
      captionUr: captionInput.trim() || `${theme.tagUr} کی خوبصورت یاد`,
      captionHi: captionInput.trim() || `${theme.tagHi} کی सुंदर याद`,
      isCustom: true,
      dateAdded: new Date().toLocaleDateString()
    };

    const updated = addCeremonyPhoto(ceremonyId, newPhoto);
    setPhotos(updated);
    if (onPhotosUpdatedRef.current) onPhotosUpdatedRef.current(updated.length);

    setUrlInput('');
    setCaptionInput('');
    setShowUrlInput(false);
    setStatusMessage({
      type: 'success',
      text: language === 'ur' ? 'تصویر شامل ہو گئی!' : language === 'hi' ? 'तस्वीर जोड़ दी गई!' : 'Photo URL added!'
    });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // Delete a user-uploaded custom photo
  const handleDelete = (e: React.MouseEvent, photoId: string) => {
    e.stopPropagation();
    const updated = deleteCeremonyPhoto(ceremonyId, photoId);
    setPhotos(updated);
    if (onPhotosUpdatedRef.current) onPhotosUpdatedRef.current(updated.length);
    if (selectedPhotoIndex !== null && selectedPhotoIndex >= updated.length) {
      setSelectedPhotoIndex(null);
    }
  };

  // Reset photos back to original defaults
  const handleReset = () => {
    const updated = resetCeremonyPhotos(ceremonyId);
    setPhotos(updated);
    if (onPhotosUpdatedRef.current) onPhotosUpdatedRef.current(updated.length);
    setStatusMessage({
      type: 'success',
      text: language === 'ur' ? 'اصلی تصاویر بحال کر دی گئیں' : language === 'hi' ? 'डिफ़ॉल्ट तस्वीरें बहाल कर दी गईं' : 'Default photos restored'
    });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Get caption in current language
  const getCaption = (photo: CeremonyPhoto) => {
    if (language === 'ur') return photo.captionUr || photo.captionEn;
    if (language === 'hi') return photo.captionHi || photo.captionEn;
    return photo.captionEn;
  };

  const currentTitle = language === 'ur' ? theme.titleUr : language === 'hi' ? theme.titleHi : theme.titleEn;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/40 backdrop-blur-sm animate-fadeIn overflow-y-auto"
      onClick={onClose}
    >
      {/* Modal Container */}
      <div
        className="relative w-full max-w-4xl my-auto bg-white/95 backdrop-blur-md rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.18)] border border-white/80 p-4 sm:p-6 overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-gray-100/80 gap-2 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-2xl sm:text-3xl shrink-0 drop-shadow-sm">{theme.iconEmoji}</span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className={`text-lg sm:text-xl font-bold text-gray-900 truncate ${language === 'ur' ? 'font-urdu' : language === 'hi' ? 'font-hindi' : ''}`}>
                  {currentTitle}
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${theme.badgeBg} ${theme.badgeText} shrink-0`}>
                  {photos.length} {language === 'ur' ? 'تصاویر' : language === 'hi' ? 'तस्वीरें' : 'Photos'}
                </span>
              </div>
              <p className={`text-xs text-gray-500 truncate ${language === 'hi' ? 'font-hindi' : ''}`}>
                {language === 'ur'
                  ? 'اپنی پسندیدہ تصاویر شامل کریں اور یادوں کو محفوظ رکھیں'
                  : language === 'hi'
                  ? 'अपनी पसंदीदा तस्वीरें जोड़ें और सुनहरी यादों को संजोएं'
                  : 'Add your own photos to create a timeless ceremony album'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all cursor-pointer shrink-0"
            title="Close Gallery"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar (Upload Button, Add URL toggle, Status feedback) */}
        <div className="py-3 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-2">
            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />

            {/* Upload Button */}
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-white shadow-sm transition-all cursor-pointer hover:scale-105 active:scale-95 bg-gradient-to-r ${theme.buttonGradient} ${
                isUploading ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span className={language === 'hi' ? 'font-hindi' : ''}>
                {isUploading
                  ? (language === 'ur' ? 'شامل کی جا رہی ہے...' : language === 'hi' ? 'अपलोड हो रही है...' : 'Adding...')
                  : (language === 'ur' ? 'تصویر اپلوڈ کریں' : language === 'hi' ? 'तस्वीर जोड़ें' : 'Upload Photos')}
              </span>
            </button>

            {/* Toggle Image Link Input */}
            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all cursor-pointer"
            >
              <LinkIcon className="w-3 h-3" />
              <span className={language === 'hi' ? 'font-hindi' : ''}>
                {language === 'ur' ? 'لنک سے شامل کریں' : language === 'hi' ? 'लिंक से जोड़ें' : 'Add by URL'}
              </span>
            </button>

            {/* Reset to defaults */}
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 transition-all cursor-pointer"
              title={language === 'ur' ? 'اصلی تصاویر بحال کریں' : language === 'hi' ? 'डिफ़ॉल्ट तस्वीरें वापस लाएं' : 'Reset to default photos'}
            >
              <RotateCcw className="w-3 h-3" />
              <span className={`hidden sm:inline ${language === 'hi' ? 'font-hindi' : ''}`}>
                {language === 'ur' ? 'ریسیٹ' : language === 'hi' ? 'रीसेट' : 'Reset'}
              </span>
            </button>
          </div>

          {/* Toast / Status feedback */}
          {statusMessage && (
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold animate-fadeIn ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : 'bg-rose-100 text-rose-900 border border-rose-300'
              }`}
            >
              {statusMessage.type === 'success' ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
              <span>{statusMessage.text}</span>
            </div>
          )}
        </div>

        {/* Collapsible URL Input Bar */}
        {showUrlInput && (
          <form
            onSubmit={handleAddUrl}
            className="mb-3 p-3 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row items-center gap-2 shrink-0 animate-fadeIn"
          >
            <input
              type="url"
              placeholder="https://example.com/photo.jpg"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              required
              className="w-full sm:flex-1 px-3 py-1.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
            />
            <input
              type="text"
              placeholder={language === 'ur' ? 'عنوان (اختیاری)' : language === 'hi' ? 'कैप्शन (वैकल्पिक)' : 'Caption (optional)'}
              value={captionInput}
              onChange={(e) => setCaptionInput(e.target.value)}
              className="w-full sm:w-48 px-3 py-1.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
            />
            <button
              type="submit"
              className={`w-full sm:w-auto px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r ${theme.buttonGradient} shadow-sm hover:scale-105 active:scale-95 cursor-pointer shrink-0`}
            >
              <span className={language === 'hi' ? 'font-hindi' : ''}>
                {language === 'ur' ? 'محفوظ کریں' : language === 'hi' ? 'सुरक्षित करें' : 'Save'}
              </span>
            </button>
          </form>
        )}

        {/* Drag & Drop Upload Zone (on hover or drop) */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          className={`flex-1 overflow-y-auto pr-1 rounded-2xl transition-all ${
            isDragging ? 'bg-amber-50/70 border-2 border-dashed border-amber-400 p-2' : ''
          }`}
        >
          {photos.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">No photos yet. Click "Upload Photos" above!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-1">
              {photos.map((photo, idx) => (
                <div
                  key={photo.id}
                  onClick={() => setSelectedPhotoIndex(idx)}
                  className="group relative rounded-2xl overflow-hidden bg-gray-100 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200/70 cursor-pointer aspect-4/3 flex flex-col"
                >
                  <img
                    src={photo.url}
                    alt={getCaption(photo)}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Gradient Overlay & Actions on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-2.5">
                    {/* Top Row: Badges & Delete (if custom) */}
                    <div className="flex items-center justify-between w-full">
                      {photo.isCustom ? (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-400 text-gray-950 shadow-xs">
                          {language === 'ur' ? 'آپ کی تصویر' : language === 'hi' ? 'आपकी फोटो' : 'My Photo'}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/80 text-gray-800 shadow-xs backdrop-blur-xs">
                          {theme.tagEn}
                        </span>
                      )}

                      {/* Delete button for any photo (custom or preset) */}
                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, photo.id)}
                        className="p-1 rounded-full bg-rose-600/90 text-white hover:bg-rose-700 hover:scale-110 transition-all cursor-pointer shadow-xs"
                        title={language === 'ur' ? 'تصویر ہٹائیں' : language === 'hi' ? 'तस्वीर हटाएं' : 'Delete photo'}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Bottom: Caption & Zoom Icon */}
                    <div className="flex items-end justify-between gap-1 text-white">
                      <p className={`text-[11px] font-medium line-clamp-2 leading-tight drop-shadow-sm ${language === 'ur' ? 'font-urdu text-right' : language === 'hi' ? 'font-hindi' : ''}`}>
                        {getCaption(photo)}
                      </p>
                      <Maximize2 className="w-3.5 h-3.5 text-white/90 shrink-0 mb-0.5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Hint */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 shrink-0">
          <div className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>
              {language === 'ur'
                ? 'تصویر پر کلک کر کے فل اسکرین دیکھیں'
                : language === 'hi'
                ? 'फुल स्क्रीन देखने के लिए किसी भी फोटो पर क्लिक करें'
                : 'Click any photo to view in fullscreen lightbox'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-full text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-all cursor-pointer"
          >
            {language === 'ur' ? 'بند کریں' : language === 'hi' ? 'बंद करें' : 'Done'}
          </button>
        </div>
      </div>

      {/* Lightbox / Fullscreen Viewer */}
      {selectedPhotoIndex !== null && photos[selectedPhotoIndex] && (
        <div
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex flex-col items-center justify-between p-3 sm:p-6 animate-fadeIn"
          onClick={() => setSelectedPhotoIndex(null)}
        >
          {/* Lightbox Top Bar */}
          <div className="w-full flex items-center justify-between text-white z-10">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/10 backdrop-blur-md">
              {selectedPhotoIndex + 1} / {photos.length}
            </span>

            <div className="flex items-center gap-2">
              <a
                href={photos[selectedPhotoIndex].url}
                download={`ceremony-${ceremonyId}-${selectedPhotoIndex + 1}.jpg`}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                title="Download Photo"
              >
                <Download className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={() => setSelectedPhotoIndex(null)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                title="Close Lightbox"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Lightbox Main Image + Prev/Next buttons */}
          <div
            className="relative w-full max-w-4xl flex-1 flex items-center justify-center my-2 select-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Prev Button */}
            {photos.length > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-2 sm:-left-12 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-all cursor-pointer shadow-lg z-10"
                title="Previous photo"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Active Photo */}
            <div className="max-h-[75vh] max-w-full flex flex-col items-center">
              <img
                src={photos[selectedPhotoIndex].url}
                alt={getCaption(photos[selectedPhotoIndex])}
                className="max-h-[72vh] max-w-full object-contain rounded-2xl shadow-2xl"
              />
            </div>

            {/* Next Button */}
            {photos.length > 1 && (
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-2 sm:-right-12 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-all cursor-pointer shadow-lg z-10"
                title="Next photo"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Lightbox Caption */}
          <div className="w-full max-w-xl text-center text-white pb-2 z-10">
            <p className={`text-sm sm:text-base font-semibold drop-shadow-md ${language === 'ur' ? 'font-urdu' : language === 'hi' ? 'font-hindi' : ''}`}>
              {getCaption(photos[selectedPhotoIndex])}
            </p>
            {photos[selectedPhotoIndex].dateAdded && (
              <p className="text-[11px] text-white/60 mt-0.5">
                {photos[selectedPhotoIndex].dateAdded}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
