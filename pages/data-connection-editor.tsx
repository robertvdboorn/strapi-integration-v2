import { FC, useCallback, useEffect, useMemo } from 'react';
import {
  useMeshLocation,
  DataSourceLocationValue,
  Input,
  ValidationResult,
} from '@uniformdev/mesh-sdk-react';
import { VerticalRhythm } from '@uniformdev/design-system';

export type DataSourceConfig = {
  apiUrl: string;
  apiToken: string;
};

export type DataSourceCustomPublicConfig = Pick<DataSourceConfig, 'apiUrl' | 'apiToken'>;

const TRUE_VALIDATION_RESULT: ValidationResult = { isValid: true };

const DataConnectionEditor: FC = () => {
  const { value, setValue, metadata } = useMeshLocation<'dataSource'>();

  metadata.enableUnpublishedMode = true;

  const { apiUrl, apiToken } = useMemo(() => {
    const config = value.custom as DataSourceConfig;
    return {
      apiUrl: config?.apiUrl || '',
      apiToken: config?.apiToken || '',
    };
  }, [value.custom]);

  useEffect(() => {
    if (!value.baseUrl) {
      handleUpdate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdate = useCallback(
    (updates?: Partial<DataSourceConfig>) => {
      setValue((current) => {
        const currentConfig = current.custom as DataSourceConfig;
        const newConfig = { ...currentConfig, ...updates };

        const customPublic: DataSourceCustomPublicConfig = {
          apiUrl: newConfig.apiUrl,
          apiToken: newConfig.apiToken,
        };

        const baseUrl = apiUrl;

        const newValue: DataSourceLocationValue = {
          ...current,
          baseUrl: `${baseUrl}/api`,
          custom: newConfig,
          customPublic,
          variants: {
            unpublished: {
              baseUrl: `${baseUrl}/api`,
              parameters: [
                {
                  key: 'status',
                  value: 'draft',
                },
              ],
            },
          },
        };

        return { newValue, options: TRUE_VALIDATION_RESULT };
      });
    },
    [apiUrl, setValue]
  );

  // Initialize defaults
  useEffect(() => {
    if (!value.custom) {
      handleUpdate();
    }
  }, [handleUpdate, value.custom]);

  return (
    <VerticalRhythm>
      <Input
        id="apiUrl"
        name="apiUrl"
        label="API URL"
        placeholder="https://your-strapi-api.com/"
        value={apiUrl}
        onChange={(e) => handleUpdate({ apiUrl: e.currentTarget.value })}
        caption="The base URL of your Strapi API (e.g., https://your-strapi-api.com/)"
      />
      <Input
        id="apiToken"
        name="apiToken"
        label="API Token"
        type="password"
        placeholder="Your Strapi API Token"
        value={apiToken}
        onChange={(e) => handleUpdate({ apiToken: e.currentTarget.value })}
        autoComplete="off"
        caption="Your Strapi API token for authentication"
      />
    </VerticalRhythm>
  );
};

export default DataConnectionEditor;
