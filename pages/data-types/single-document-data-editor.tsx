import React from 'react';
import {
  useMeshLocation,
  DataResourceDynamicInputProvider,
  Callout,
  LoadingOverlay,
} from '@uniformdev/mesh-sdk-react';

import { SingleDocumentTypeConfig } from '../../components/SingleDocumentTypeEditor';
import { DocumentSelector } from '../../components/DocumentSelector';
import { DataSourceCustomPublicConfig } from '../data-connection-editor';
// Removed the import of useGetAvailableContentTypes
// import { useGetAvailableContentTypes } from '../../hooks/useGetAvailableContentTypes';
import { ErrorCallout } from '../../components/ErrorCallout';
import { useAsync } from 'react-use';

const DataEditorInner: React.FC = () => {
  const { value, metadata, getDataResource } = useMeshLocation<'dataResource'>();

  interface ContentType {
    uid: string;
    displayName: string;
    pluralName: string;
  }

  const { apiUrl = '', apiToken = '' } = (metadata.dataSource.customPublic ??
    {}) as Partial<DataSourceCustomPublicConfig>;

  const {
    allowedContentTypes = [],
    displayField = 'title',
    imageField,
  } = (metadata.dataType.custom as unknown as SingleDocumentTypeConfig) || {};

  const id = value.id;

  // Inline the logic of useGetAvailableContentTypes
  const {
    value: availableContentTypes = [],
    loading: loadingAvailableContentTypes,
    error: availableContentTypesError,
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
      method: 'GET' as const,
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

  const selectedIds = id ? [id] : [];

  const allowedContentTypesNames =
    allowedContentTypes.length > 0
      ? allowedContentTypes.map((allowed) => {
          // Adjust matching to handle UID structure differences
          const match = availableContentTypes.find((ct) => ct.uid.endsWith(`.${allowed}`));
          return match?.pluralName || match?.displayName || 'Unknown';
        })
      : availableContentTypes.map((ct) => ct.pluralName || ct.displayName || 'Unknown');

  if (loadingAvailableContentTypes) {
    return <LoadingOverlay isActive />;
  }

  if (!apiUrl || !apiToken) {
    return <Callout type="error">Strapi API is not configured</Callout>;
  }

  if (availableContentTypesError) {
    return <ErrorCallout error={availableContentTypesError.message} />;
  }

  return (
    <>
      <DocumentSelector
        getDataResource={getDataResource}
        apiUrl={apiUrl}
        apiToken={apiToken}
        allowedContentTypes={
          allowedContentTypes.length ? allowedContentTypes : availableContentTypes.map((ct) => ct.uid)
        }
        allowedContentTypesNames={allowedContentTypesNames}
        documentIds={selectedIds}
        multiSelect={false}
        displayField={displayField}
        imageField={imageField}
        selectedIds={[]}
      />
    </>
  );
};

const SingleDocumentDataEditorPage: React.FC = () => {
  return (
    <DataResourceDynamicInputProvider>
      <DataEditorInner />
    </DataResourceDynamicInputProvider>
  );
};

export default SingleDocumentDataEditorPage;
