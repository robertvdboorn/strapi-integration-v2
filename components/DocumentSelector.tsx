import React, { useState, useEffect } from 'react';
import { useAsync } from 'react-use';
import {
  LoadingOverlay,
  Callout,
  useMeshLocation,
  GetDataResourceLocation,
} from '@uniformdev/mesh-sdk-react';
import { VerticalRhythm } from '@uniformdev/design-system';

interface ContentType {
  uid: string;
  displayName: string;
  pluralName: string;
}

interface DocumentSelectorProps {
  getDataResource?: GetDataResourceLocation['getDataResource'];
  apiUrl: string;
  apiToken: string;
  allowedContentTypes: string[];
  allowedContentTypesNames?: string[];
  documentIds?: string[];
  multiSelect: boolean;
  displayField: string;
  imageField?: string;
  selectedIds: number[];
}

interface StrapiEntry {
  id: string;
  documentId: string;
  publishedAt: string;
  [key: string]: any;
}

interface PaginationInfo {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export const DocumentSelector: React.FC<DocumentSelectorProps> = ({
  getDataResource,
  apiUrl,
  apiToken,
  allowedContentTypes,
  allowedContentTypesNames,
  documentIds,
  displayField,
  imageField,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const { setValue } = useMeshLocation('dataResource');
  const [allEntries, setAllEntries] = useState<StrapiEntry[]>([]);

  useEffect(() => {
    if (allowedContentTypes.length === 1) {
      setSelectedIndex(0);
    }
  }, [allowedContentTypes]);

  const selectedContentType = selectedIndex !== null ? allowedContentTypes[selectedIndex] : '';
  const selectedPluralName =
    selectedIndex !== null ? (allowedContentTypesNames ? allowedContentTypesNames[selectedIndex] : '') : '';

  // Fetch all entries based on the selected content type
  const fetchAllEntries = async (pluralName: string): Promise<StrapiEntry[]> => {
    if (!getDataResource) return [];

    let allEntries: StrapiEntry[] = [];
    let currentPage = 1;
    let hasMorePages = true;

    while (hasMorePages) {
      const response: { data?: StrapiEntry[]; meta?: { pagination: PaginationInfo } } = await getDataResource({
        headers: [
          {
            key: 'Authorization',
            value: `Bearer ${apiToken}`,
          },
        ],
        path: `/${pluralName}?populate=*&pagination[page]=${currentPage}&pagination[pageSize]=100`,
        method: 'GET' as const,
      });

      if (!response?.data) {
        throw new Error('Failed to fetch entries or unexpected response structure');
      }

      allEntries = [...allEntries, ...response.data];

      if (response.meta?.pagination) {
        hasMorePages = currentPage < response.meta.pagination.pageCount;
        currentPage++;
      } else {
        hasMorePages = false;
      }
    }

    return allEntries;
  };

  const {
    loading: loadingEntries,
    error: errorEntries,
  } = useAsync(async () => {
    if (!selectedPluralName) return;

    const entries = await fetchAllEntries(selectedPluralName);
    setAllEntries(entries);
  }, [getDataResource, apiToken, selectedPluralName]);

  // Fetch available content types directly within the component
  const {
    value: availableContentTypes = [],
    loading: loadingContentTypes,
    error: errorContentTypes,
  } = useAsync(async () => {
    if (!apiUrl || !apiToken) {
      throw new Error('Strapi API configuration is missing');
    }

    if (!getDataResource) {
      return [];
    }

    const response = await getDataResource({
      headers: [
        {
          key: 'Authorization',
          value: `Bearer ${apiToken}`,
        },
      ],
      path: '/content-type-builder/content-types',
      method: 'GET',
    });

    const data = (response as { data: any }).data;

    // Validate that "data" is an array
    if (!Array.isArray(data)) {
      throw new Error('Unexpected API response format: "data" is not an array');
    }

    // Map the content types to include pluralName
    const contentTypes = data
      .map((item: any) => ({
        uid: item.uid,
        displayName: item.schema?.displayName || 'Unknown',
        pluralName: item.schema?.pluralName || 'Unknown',
      }))
      .filter((ct: ContentType) => ct.uid && !ct.uid.startsWith('admin::'));

    return contentTypes;
  }, [getDataResource, apiUrl, apiToken]);

  const handleEntrySelection = (entry: StrapiEntry) => {
    setValue((current) => ({
      ...current,
      newValue: {
        id: entry.documentId,
      },
    }));
  };

  const getEditLink = (uid: string, id: string) => {
    const contentTypeIds = availableContentTypes.filter((ct) => ct.uid.endsWith(`.${uid}`));
    if (contentTypeIds.length === 0) {
      return '';
    }

    return `${apiUrl.replace('/api', '')}/admin/content-manager/collection-types/${
      contentTypeIds[0].uid
    }/${id}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (loadingEntries || loadingContentTypes) {
    return <LoadingOverlay isActive />;
  }

  if (errorEntries || errorContentTypes) {
    return (
      <VerticalRhythm>
        <Callout type="error">
          {errorEntries?.message ?? errorContentTypes?.message ?? 'An unknown error occurred'}
        </Callout>
      </VerticalRhythm>
    );
  }

  return (
    <VerticalRhythm>
      {allowedContentTypes.length > 1 && (
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="content-type-select" style={{ display: 'block', marginBottom: '5px' }}>
            Select a content type:
          </label>
          <select
            id="content-type-select"
            onChange={(e) => setSelectedIndex(Number(e.target.value))}
            value={selectedIndex ?? ''}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
            }}
          >
            <option value="">Select a content type</option>
            {allowedContentTypesNames?.map((name, index) => (
              <option key={allowedContentTypes[index]} value={index}>
                {name
                  .split(' ')
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ')}
              </option>
            ))}
          </select>
        </div>
      )}

      <div
        style={{
          maxHeight: '360px',
          overflowY: 'auto',
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: '8px',
        }}
      >
        {allEntries.map((entry) => (
          <div
            key={entry.documentId}
            style={{
              padding: '10px',
              border: documentIds?.includes(entry.documentId) ? '1px solid #007BFF' : '1px solid transparent',
              borderRadius: '4px',
              backgroundColor: documentIds?.includes(entry.documentId) ? '#F0F8FF' : '#FFFFFF',
              marginBottom: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div
              onClick={() => handleEntrySelection(entry)}
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                flex: 1,
              }}
            >
              {imageField && entry[imageField] && (
                <img
                  src={entry[imageField]?.url}
                  alt={entry[displayField] || 'Entry image'}
                  width={50}
                  height={50}
                  style={{ marginRight: '10px', borderRadius: '4px' }}
                />
              )}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span>{entry[displayField] || 'Untitled'}</span>
                <span style={{ fontSize: '0.75em', color: '#666' }}>
                  Last published: {formatDate(entry.publishedAt)}
                </span>
                <span style={{ fontSize: '0.75em', color: '#666' }}>Document ID: {entry.documentId}</span>
              </div>
            </div>
            <a
              href={getEditLink(selectedContentType, entry.documentId)}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#007BFF',
                textDecoration: 'none',
                fontWeight: 'bold',
                marginLeft: '10px',
              }}
            >
              Edit
            </a>
          </div>
        ))}
      </div>
    </VerticalRhythm>
  );
};
