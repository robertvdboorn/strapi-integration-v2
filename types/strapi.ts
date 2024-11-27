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

export interface ContentTypeConfig {
  uid?: string;
  friendlyTypeName: string;
  singleTypeName: string;
  pluralTypeName: string;
  displayField?: string;
  imageField?: string;
}

export interface SingleDocumentTypeConfig {
  custom: {
    contentTypes: ContentTypeConfig[];
  };
}