import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Cropper from 'react-easy-crop';
import { 
  AiOutlineCamera, 
  AiOutlineClose, 
  AiOutlineUpload,
  AiOutlineGlobal,
  AiOutlineCheck,
  AiOutlineRotateLeft,
  AiOutlineRotateRight,
  AiOutlineZoomIn,
  AiOutlineZoomOut
} from 'react-icons/ai';
import { toast } from 'react-toastify';

/**
 * Enhanced Avatar Uploader with cropping functionality
 */
const AvatarUploader = ({ 
  currentAvatar, 
  onSave, 
  onClose, 
  isOpen,
  loading = false,
  user 
}) => {
  const [image, setImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [uploadMethod, setUploadMethod] = useState('file'); // 'file' or 'url'
  const [imageUrl, setImageUrl] = useState('');
  const [urlValid, setUrlValid] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  const fileInputRef = useRef(null);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result);
        setUploadMethod('file');
      };
      reader.readAsDataURL(file);
    }
  };

  const validateImageUrl = async (url) => {
    try {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
      });
    } catch {
      return false;
    }
  };

  const handleUrlSubmit = async () => {
    if (!imageUrl.trim()) {
      toast.error('Please enter a valid image URL');
      return;
    }

    setProcessing(true);
    const isValid = await validateImageUrl(imageUrl);
    
    if (isValid) {
      setImage(imageUrl);
      setUrlValid(true);
      setUploadMethod('url');
      toast.success('Image loaded successfully');
    } else {
      toast.error('Invalid image URL or image failed to load');
      setUrlValid(false);
    }
    setProcessing(false);
  };

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (imageSrc, pixelCrop, rotation = 0) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const maxSize = Math.max(image.width, image.height);
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

    canvas.width = safeArea;
    canvas.height = safeArea;

    ctx.translate(safeArea / 2, safeArea / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-safeArea / 2, -safeArea / 2);

    ctx.drawImage(
      image,
      safeArea / 2 - image.width * 0.5,
      safeArea / 2 - image.height * 0.5
    );

    const data = ctx.getImageData(0, 0, safeArea, safeArea);

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.putImageData(
      data,
      0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x,
      0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.8);
    });
  };

  const handleSave = async () => {
    if (!image || !croppedAreaPixels) {
      toast.error('Please select and crop an image');
      return;
    }

    try {
      setProcessing(true);
      const croppedBlob = await getCroppedImg(image, croppedAreaPixels, rotation);
      
      if (uploadMethod === 'url') {
        // For URL-based images, we'll save the URL and cropped version
        await onSave(croppedBlob, { url: imageUrl, method: 'url' });
      } else {
        // For file uploads, just save the cropped blob
        await onSave(croppedBlob, { method: 'file' });
      }
      
      handleClose();
    } catch (error) {
      console.error('Error saving avatar:', error);
      toast.error('Failed to save avatar');
    } finally {
      setProcessing(false);
    }
  };

  const handleClose = () => {
    setImage(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCroppedAreaPixels(null);
    setImageUrl('');
    setUrlValid(false);
    setUploadMethod('file');
    onClose();
  };

  const resetCrop = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">Edit Profile Picture</h2>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <AiOutlineClose size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {!image ? (
                <div className="space-y-6">
                  {/* Upload Method Selector */}
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => setUploadMethod('file')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        uploadMethod === 'file'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <AiOutlineUpload />
                      Upload File
                    </button>
                    <button
                      onClick={() => setUploadMethod('url')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        uploadMethod === 'url'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <AiOutlineGlobal />
                      Use URL
                    </button>
                  </div>

                  {/* File Upload */}
                  {uploadMethod === 'file' && (
                    <div className="text-center">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept="image/jpeg,image/png,image/jpg,image/webp"
                        className="hidden"
                      />
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
                      >
                        <AiOutlineCamera size={48} className="mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600 font-medium">Click to upload an image</p>
                        <p className="text-gray-400 text-sm mt-2">
                          Supports JPG, PNG, WEBP (Max 5MB)
                        </p>
                      </div>
                    </div>
                  )}

                  {/* URL Input */}
                  {uploadMethod === 'url' && (
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          onClick={handleUrlSubmit}
                          disabled={processing || !imageUrl.trim()}
                          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {processing ? 'Loading...' : 'Load'}
                        </button>
                      </div>
                      
                      {/* Unsplash suggestions */}
                      <div className="text-center text-gray-500 text-sm">
                        <p>Try these random avatar URLs:</p>
                        <div className="flex gap-2 justify-center mt-2 flex-wrap">
                          {[
                            'https://source.unsplash.com/200x200/?portrait,face',
                            'https://source.unsplash.com/200x200/?person,professional',
                            'https://source.unsplash.com/200x200/?avatar,profile'
                          ].map((url, index) => (
                            <button
                              key={index}
                              onClick={() => setImageUrl(url)}
                              className="text-blue-500 hover:text-blue-600 underline text-xs"
                            >
                              Random {index + 1}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Cropper */}
                  <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                    <Cropper
                      image={image}
                      crop={crop}
                      zoom={zoom}
                      rotation={rotation}
                      aspect={1}
                      onCropChange={setCrop}
                      onCropComplete={onCropComplete}
                      onZoomChange={setZoom}
                      onRotationChange={setRotation}
                    />
                  </div>

                  {/* Controls */}
                  <div className="space-y-4">
                    {/* Zoom Control */}
                    <div className="flex items-center gap-4">
                      <AiOutlineZoomOut />
                      <input
                        type="range"
                        value={zoom}
                        min={1}
                        max={3}
                        step={0.1}
                        onChange={(e) => setZoom(e.target.value)}
                        className="flex-1"
                      />
                      <AiOutlineZoomIn />
                    </div>

                    {/* Rotation Controls */}
                    <div className="flex items-center justify-center gap-4">
                      <button
                        onClick={() => setRotation(rotation - 90)}
                        className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                      >
                        <AiOutlineRotateLeft />
                      </button>
                      <span className="text-sm text-gray-600">Rotation: {rotation}°</span>
                      <button
                        onClick={() => setRotation(rotation + 90)}
                        className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                      >
                        <AiOutlineRotateRight />
                      </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={resetCrop}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Reset
                      </button>
                      <button
                        onClick={() => setImage(null)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Change Image
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={processing || loading}
                        className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                      >
                        {processing || loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <AiOutlineCheck />
                            Save Avatar
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AvatarUploader;
