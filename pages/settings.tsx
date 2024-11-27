import React from 'react';
import { Callout } from '@uniformdev/mesh-sdk-react';

export default function Settings() {
  return (
    <div className="space-y-6">
      <Callout type="success">The Strapi integration has been installed successfully.</Callout>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Configuring the Strapi Integration</h2>
        <p className="text-lg">
          To configure the integration and start using Strapi content in Uniform, please follow these steps:
        </p>
        <ol className="list-decimal list-inside space-y-2">
          <li>
            Navigate to <strong>Experience &gt; Data Types</strong> in the main navigation above.
          </li>
          <li>
            Click the <strong>Add data type</strong> button in the top-right corner of the page.
          </li>
          <li>
            Select <strong>Strapi</strong> as the data source type.
          </li>
          <li>
            Configure your Strapi connection by providing the following information:
            <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
              <li>Strapi API URL (e.g., https://your-strapi-api.com)</li>
              <li>Strapi API Token</li>
            </ul>
          </li>
          <li>
            Once the data source is set up, you can create data types to pull in specific content from Strapi.
          </li>
          <li>
            For each data type, you&apos;ll be able to configure:
            <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
              <li>Allowed content types</li>
              <li>Display field (for showing content titles)</li>
              <li>Image field (optional, for displaying thumbnails)</li>
              <li>Maximum number of items (for multi-document selection)</li>
            </ul>
          </li>
        </ol>
      </div>
      <div className="bg-gray-100 p-4 rounded-lg">
        <h3 className="text-xl font-semibold mb-2">Need Help?</h3>
        <p>
          If you encounter any issues or have questions about the Strapi integration, please refer to our{' '}
          <a href="#" className="text-blue-600 hover:underline">
            documentation
          </a>{' '}
          or contact our support team.
        </p>
      </div>
    </div>
  );
}
