import React from 'react';
import { useMashups } from '../../store/mashups';
import { useLibraryStore } from '../../store/library';
import CollectionCover from '../CollectionCover';

interface PlaylistSelectorProps {
  selectedPlaylistIds: string[];
  onPlaylistChange: (ids: string[]) => void;
}

function PlaylistSelector({ selectedPlaylistIds, onPlaylistChange }: PlaylistSelectorProps) {
  const [playlists, setPlaylists] = React.useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const fetchPlaylists = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/spotify/me/playlists');
        if (response.ok) {
          const data = await response.json();
          setPlaylists(data.items || []);
        }
      } catch (error) {
        console.error('Failed to fetch playlists:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, []);

  const handlePlaylistToggle = (playlistId: string) => {
    if (selectedPlaylistIds.includes(playlistId)) {
      onPlaylistChange(selectedPlaylistIds.filter(id => id !== playlistId));
    } else {
      onPlaylistChange([...selectedPlaylistIds, playlistId]);
    }
  };

  if (loading) {
    return <div className="text-sm" style={{ color: colors.muted2 }}>Loading playlists...</div>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {playlists.map((playlist) => {
        const isSelected = selectedPlaylistIds.includes(playlist.id);
        
        return (
          <button
            key={playlist.id}
            onClick={() => handlePlaylistToggle(playlist.id)}
            className={isSelected ? pillSolid : pillDefault}
          >
            {playlist.name}
          </button>
        );
      })}
    </div>
  );
}

const colors = {
  text: "#E8EDFF",
  muted: "#96A0C2",
  muted2: "#6F7BA6",
  pillBorder: "#8A7CFF",
  pillBg: "rgba(138,124,255,0.12)",
  pillSolid: "#8A7CFF",
  pillSolidText: "#0B0F22",
  inputBg: "#0F1836",
  inputBorder: "#222C55",
};

const pillBase = "h-8 px-3 rounded-full border transition text-sm";
const pillDefault = `${pillBase} border-[#8A7CFF] bg-[rgba(138,124,255,0.12)] text-[#E8EDFF] hover:brightness-110`;
const pillSolid = `${pillBase} border-[#8A7CFF] bg-[#8A7CFF] text-[#0B0F22]`;

export default function SourceSelector() {
  const { source, setSource, selectedCollectionIds, setCollections, selectedPlaylistIds, setPlaylists } = useMashups();
  const { collections, collectionOrder, libraryOrder, clearCollections } = useLibraryStore();

  // Clear collections if library is empty
  React.useEffect(() => {
    if (libraryOrder.length === 0 && Object.keys(collections).length > 0) {
      clearCollections();
    }
  }, [libraryOrder.length, collections, clearCollections]);

  const sources: Array<{ id: string; label: string; comingSoon?: boolean }> = [
    { id: 'library', label: 'Library' },
    { id: 'collections', label: 'Collections' },
    { id: 'playlists', label: 'My Playlists', comingSoon: true },
    { id: 'spotify', label: 'All Spotify', comingSoon: true }
  ];

  return (
    <div className="flex flex-col">
      {/* Source Segmented Control */}
      <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: colors.inputBorder }}>
        {sources.map((src) => (
          <button
            key={src.id}
            onClick={() => !src.comingSoon && setSource(src.id as 'library' | 'collections' | 'playlists' | 'spotify')}
            disabled={src.comingSoon}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              src.comingSoon
                ? 'text-gray-500 cursor-not-allowed'
                : source === src.id
                ? 'text-white'
                : 'text-gray-400 hover:text-white'
            }`}
            style={{
              background: source === src.id ? colors.pillSolid : 'transparent'
            }}
          >
            {src.comingSoon ? `${src.label} - Coming Soon!` : src.label}
          </button>
        ))}
      </div>

      {/* Collection Selector */}
      {source === 'collections' && (
        <div className="mt-3">
          <div className="flex flex-wrap gap-2">
            {collectionOrder.map((id) => {
              const collection = collections[id];
              if (!collection) return null;
              
              const isSelected = selectedCollectionIds.includes(id);
              
              return (
                <button
                  key={id}
                  onClick={() => {
                    if (isSelected) {
                      setCollections(selectedCollectionIds.filter(cid => cid !== id));
                    } else {
                      setCollections([...selectedCollectionIds, id]);
                    }
                  }}
                  className={`${isSelected ? pillSolid : pillDefault} flex items-center gap-2`}
                >
                  <CollectionCover collectionId={id} size="small" />
                  {collection.name} ({collection.trackIds.length})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Playlist Selector */}
      {source === 'playlists' && (
        <div className="mt-3">
          <PlaylistSelector 
            selectedPlaylistIds={selectedPlaylistIds}
            onPlaylistChange={setPlaylists}
          />
        </div>
      )}
    </div>
  );
}
