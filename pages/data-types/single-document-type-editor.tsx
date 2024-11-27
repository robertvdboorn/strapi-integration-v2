import React, { useState, useRef } from "react";
import { useMeshLocation } from "@uniformdev/mesh-sdk-react";
import { VerticalRhythm, Input, Button } from "@uniformdev/design-system";
import {
  ContentTypeConfig,
  SingleDocumentTypeConfig,
} from "../../types/strapi";

const arrowIcon = (
  <svg
    stroke="currentColor"
    fill="none"
    strokeWidth="0"
    viewBox="0 0 24 24"
    role="img"
    height="18"
    width="18"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7.75739 10.5858L9.1716 9.17154L12 12L14.8284 9.17157L16.2426 10.5858L12 14.8284L7.75739 10.5858Z"
      fill="currentColor"
    ></path>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M1 5C1 2.79086 2.79086 1 5 1H19C21.2091 1 23 2.79086 23 5V19C23 21.2091 21.2091 23 19 23H5C2.79086 23 1 21.2091 1 19V5ZM5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3Z"
      fill="currentColor"
    ></path>
  </svg>
);

const SingleDocumentTypeEditorPage: React.FC = () => {
  const { value, setValue } = useMeshLocation<
    "dataType",
    SingleDocumentTypeConfig
  >();

  const contentTypes =
    (value.custom?.contentTypes as ContentTypeConfig[]) ?? [];

  // State for new content type fields
  const [newFriendlyTypeName, setNewFriendlyTypeName] = useState("");
  const [newSingleTypeName, setNewSingleTypeName] = useState("");
  const [newPluralTypeName, setNewPluralTypeName] = useState("");
  const [newDisplayField, setNewDisplayField] = useState("");
  const [newImageField, setNewImageField] = useState("");

  const newContentTypeRef = useRef<HTMLDetailsElement>(null);

  // Track which accordions are open
  const [openStates, setOpenStates] = useState<boolean[]>(() =>
    new Array(contentTypes.length + 1).fill(false)
  );

  const updateContentTypes = (updatedContentTypes: ContentTypeConfig[]) => {
    setValue((current) => ({
      newValue: {
        ...current,
        custom: {
          ...current.custom,
          contentTypes: updatedContentTypes,
        },
        path: `/\${contentTypePluralName}/\${id}?populate=*`,
        variables: {
          id: {
            displayName: "Document ID",
            type: "string",
            helpText: "The ID of the document to display",
            default: "unspecified",
            order: 1,
            source: "query",
          },
          contentTypePluralName: {
            displayName: "Content Type Plural Name",
            type: "string",
            helpText: "The plural name of the content type",
            default: "unspecified",
            order: 2,
            source: "query",
          },
        },
      },
    }));
  };

  const updateContentTypeField = (
    index: number,
    field: keyof ContentTypeConfig,
    newValue: string
  ) => {
    const updated = [...contentTypes];
    updated[index] = {
      ...updated[index],
      [field]: newValue,
    };
    updateContentTypes(updated);
  };

  const removeContentType = (index: number) => {
    const updated = [...contentTypes];
    updated.splice(index, 1);
    updateContentTypes(updated);
    // Also remove open state
    setOpenStates((prev) => {
      const copy = [...prev];
      copy.splice(index, 1);
      return copy;
    });
  };

  const handleAddNewContentType = () => {
    const updated = [
      ...contentTypes,
      {
        friendlyTypeName: newFriendlyTypeName,
        singleTypeName: newSingleTypeName,
        pluralTypeName: newPluralTypeName,
        displayField: newDisplayField || undefined,
        imageField: newImageField || undefined,
      },
    ];
    updateContentTypes(updated);

    // Reset fields
    setNewFriendlyTypeName("");
    setNewSingleTypeName("");
    setNewPluralTypeName("");
    setNewDisplayField("");
    setNewImageField("");

    // Close the add new content type accordion and update openStates
    if (newContentTypeRef.current) {
      newContentTypeRef.current.open = false;
    }
    setOpenStates((prev) => {
      const copy = [...prev];
      // last one corresponds to the "Add new" section
      copy[contentTypes.length] = false;
      return copy;
    });
  };

  const handleToggle = (
    index: number,
    e: React.SyntheticEvent<HTMLDetailsElement>
  ) => {
    const details = e.currentTarget;
    setOpenStates((prev) => {
      const copy = [...prev];
      copy[index] = details.open;
      return copy;
    });
  };

  const accordionStyle: React.CSSProperties = {
    border: "1px solid #ccc",
    borderRadius: "4px",
    marginBottom: "10px",
    background: "#f9f9f9",
    padding: "0",
  };

  const summaryStyle: React.CSSProperties = {
    cursor: "pointer",
    fontWeight: "bold",
    listStyle: "none",
    margin: 0,
    padding: "10px",
    outline: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  };

  const contentStyle: React.CSSProperties = {
    padding: "10px",
    borderTop: "1px solid #ccc",
  };

  return (
    <VerticalRhythm>
      <h3 style={{ marginBottom: "20px" }}>Content Types</h3>
      {contentTypes.length === 0 && <p>No content types defined yet.</p>}

      {contentTypes.map((ct, index) => (
        <details
          key={index}
          style={accordionStyle}
          open={openStates[index]}
          onToggle={(e) => handleToggle(index, e)}
        >
          <summary style={summaryStyle}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <span
                style={{
                  marginRight: "8px",
                  display: "inline-block",
                  transition: "transform 0.2s ease-in-out",
                  transform: openStates[index]
                    ? "rotate(0deg)"
                    : "rotate(-90deg)",
                }}
              >
                {arrowIcon}
              </span>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontWeight: "bold" }}>
                  {ct.friendlyTypeName || "Unnamed Content Type"}
                </span>
                {ct.singleTypeName && (
                  <span style={{ fontSize: "0.8em", color: "#666", fontWeight: "normal" }}>
                    Single Name: {ct.singleTypeName}
                  </span>
                )}
                {ct.pluralTypeName && (
                  <span style={{ fontSize: "0.8em", color: "#666", fontWeight: "normal" }}>
                    Plural Name: {ct.pluralTypeName}
                  </span>
                )}
                {ct.displayField && (
                  <span style={{ fontSize: "0.8em", color: "#666", fontWeight: "normal" }}>
                    Display Field: {ct.displayField}
                  </span>
                )}
                {ct.imageField && (
                  <span style={{ fontSize: "0.8em", color: "#666", fontWeight: "normal" }}>
                    Image Field: {ct.imageField}
                  </span>
                )}
              </div>
            </div>
          </summary>
          <div style={contentStyle}>
            <Input
              label="Friendly Type Name"
              name={`friendlyTypeName-${index}`}
              value={ct.friendlyTypeName}
              onChange={(e) =>
                updateContentTypeField(
                  index,
                  "friendlyTypeName",
                  e.target.value
                )
              }
              caption="A human-readable, friendly name for the content type (e.g. 'Hero Section')"
              style={{ marginBottom: "10px" }}
            />
            <Input
              label="Single Type Name"
              name={`singleTypeName-${index}`}
              value={ct.singleTypeName}
              onChange={(e) =>
                updateContentTypeField(index, "singleTypeName", e.target.value)
              }
              caption="Singular form of the type's name (e.g. 'hero')"
              style={{ marginBottom: "10px" }}
            />
            <Input
              label="Plural Type Name"
              name={`pluralTypeName-${index}`}
              value={ct.pluralTypeName}
              onChange={(e) =>
                updateContentTypeField(index, "pluralTypeName", e.target.value)
              }
              caption="Plural form of the type's name (e.g. 'heroes')"
              style={{ marginBottom: "10px" }}
            />
            <Input
              label="Display Field"
              name={`displayField-${index}`}
              value={ct.displayField ?? ""}
              onChange={(e) =>
                updateContentTypeField(index, "displayField", e.target.value)
              }
              caption="Field to use for displaying the document title (optional)"
              style={{ marginBottom: "10px" }}
            />
            <Input
              label="Image Field"
              name={`imageField-${index}`}
              value={ct.imageField ?? ""}
              onChange={(e) =>
                updateContentTypeField(index, "imageField", e.target.value)
              }
              caption="Field to use for the document image (optional)"
              style={{ marginBottom: "10px" }}
            />
            <Button
              type="button"
              onClick={() => removeContentType(index)}
              style={{ marginTop: "10px" }}
            >
              Delete
            </Button>
          </div>
        </details>
      ))}

      <details
        ref={newContentTypeRef}
        style={accordionStyle}
        open={openStates[contentTypes.length]}
        onToggle={(e) => handleToggle(contentTypes.length, e)}
      >
        <summary style={summaryStyle}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span
              style={{
                marginRight: "8px",
                display: "inline-block",
                transition: "transform 0.2s ease-in-out",
                transform: openStates[contentTypes.length]
                  ? "rotate(0deg)"
                  : "rotate(-90deg)",
              }}
            >
              {arrowIcon}
            </span>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontWeight: "bold" }}>Add New Content Type</span>
            </div>
          </div>
        </summary>
        <div style={contentStyle}>
          <Input
            label="Friendly Type Name"
            name="newFriendlyTypeName"
            value={newFriendlyTypeName}
            onChange={(e) => setNewFriendlyTypeName(e.target.value)}
            caption="A human-readable, friendly name for the content type (e.g. 'Hero Section')"
            style={{ marginBottom: "10px" }}
          />
          <Input
            label="Single Type Name"
            name="newSingleTypeName"
            value={newSingleTypeName}
            onChange={(e) => setNewSingleTypeName(e.target.value)}
            caption="Singular form of the type's name (e.g. 'hero')"
            style={{ marginBottom: "10px" }}
          />
          <Input
            label="Plural Type Name"
            name="newPluralTypeName"
            value={newPluralTypeName}
            onChange={(e) => setNewPluralTypeName(e.target.value)}
            caption="Plural form of the type's name (e.g. 'heroes')"
            style={{ marginBottom: "10px" }}
          />
          <Input
            label="Display Field"
            name="newDisplayField"
            value={newDisplayField}
            onChange={(e) => setNewDisplayField(e.target.value)}
            caption="Field for displaying the document title (optional)"
            style={{ marginBottom: "10px" }}
          />
          <Input
            label="Image Field"
            name="newImageField"
            value={newImageField}
            onChange={(e) => setNewImageField(e.target.value)}
            caption="Field for the document image (optional)"
            style={{ marginBottom: "10px" }}
          />

          <div
            style={{
              marginTop: "20px",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Button
              type="button"
              style={{ backgroundColor: "#007BFF", color: "#fff" }}
              onClick={handleAddNewContentType}
            >
              Add
            </Button>
          </div>
        </div>
      </details>

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

export default SingleDocumentTypeEditorPage;
