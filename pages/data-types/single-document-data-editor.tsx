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

  const config = metadata.dataType as unknown as SingleDocumentTypeConfig;
  const { contentTypes } = config.custom;
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

    console.log("response", response);
    const data = (response as { data: any }).data;

    if (!Array.isArray(data)) {
      throw new Error('Unexpected API response format: "data" is not an array');
    }

    console.log("data", data);
    // Map the content types
    const strapiTypes = data
      .map((item: any) => ({
        uid: item.uid,
        displayName: item.schema?.displayName || "Unknown",
        pluralName: item.schema?.pluralName || "Unknown",
      }))
      .filter((ct: ContentType) => ct.uid && !ct.uid.startsWith("admin::"));

    return strapiTypes;
  }, [getDataResource, apiUrl, apiToken]);

  // Match the provided contentTypes (from config) with the availableContentTypes from Strapi
  if (contentTypes.length === 0 || availableContentTypes.length === 0) {
    return <></>;
  }

  const allowedContentTypes = contentTypes.map((ct) => {
    const found = availableContentTypes
      .filter(
        (name) =>
          !!name && !!name.displayName && !!name.pluralName && !!name.uid
      )
      .find((act) => act.pluralName === ct.pluralTypeName);
    ct.uid = found?.uid;
    return ct;
  });

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

  const transformedContentTypes = allowedContentTypes.map((ct) => {
    return {
      uid: ct.uid,
      displayName: ct.friendlyTypeName,
      singleName: ct.singleTypeName,
      pluralName: ct.pluralTypeName,
      imageField: ct.imageField,
      displayField: ct.displayField,
    };
  });

  return (
    <>
      <DocumentSelector
        getDataResource={getDataResource}
        apiUrl={apiUrl}
        apiToken={apiToken}
        allowedContentTypes={transformedContentTypes}
        documentIds={selectedIds}
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
