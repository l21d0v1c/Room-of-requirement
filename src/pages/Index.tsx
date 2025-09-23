import React from 'react';
import LoginForm from '@/components/LoginForm';

const IndexPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-8">
        Room of Requirement
      </h1>
      <LoginForm />
    </div>
  );
};

export default IndexPage;