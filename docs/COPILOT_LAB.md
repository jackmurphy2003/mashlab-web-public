# Co-Pilot (Lab Mode)

The Co-Pilot (Lab Mode) is an advanced DJ mashup recommendation system that uses Spotify's audio features to find compatible tracks.

## Features

### Unauthenticated State
- Clean landing page with value propositions
- Integrated Spotify OAuth flow
- Responsive design

### Authenticated State
- **3-column responsive layout:**
  - **Left (Inputs)**: Seed selector, blend settings, filters
  - **Middle (Results)**: Recommendations table with quick actions
  - **Right (Session)**: A/B preview deck, session queue, export options

### Key Features
- **Seed Selection**: Search tracks, playlists, or artists as starting points
- **Blend Settings**: Configure BPM range, key compatibility, energy targets
- **Smart Filtering**: Exclude explicit content, filter by release year/popularity
- **Audio Features**: BPM, key, energy, danceability analysis
- **Session Management**: Queue tracks, A/B preview, save to Mashups
- **Export Options**: Save sessions or export CSV data

### Keyboard Shortcuts
- `G` - Generate matches
- `Space` - Toggle preview on focused row
- `A` - Add focused row to queue
- `Cmd/Ctrl + S` - Save session

### Configuration
The system is driven by `/config/copilot.lab.json` which controls:
- Layout and responsive breakpoints
- Panel configurations
- Default settings
- Scoring weights
- UI labels and placeholders

### API Integration
- Stubbed functions for development
- Ready for real Spotify API integration
- Telemetry tracking for analytics
- Error handling and loading states

## Usage

1. Navigate to the Co-Pilot tab
2. Login with Spotify if not authenticated
3. Select a seed (track/playlist/artist)
4. Configure blend settings and filters
5. Generate recommendations
6. Preview tracks and add to queue
7. Save session or export results

## Development

The Co-Pilot is built with:
- **State Management**: Zustand store (`src/state/copilotLab.ts`)
- **API Layer**: Spotify integration (`src/lib/spotifyCoPilot.ts`)
- **Components**: React components in `src/components/copilot/`
- **Configuration**: JSON-driven UI (`public/config/copilot.lab.json`)

## Future Enhancements

- Real-time audio preview
- Advanced key compatibility algorithms
- Machine learning recommendations
- Collaborative session sharing
- Advanced filtering options
- Custom scoring weights
