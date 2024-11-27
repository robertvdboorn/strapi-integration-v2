import { useMemo } from 'react';

export function useGetEditLinkUrl(apiUrl: string): string | undefined {
  return useMemo(() => {
    if (!apiUrl) return undefined;
    try {
      const url = new URL(apiUrl);
      return `${url.protocol}//${url.hostname}${url.port ? `:${url.port}` : ''}/admin`;
    } catch {
      return undefined;
    }
  }, [apiUrl]);
}
