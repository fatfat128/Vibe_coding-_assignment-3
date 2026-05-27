import React from 'react';

interface FormSectionProps {
  children: React.ReactNode;
  title?: string;
}

const FormSection: React.FC<FormSectionProps> = ({ children, title }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {title && (
        <h2 className="text-2xl font-bold text-furni-green mb-6">{title}</h2>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

export default FormSection;
