const SITE_ORIGIN = 'https://futurestudiovn.com';
const DEFAULT_IMAGE = `${SITE_ORIGIN}/images/logo.jpg`;

interface SeoMetadata {
  title: string;
  description: string;
  path: string;
  image?: string;
  robots?: string;
}

const setNamedMeta = (name: string, content: string) => {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.name = name;
    document.head.appendChild(element);
  }
  element.content = content;
};

const setPropertyMeta = (property: string, content: string) => {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('property', property);
    document.head.appendChild(element);
  }
  element.content = content;
};

export const getAbsoluteMediaUrl = (value?: string): string => {
  if (!value) return DEFAULT_IMAGE;
  const youtubeId = value.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/i)?.[1];
  if (youtubeId) return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
  try {
    return new URL(value, SITE_ORIGIN).href;
  } catch {
    return DEFAULT_IMAGE;
  }
};

export const applySeoMetadata = ({ title, description, path, image = DEFAULT_IMAGE, robots = 'index, follow' }: SeoMetadata) => {
  const canonicalUrl = new URL(path, SITE_ORIGIN).href;
  document.title = title;
  setNamedMeta('description', description);
  setNamedMeta('robots', robots);
  setNamedMeta('twitter:title', title);
  setNamedMeta('twitter:description', description);
  setNamedMeta('twitter:image', image);
  setPropertyMeta('og:title', title);
  setPropertyMeta('og:description', description);
  setPropertyMeta('og:url', canonicalUrl);
  setPropertyMeta('og:image', image);
  const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]') ?? document.createElement('link');
  canonical.rel = 'canonical';
  canonical.href = canonicalUrl;
  if (!canonical.parentNode) document.head.appendChild(canonical);
};
