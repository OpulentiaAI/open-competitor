# YouTube Transcription Feature

## Overview

The Convex agent now includes YouTube transcription capabilities, allowing you to:
- Extract transcripts/captions from YouTube videos
- Get video metadata (title, views, duration, etc.)
- Use transcripts in AI conversations
- Analyze video content programmatically

## Dependencies

```json
{
  "youtube-transcript": "^1.2.1",
  "youtubei.js": "^10.5.0"
}
```

## Usage

### 1. Chat with YouTube Tool Integration

The AI agent can automatically fetch YouTube transcripts when you ask:

```typescript
import { useConvexAgent } from "@/lib/use-convex-agent";

const { chat } = useConvexAgent();

// The agent will automatically use the YouTube tool
await chat("Summarize this video: https://www.youtube.com/watch?v=dQw4w9WgXcQ");
```

### 2. Direct Transcript Fetching

```typescript
import { useConvexAgent } from "@/lib/use-convex-agent";

const { getYouTubeTranscript } = useConvexAgent();

const result = await getYouTubeTranscript(
  "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "en" // optional language code
);

console.log(result.transcript); // Full transcript text
console.log(result.segments); // Number of segments
```

### 3. Get Video Information

```typescript
import { useConvexAgent } from "@/lib/use-convex-agent();

const { getYouTubeInfo } = useConvexAgent();

const info = await getYouTubeInfo("https://www.youtube.com/watch?v=dQw4w9WgXcQ");

console.log(info.title);
console.log(info.author);
console.log(info.viewCount);
console.log(info.duration);
```

## API Reference

### `getYouTubeTranscript(videoUrl, lang?)`

**Parameters:**
- `videoUrl` (string): YouTube video URL or video ID
- `lang` (string, optional): Language code (default: "en")

**Returns:**
```typescript
{
  success: boolean;
  videoId?: string;
  transcript?: string;
  segments?: number;
  language?: string;
  error?: string;
  hint?: string;
}
```

### `getYouTubeInfo(videoUrl)`

**Parameters:**
- `videoUrl` (string): YouTube video URL or video ID

**Returns:**
```typescript
{
  success: boolean;
  videoId?: string;
  title?: string;
  author?: string;
  duration?: number;
  viewCount?: string;
  likeCount?: string;
  description?: string;
  publishDate?: string;
  error?: string;
}
```

## Supported URL Formats

All of these formats work:

```typescript
// Full URL
"https://www.youtube.com/watch?v=dQw4w9WgXcQ"

// Short URL
"https://youtu.be/dQw4w9WgXcQ"

// Embed URL
"https://www.youtube.com/embed/dQw4w9WgXcQ"

// Just the video ID
"dQw4w9WgXcQ"
```

## Language Support

The transcript tool supports any language that YouTube provides captions for:

```typescript
// English (default)
await getYouTubeTranscript(videoUrl, "en");

// Spanish
await getYouTubeTranscript(videoUrl, "es");

// French
await getYouTubeTranscript(videoUrl, "fr");

// Japanese
await getYouTubeTranscript(videoUrl, "ja");
```

## Example Use Cases

### 1. Video Summarization

```typescript
const { chat } = useConvexAgent();

const response = await chat(
  "Summarize the key points from this video: https://www.youtube.com/watch?v=VIDEO_ID"
);
```

### 2. Extract Quotes

```typescript
const { chat } = useConvexAgent();

const response = await chat(
  "Find all the important quotes from this video: https://www.youtube.com/watch?v=VIDEO_ID"
);
```

### 3. Content Analysis

```typescript
const { getYouTubeTranscript } = useConvexAgent();

const result = await getYouTubeTranscript(videoUrl);

if (result.success) {
  // Analyze the transcript
  const wordCount = result.transcript.split(" ").length;
  console.log(`Video contains ${wordCount} words`);
}
```

### 4. Multi-Language Support

```typescript
const { getYouTubeTranscript } = useConvexAgent();

// Get Spanish transcript
const spanish = await getYouTubeTranscript(videoUrl, "es");

// Get English transcript
const english = await getYouTubeTranscript(videoUrl, "en");
```

## Error Handling

```typescript
const { getYouTubeTranscript } = useConvexAgent();

const result = await getYouTubeTranscript(videoUrl);

if (!result.success) {
  console.error(result.error);
  console.log(result.hint); // Helpful hint for fixing the issue
}
```

## Common Errors

**"Video not found"**
- Check that the video URL is correct
- Make sure the video is public and not deleted

**"Transcript not available"**
- The video doesn't have captions/subtitles
- Try a different language code

**"Language not available"**
- The requested language isn't available for this video
- Try "en" or check what languages are available

## Technical Details

### How It Works

1. **URL Parsing**: The tool extracts the video ID from any YouTube URL format
2. **Transcript Fetching**: Uses `youtube-transcript` library to fetch captions
3. **Metadata Fetching**: Uses `youtubei.js` to fetch video information
4. **AI Integration**: Tools are automatically available to the AI agent via the AI SDK

### Convex Configuration

The YouTube packages are configured as external packages in `convex/convex.json`:

```json
{
  "functions": "convex/",
  "node": {
    "externalPackages": [
      "youtube-transcript",
      "youtubei.js"
    ]
  }
}
```

## Limitations

- Only works with public YouTube videos
- Requires videos to have captions/subtitles enabled
- Subject to YouTube's rate limits
- Transcript accuracy depends on YouTube's auto-generated or uploaded captions

## Future Enhancements

Potential improvements:
- [ ] Support for playlists
- [ ] Timestamp-specific transcript extraction
- [ ] Multi-video batch processing
- [ ] Custom transcript formatting options
- [ ] Integration with video search
