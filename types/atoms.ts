export type AtomType = 'text' | 'image' | 'video' | 'quote';

export interface TextContent {
  html: string;
  plainText: string;
}

export interface ImageContent {
  url: string;
  alt: string;
  caption?: string;
  storageKey?: string;
}

export interface VideoContent {
  provider: 'youtube' | 'vimeo' | 'twitter' | 'direct';
  embedId?: string;
  url: string;
  thumbnail?: string;
}

export interface QuoteContent {
  text: string;
  attribution?: string;
  sourceUrl?: string;
}

export type RichContent = TextContent | ImageContent | VideoContent | QuoteContent;

export interface LinkedStory {
  id: string;
  title: string;
}

export interface RelatedStory {
  story_id: string;
  title: string;
  image_url?: string;
}

export interface Atom {
  id: string;
  story_id: string;
  type: AtomType;
  content: string;
  rich_content: RichContent;
  is_published: boolean;
  send_push: boolean;
  source_url?: string;
  source_title?: string;
  position: number;
  created_at: string;
  updated_at: string;
  linked_atom_id?: string;
  linked_atom?: {
    id: string;
    story_id: string;
    stories?: LinkedStory;
  };
  relatedStories?: RelatedStory[];
}

export interface Story {
  id: string;
  title: string;
  summary: string | null;
  category: string | null;
  image_url?: string;
  image_credit?: string;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
}

// Helper type guards
export function isTextContent(content: RichContent): content is TextContent {
  return 'html' in content && 'plainText' in content;
}

export function isImageContent(content: RichContent): content is ImageContent {
  return 'url' in content && 'alt' in content && !('provider' in content);
}

export function isVideoContent(content: RichContent): content is VideoContent {
  return 'provider' in content && 'url' in content;
}

export function isQuoteContent(content: RichContent): content is QuoteContent {
  return 'text' in content && !('html' in content);
}
