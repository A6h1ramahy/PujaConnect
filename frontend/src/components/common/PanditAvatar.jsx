import React, { useState } from 'react';
import { MdOutlineTempleHindu } from 'react-icons/md';

/**
 * PanditAvatar — displays a Pandit's profile photo.
 *
 * Priority:
 *  1. Cloudinary URL stored in pandit.photo (HTTPS)
 *  2. UI Avatars deterministic fallback (name initials, saffron bg)
 *  3. Icon-based fallback if both above fail (onerror guard)
 *
 * Never produces broken image links.
 */
const PanditAvatar = ({ photo, name = 'P', size = 64, className = '' }) => {
  const [imgError, setImgError] = useState(false);

  const uiAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=F97316&color=ffffff&size=256&bold=true&rounded=false`;

  // Determine which source to use
  const src = photo && !imgError ? photo : (!imgError ? uiAvatarUrl : null);

  const sizeStyle = { width: size, height: size };

  if (!src) {
    // Final icon fallback — shown only if even UI Avatars fails
    return (
      <div
        className={`rounded-2xl overflow-hidden bg-saffron-100 dark:bg-saffron-900/20 flex items-center justify-center shrink-0 ${className}`}
        style={sizeStyle}
      >
        <MdOutlineTempleHindu
          className="text-saffron-400"
          style={{ fontSize: size * 0.5 }}
        />
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl overflow-hidden bg-saffron-100 dark:bg-saffron-900/20 shrink-0 ${className}`}
      style={sizeStyle}
    >
      <img
        src={src}
        alt={name}
        className="w-full h-full object-cover"
        onError={() => {
          if (photo && !imgError) {
            // Cloudinary URL failed — fall through to UI Avatars
            setImgError(true);
          } else {
            // UI Avatars also failed — show icon
            setImgError(true);
          }
        }}
      />
    </div>
  );
};

export default PanditAvatar;
