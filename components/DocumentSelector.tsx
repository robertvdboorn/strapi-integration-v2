import React, { useState, useEffect } from "react";
import { useAsync } from "react-use";
import {
  LoadingOverlay,
  Callout,
  useMeshLocation,
  GetDataResourceLocation,
} from "@uniformdev/mesh-sdk-react";
import { VerticalRhythm } from "@uniformdev/design-system";

interface ContentType {
  uid: string;
  displayName: string;
  imageField: string;
  singleName: string;
  pluralName: string;
}

interface DocumentSelectorProps {
  getDataResource?: GetDataResourceLocation["getDataResource"];
  apiUrl: string;
  apiToken: string;
  allowedContentTypes: {
    uid: string;
    displayName: string;
    singleName: string;
    pluralName: string;
    imageField?: string;
    displayField?: string;
  }[];
  documentIds?: string[];
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
  documentIds,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const { setValue } = useMeshLocation("dataResource");
  const [allEntries, setAllEntries] = useState<StrapiEntry[]>([]);
  const [isEntriesLoading, setIsEntriesLoading] = useState(false);

  useEffect(() => {
    if (allowedContentTypes.length === 1) {
      setSelectedIndex(0);
    }
  }, [allowedContentTypes]);

  const selectedContentType =
    selectedIndex !== null
      ? allowedContentTypes[selectedIndex]
      : {
          uid: "",
          displayName: "",
          singleName: "",
          pluralName: "",
          imageField: "",
          displayField: "",
        };
  const selectedEntry =
    selectedIndex !== null
      ? allowedContentTypes
        ? allowedContentTypes[selectedIndex]
        : {
            uid: "",
            displayName: "",
            singleName: "",
            pluralName: "",
            imageField: "",
            displayField: "",
          }
      : {
          uid: "",
          displayName: "",
          pluralName: "",
          imageField: "",
          displayField: "",
        };

  // Fetch all entries based on the selected content type
  const fetchAllEntries = async (
    pluralName: string
  ): Promise<StrapiEntry[]> => {
    if (!getDataResource) return [];
    setIsEntriesLoading(true);

    let allEntries: StrapiEntry[] = [];
    let currentPage = 1;
    let hasMorePages = true;

    while (hasMorePages) {
      const response: {
        data?: StrapiEntry[];
        meta?: { pagination: PaginationInfo };
      } = await getDataResource({
        headers: [
          {
            key: "Authorization",
            value: `Bearer ${apiToken}`,
          },
        ],
        path: `/${pluralName}?populate=*&pagination[page]=${currentPage}&pagination[pageSize]=100`,
        method: "GET" as const,
      });

      if (!response?.data) {
        setIsEntriesLoading(false);
        throw new Error(
          "Failed to fetch entries or unexpected response structure"
        );
      }

      allEntries = [...allEntries, ...response.data];

      if (response.meta?.pagination) {
        hasMorePages = currentPage < response.meta.pagination.pageCount;
        currentPage++;
      } else {
        hasMorePages = false;
      }
    }

    setIsEntriesLoading(false);
    return allEntries;
  };

  const {
    value: availableContentTypes = [],
    loading: loadingContentTypes,
    error: errorContentTypes,
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
      method: "GET",
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
        displayName: item.schema?.displayName || "Unknown",
        pluralName: item.schema?.pluralName || "Unknown",
      }))
      .filter((ct: ContentType) => ct.uid && !ct.uid.startsWith("admin::"));

    return contentTypes;
  }, [getDataResource, apiUrl, apiToken]);

  // Fetch entries when selectedEntry changes
  useEffect(() => {
    const loadEntries = async () => {
      if (!selectedEntry || !selectedEntry.pluralName) return;
      if (selectedEntry.pluralName.length < 1) return;
      console.log("Fetching entries for", selectedEntry.pluralName);
      const entries = await fetchAllEntries(selectedEntry.pluralName);
      setAllEntries(entries);
    };

    loadEntries().catch((err) => {
      console.error(err);
    });
  }, [selectedIndex]);

  const handleEntrySelection = (entry: StrapiEntry) => {
    console.log("Selected entry", entry);
    console.log("Selected content type", selectedContentType);
    setValue((current) => {
      return {
        ...current,
        newValue: {
          id: entry.documentId,
          contentTypePluralName: selectedContentType.pluralName,
        },
      };
    });
  };

  const getEditLink = (uid: string, id: string) => {
    const contentTypeIds = availableContentTypes.filter(
      (ct) => ct && ct.uid && ct.uid.length > 0 && ct.uid === uid
    );

    if (contentTypeIds.length === 0) {
      return "";
    }

    return `${apiUrl.replace(
      "/api",
      ""
    )}/admin/content-manager/collection-types/${contentTypeIds[0].uid}/${id}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (loadingContentTypes) {
    return <LoadingOverlay isActive />;
  }

  if (errorContentTypes) {
    return (
      <VerticalRhythm>
        <Callout type="error">
          {errorContentTypes?.message ?? "An unknown error occurred"}
        </Callout>
      </VerticalRhythm>
    );
  }

  return (
    <VerticalRhythm>
      {allowedContentTypes.length > 1 && (
        <div style={{ marginBottom: "15px" }}>
          <label
            htmlFor="content-type-select"
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}
          >
            Select a content type:
          </label>
          <div style={{ position: "relative" }}>
            <select
              id="content-type-select"
              onChange={(e) => setSelectedIndex(Number(e.target.value))}
              value={selectedIndex ?? ""}
              style={{
                width: "100%",
                padding: "10px 40px 10px 10px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                backgroundColor: "#fff",
                fontSize: "0.9em",
                color: "#333",
                appearance: "none",
                backgroundImage:
                  'url("data:image/svg+xml,%3Csvg%20width%3D%2210%22%20height%3D%226%22%20viewBox%3D%220%200%2010%206%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M0.763672%200.613281C0.436523%200.942708%200.436523%201.46094%200.763672%201.78906L4.61328%205.63672C4.94043%205.96484%205.45898%205.96484%205.78613%205.63672L9.63672%201.78906C9.96387%201.46094%209.96387%200.942708%209.63672%200.613281C9.30957%200.285156%208.79102%200.285156%208.46387%200.613281L5.2%203.87695L1.93652%200.613281C1.60938%200.285156%201.09082%200.285156%200.763672%200.613281Z%22%20fill%3D%22%23777777%22/%3E%3C/svg%3E")',
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 10px center",
                backgroundSize: "10px 6px",
                cursor: "pointer",
                transition: "border-color 0.2s ease",
              }}
            >
              <option value="">Select a content type</option>
              {allowedContentTypes?.map((entryType, index) => (
                <option
                  key={allowedContentTypes[index].displayName}
                  value={index}
                >
                  {entryType.displayName}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
      {selectedIndex !== null && selectedEntry && selectedEntry.pluralName && (
        <div
          style={{
            maxHeight: "360px",
            overflowY: "auto",
            border: "1px solid #ccc",
            borderRadius: "4px",
            padding: "8px",
            position: "relative",
          }}
        >
          {isEntriesLoading ? (
            <div
              style={{
                display: "flex",
                height: "100%",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                className="spinner"
                style={{
                  width: "30px",
                  height: "30px",
                  border: "4px solid #ccc",
                  borderTop: "4px solid #007BFF",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              />
            </div>
          ) : (
            allEntries.map((entry) => (
              <div
                key={entry.documentId}
                style={{
                  padding: "10px",
                  border: documentIds?.includes(entry.documentId)
                    ? "1px solid #007BFF"
                    : "1px solid transparent",
                  borderRadius: "4px",
                  backgroundColor: documentIds?.includes(entry.documentId)
                    ? "#F0F8FF"
                    : "#FFFFFF",
                  marginBottom: "8px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div
                  onClick={() => handleEntrySelection(entry)}
                  style={{
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    flex: 1,
                  }}
                >
                  {selectedEntry.imageField &&
                    entry[selectedEntry.imageField] && (
                      <img
                        src={entry[selectedEntry.imageField]?.url}
                        alt={entry[selectedEntry.displayField] || "Entry image"}
                        width={50}
                        height={50}
                        style={{ marginRight: "10px", borderRadius: "4px" }}
                      />
                    )}
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span>
                      {entry[selectedEntry.displayField] || "Untitled"}
                    </span>
                    <span style={{ fontSize: "0.75em", color: "#666" }}>
                      Last published: {formatDate(entry.publishedAt)}
                    </span>
                    <span style={{ fontSize: "0.75em", color: "#666" }}>
                      Document ID: {entry.documentId}
                    </span>
                  </div>
                </div>
                <a
                  href={getEditLink(selectedContentType.uid, entry.documentId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#007BFF",
                    textDecoration: "none",
                    fontWeight: "bold",
                    marginLeft: "10px",
                  }}
                >
                  Edit
                </a>
              </div>
            ))
          )}
        </div>
      )}

      {/* Simple inline CSS for spinner animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </VerticalRhythm>
  );
};
