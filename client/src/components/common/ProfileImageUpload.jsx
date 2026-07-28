import { useState, useRef } from 'react';
import { CameraIcon, UserIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

const ProfileImageUpload = ({ currentImage, onImageChange, userName }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024;

    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Allowed: PNG, JPG, JPEG, GIF, WEBP');
      return;
    }

    if (file.size > maxSize) {
      setError('File too large. Maximum size is 5MB');
      return;
    }

    setError('');
    setUploading(true);

    try {
      const token = sessionStorage.getItem('token');
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post('/api/upload/profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      onImageChange(response.data.url);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getImageUrl = (image) => {
    if (!image) return null;
    if (image.startsWith('http')) return image;
    return image;
  };

  return (
    <div className="text-center">
      <div
        onClick={handleClick}
        className="relative w-24 h-24 mx-auto rounded-full cursor-pointer group overflow-hidden"
      >
        {currentImage ? (
          <img
            src={getImageUrl(currentImage)}
            alt={userName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-primary-100 flex items-center justify-center">
            <span className="text-4xl text-primary-500">
              {userName?.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {uploading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white" />
          ) : (
            <CameraIcon className="w-6 h-6 text-white" />
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpg,image/jpeg,image/gif,image/webp"
        onChange={handleFileSelect}
        disabled={uploading}
        className="hidden"
      />

      <button
        type="button"
        onClick={handleClick}
        disabled={uploading}
        className="mt-2 text-sm text-primary-500 hover:text-primary-600 disabled:opacity-50"
      >
        {uploading ? 'Uploading...' : 'Change Photo'}
      </button>

      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
};

export default ProfileImageUpload;
