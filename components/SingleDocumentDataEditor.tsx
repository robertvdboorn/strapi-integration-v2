import React from 'react';
import { DocumentSelector } from './DocumentSelector';
import { StrapiIntegrationConfig, SingleDocumentTypeConfig } from '../types/strapi';

interface SingleDocumentDataEditorProps {
  value: { id: number };
  onChange: (value: { id: number }) => void;
  config: StrapiIntegrationConfig & SingleDocumentTypeConfig;
}

export const SingleDocumentDataEditor: React.FC<SingleDocumentDataEditorProps> = ({ value, config }) => {
  return (
    <DocumentSelector
      apiUrl={config.apiUrl}
      apiToken={config.apiToken}
      allowedContentTypes={config.allowedContentTypes}
      selectedIds={value.id ? [value.id] : []}
      multiSelect={false}
      displayField={config.displayField}
      imageField={config.imageField}
    />
  );
};
