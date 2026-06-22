import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <Link to="/settings" className="inline-flex items-center space-x-2 text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Settings</span>
      </Link>
      
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 lg:p-10 prose prose-slate dark:prose-invert max-w-none">
        <h1>Privacy Policy</h1>
        <p>Last updated: {new Date().toLocaleDateString('en-US')}</p>
        
        <h2>1. Introduction</h2>
        <p>
          Welcome to DailyVit. We value your privacy and are committed to protecting the personal data you share with us.
          This Privacy Policy explains how we collect, use, and protect your information when using our application.
        </p>

        <h2>2. Information We Collect</h2>
        <p>We may collect the following information:</p>
        <ul>
          <li><strong>Account Information:</strong> Email address and password when you register.</li>
          <li><strong>Health Data:</strong> Step count, heart rate, and calorie burn data synchronized through smartwatch integration (e.g., Huawei Health Kit).</li>
          <li><strong>Usage Data:</strong> Information about how you use our service for quality improvement.</li>
        </ul>

        <h2>3. Use of Information</h2>
        <p>The information we collect is used to:</p>
        <ul>
          <li>Provide, maintain, and improve our services.</li>
          <li>Process data synchronization from connected devices.</li>
          <li>Analyze trends to provide health insights (Smart Insight).</li>
          <li>Respond to customer service requests.</li>
        </ul>

        <h2>4. Information Sharing</h2>
        <p>
          We will not sell or rent your personal information to third parties. We only share your information under the following conditions:
        </p>
        <ul>
          <li>With your consent.</li>
          <li>As required by applicable law.</li>
        </ul>

        <h2>5. Data Security</h2>
        <p>
          We implement technical security measures to protect your data from unauthorized access. However, no method of transmission over the internet is 100% secure.
        </p>

        <h2>6. Contact Us</h2>
        <p>If you have questions about this Privacy Policy, please contact us at support@dailyvit.com.</p>
      </div>
    </div>
  );
};
