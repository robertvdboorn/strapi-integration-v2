import React from "react";
import {
  useMeshLocation,
  DataResourceDynamicInputProvider,
  Callout,
  LoadingOverlay,
} from "@uniformdev/mesh-sdk-react";

import { SingleDocumentTypeConfig } from "../../types/strapi";
import { DocumentSelector } from "../../components/DocumentSelector";
import { DataSourceCustomPublicConfig } from "../data-connection-editor";
import { ErrorCallout } from "../../components/ErrorCallout";
import { useAsync } from "react-use";

const DataEditorInner: React.FC = () => {
  const { value, metadata, getDataResource } =
    useMeshLocation<"dataResource">();

  interface ContentType {
    uid: string;
    displayName: string;
    pluralName: string;
  }

  const { apiUrl = "", apiToken = "" } = (metadata.dataSource.customPublic ??
    {}) as Partial<DataSourceCustomPublicConfig>;

  const {
    contentTypes = "[]",
    displayField = "title",
    imageField,
  } = (metadata.dataType.custom as unknown as SingleDocumentTypeConfig) || {};

  // Parse the JSON string for contentTypes
  let parsedContentTypes: { single: string; plural: string }[] = [];
  try {
    parsedContentTypes = JSON.parse(contentTypes);
    if (!Array.isArray(parsedContentTypes)) {
      parsedContentTypes = [];
      console.error("contentTypes is not a valid JSON array");
    }
  } catch (error) {
    console.error("Failed to parse contentTypes JSON:", error);
    parsedContentTypes = [];
  }

  const id = value.id;

  const {
    value: availableContentTypes = [],
    loading: loadingAvailableContentTypes,
    error: availableContentTypesError,
  } = useAsync(async () => {
    if (!apiUrl || !apiToken) {
      throw new Error("Strapi API configuration is missing");
    }

    if (!getDataResource) {
      return [];
    }

    const response = await getDataResource({
      headers: [
        {
          key: "Authorization",
          value: `Bearer ${apiToken}`,
        },
      ],
      path: "/content-type-builder/content-types",
      method: "GET" as const,
    });

    const data = (response as { data: any }).data;

    if (!Array.isArray(data)) {
      throw new Error('Unexpected API response format: "data" is not an array');
    }

    // Map the content types
    const contentTypes = data
      .map((item: any) => ({
        uid: item.uid,
        displayName: item.schema?.displayName || "Unknown",
        pluralName: item.schema?.pluralName || "Unknown",
      }))
      .filter((ct: ContentType) => ct.uid && !ct.uid.startsWith("admin::"));

    return contentTypes;
  }, [getDataResource, apiUrl, apiToken]);

  // Match the provided contentTypes (from config) with the availableContentTypes from Strapi
  const allowedContentTypesUids = parsedContentTypes
    .map((ct) => {
      const found = availableContentTypes.find(
        (act) => act.pluralName === ct.plural
      );
      return found?.uid;
    })
    .filter((uid): uid is string => !!uid);

  const allowedContentTypesNames = parsedContentTypes
    .map((ct) => {
      const found = availableContentTypes.find(
        (act) => act.pluralName === ct.plural
      );
      return found;
    })
    .filter(
      (name) => !!name && !!name.displayName && !!name.pluralName && !!name.uid
    );
  const selectedIds = id ? [id] : [];

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
        // Use the matched UIDs (allowedContentTypesUids) to restrict which docs can be selected
        allowedContentTypes={allowedContentTypesUids}
        // Provide human-friendly plural names for display (allowedContentTypesNames)
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
