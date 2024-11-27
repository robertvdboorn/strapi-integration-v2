import React from 'react';
import { SingleDocumentTypeConfig } from '../types/strapi';

interface SingleDocumentTypeEditorProps {
  config: SingleDocumentTypeConfig;
  onChange: (config: SingleDocumentTypeConfig) => void;
}

export const SingleDocumentTypeEditor: React.FC<SingleDocumentTypeEditorProps> = ({ config, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onChange({ ...config, [name]: value });
  };

  return (
    <div>
      <label>
        Allowed Content Types:
        <input
          type="text"
          name="allowedContentTypes"
          value={config.allowedContentTypes.join(',')}
          onChange={(e) => onChange({ ...config, allowedContentTypes: e.target.value.split(',') })}
        />
      </label>
      <label>
        Display Field:
        <input type="text" name="displayField" value={config.displayField} onChange={handleChange} />
      </label>
      <label>
        Image Field:
        <input type="text" name="imageField" value={config.imageField || ''} onChange={handleChange} />
      </label>
    </div>
  );
};

export type { SingleDocumentTypeConfig };
