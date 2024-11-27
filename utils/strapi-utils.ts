import { StrapiContentType, StrapiEntry } from '../types/strapi';

export async function fetchStrapiContentTypes(
  apiUrl: string,
  apiToken: string
): Promise<StrapiContentType[]> {
  const response = await fetch(`${apiUrl}/content-type-builder/content-types`, {
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
  });
  if (!response.ok) throw new Error('Failed to fetch Strapi content types');
  return response.json();
}

export async function fetchStrapiEntries(
  apiUrl: string,
  apiToken: string,
  contentType: string
): Promise<StrapiEntry[]> {
  const response = await fetch(`${apiUrl}/content-type-builder/collection-types/${contentType}`, {
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
  });
  if (!response.ok) throw new Error(`Failed to fetch Strapi entries for ${contentType}`);
  return response.json();
}
