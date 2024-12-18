import React from "react";
import { useMeshLocation } from "@uniformdev/mesh-sdk-react";
import { VerticalRhythm, Input } from "@uniformdev/design-system";

interface SingleDocumentTypeConfig {
  custom: {
    contentTypes: string; // now a JSON string representing an array of { single: string; plural: string }
    displayField: string;
    imageField?: string;
  };
}

const SingleDocumentTypeEditorPage: React.FC = () => {
  const { value, setValue } = useMeshLocation<
    "dataType",
    SingleDocumentTypeConfig
  >();

  const handleChange = (
    field: keyof SingleDocumentTypeConfig["custom"],
    newValue: string
  ) => {
    setValue((current) => {
      let updatedValue = newValue;

      return {
        newValue: {
          ...current,
          custom: {
            ...current.custom,
            [field]: updatedValue,
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
          },
        },
      };
    });
  };

  const currentContentTypes = (value.custom?.contentTypes as string) ?? "";
  const currentDisplayField = (value.custom?.displayField as string) ?? "";
  const currentImageField = (value.custom?.imageField as string) ?? "";

  return (
    <VerticalRhythm>
      <Input
        label="Content Types"
        name="contentTypes"
        value={currentContentTypes}
        onChange={(e) => handleChange("contentTypes", e.target.value)}
        caption='Enter the content types as a JSON array, e.g. [{"single":"hero","plural":"heroes"}]'
      />
      <Input
        label="Display Field"
        name="displayField"
        value={currentDisplayField}
        onChange={(e) => handleChange("displayField", e.target.value)}
        caption="Field to use for displaying the document title"
      />
      <Input
        label="Image Field"
        name="imageField"
        value={currentImageField}
        onChange={(e) => handleChange("imageField", e.target.value)}
        caption="Field to use for displaying the document image (optional)"
      />
    </VerticalRhythm>
  );
};

export default SingleDocumentTypeEditorPage;
