import React from 'react';
import { MessageSquare } from 'lucide-react';

const Footer = () => {
  const handleFeedbackClick = () => {
    window.open('https://docs.google.com/forms/d/e/1FAIpQLSeEQU0P2eXya0MO1W2OFKUJYZnyEtG-PH9JSIe6-STc44wphg/viewform?usp=dialog', '_blank');
  };

  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm">
            © {new Date().getFullYear()} DataViz. All rights reserved.
          </p>
          <button
            onClick={handleFeedbackClick}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Provide Feedback</span>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;