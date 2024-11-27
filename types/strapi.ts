export interface StrapiContentType {
  uid: string;
  apiID: string;
  displayName: string;
}

export interface StrapiEntry {
  id: number;
  [key: string]: any;
}

export interface StrapiIntegrationConfig {
  apiUrl: string;
  apiToken: string;
}

export interface SingleDocumentTypeConfig {
  allowedContentTypes: string[];
  displayField: string;
  imageField?: string;
}

export interface MultiDocumentTypeConfig extends SingleDocumentTypeConfig {
  maxItems?: number;
}
