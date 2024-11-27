import React from 'react';

const Index = () => (
  <main className="min-h-screen bg-gradient-to-b from-blue-100 to-white flex items-center justify-center p-4">
    <div className="max-w-2xl mx-auto text-center space-y-6">
      <h1 className="text-4xl font-bold text-blue-800">Strapi Mesh Integration for Uniform</h1>
      <p className="text-xl text-gray-600">
        Connect your Strapi CMS content seamlessly with Uniform&apos;s composable DXP.
      </p>
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-blue-700">Key Features:</h2>
        <ul className="text-left list-disc list-inside text-gray-700 space-y-2">
          <li>Easy setup and configuration</li>
          <li>Real-time content synchronization</li>
          <li>Support for multiple Strapi content types</li>
          <li>Seamless integration with Uniform&apos;s canvas</li>
        </ul>
      </div>

      <p className="text-sm text-gray-500 mt-8">
        For more information, please refer to the official documentation or contact support.
      </p>
    </div>
  </main>
);

export default Index;
