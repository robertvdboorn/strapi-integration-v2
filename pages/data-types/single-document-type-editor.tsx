import React from 'react';
import { useMeshLocation } from '@uniformdev/mesh-sdk-react';
import { VerticalRhythm, Input } from '@uniformdev/design-system';

interface SingleDocumentTypeConfig {
  custom: {
    allowedContentTypes: string[];
    displayField: string;
    imageField?: string;
  };
}

const SingleDocumentTypeEditorPage: React.FC = () => {
  const { value, setValue } = useMeshLocation<'dataType', SingleDocumentTypeConfig>();

  const handleChange = (field: keyof SingleDocumentTypeConfig['custom'], newValue: string) => {
    setValue((current) => ({
      newValue: {
        ...current,
        custom: {
          ...current.custom,
          [field]: field === 'allowedContentTypes' ? newValue.split(',') : newValue,
        },
        path: '/heroes/${id}?populate=*',
        variables: {
          ['id']: {
            displayName: 'Document ID',
            type: 'string',
            helpText: 'The ID of the document to display',
            default: 'unspecified',
            order: 1,
            source: 'query',
          },
        },
      },
    }));
  };

  return (
    <VerticalRhythm>
      <Input
        label="Allowed Content Types"
        name="allowedContentTypes"
        value={
          Array.isArray(value.custom?.allowedContentTypes) ? value.custom.allowedContentTypes.join(', ') : ''
        }
        onChange={(e) => handleChange('allowedContentTypes', e.target.value)}
        caption="Comma-separated list of allowed Strapi content types"
      />
      <Input
        label="Display Field"
        name="displayField"
        value={(value.custom?.displayField as string) ?? ''}
        onChange={(e) => handleChange('displayField', e.target.value)}
        caption="Field to use for displaying the document title"
      />
      <Input
        label="Image Field"
        name="imageField"
        value={(value.custom?.imageField as string) || ''}
        onChange={(e) => handleChange('imageField', e.target.value)}
        caption="Field to use for displaying the document image (optional)"
      />
    </VerticalRhythm>
  );
};

export default SingleDocumentTypeEditorPage;
