import React from 'react';
import { useLibraryStore } from '../store/library';

interface CollectionCoverProps {
  collectionId: string;
  size?: 'small' | 'medium' | 'large' | 'full';
  className?: string;
}

export default function CollectionCover({ collectionId, size = 'medium', className = '' }: CollectionCoverProps) {
  const { collections, libraryById } = useLibraryStore();
  const collection = collections[collectionId];
  
  if (!collection) return null;

  // Size configurations
  const sizeConfig = {
    small: { container: 'w-8 h-8', image: 'w-4 h-4' },
    medium: { container: 'w-12 h-12', image: 'w-6 h-6' },
    large: { container: 'w-32 h-32', image: 'w-16 h-16' },
    full: { container: 'w-full h-full', image: 'w-full h-full' }
  } as const;

  const config = sizeConfig[size];

  // If custom cover image is set, show it
  if (collection.coverImage && collection.coverImage.trim() !== '') {
    return (
      <div className={`${config.container} rounded-lg overflow-hidden ${className}`}>
        <img 
          src={collection.coverImage} 
          alt={`${collection.name} cover`}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // Get first 4 tracks from collection
  const tracks = collection.trackIds
    .map(id => libraryById[id])
    .filter(Boolean)
    .slice(0, 4);

  // If no tracks, show placeholder
  if (tracks.length === 0) {
    return (
      <div className={`${config.container} rounded-lg bg-gray-600 flex items-center justify-center ${className}`}>
        <div className="text-white text-xs font-bold">?</div>
      </div>
    );
  }

  // If only 1 track, show full cover
  if (tracks.length === 1) {
    const coverUrl = tracks[0].cover_url || "https://placehold.co/100x100/png";
    return (
      <div className={`${config.container} rounded-lg overflow-hidden ${className}`}>
        <img 
          src={coverUrl} 
          alt={`${tracks[0].name} cover`}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // Create 2x2 grid for 2-4 tracks
  return (
    <div className={`${config.container} rounded-lg overflow-hidden grid grid-cols-2 ${className}`}>
      {tracks.map((track, index) => {
        const coverUrl = track.cover_url || "https://placehold.co/100x100/png";
        return (
          <img
            key={track.spotify_id}
            src={coverUrl}
            alt={`${track.name} cover`}
            className={`${size === 'full' ? 'w-full h-full' : config.image} object-cover`}
          />
        );
      })}
      {/* Fill empty slots if less than 4 tracks */}
      {tracks.length < 4 && (
        <>
          {Array.from({ length: 4 - tracks.length }).map((_, index) => (
            <div key={`empty-${index}`} className={`${size === 'full' ? 'w-full h-full' : config.image} bg-gray-600`} />
          ))}
        </>
      )}
    </div>
  );
}
