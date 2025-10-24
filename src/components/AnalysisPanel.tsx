interface AnalysisPanelProps {
  analysis: string;
  auditType: string;
  timestamp: string;
}

export default function AnalysisPanel({ analysis, auditType, timestamp }: AnalysisPanelProps) {
  const auditTypeNames: Record<string, string> = {
    'contact-quality': 'Contact Data Quality',
    'pipeline-health': 'Deal Pipeline Health',
    'company-enrichment': 'Company Enrichment',
    'lead-scoring': 'Lead Scoring & Segmentation',
    'sync-integrity': 'Sync Integrity',
  };

  return (
    <div className="flex-1 bg-white p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {auditTypeNames[auditType] || auditType} Audit
          </h1>
          <p className="text-sm text-gray-500">
            Generated on {new Date(timestamp).toLocaleString()}
          </p>
        </div>

        {/* Simple Analysis Label */}
        <div className="mb-6">
          <div className="inline-block bg-blue-50 text-blue-900 text-sm font-medium px-4 py-2 rounded-lg">
            ✨ AI Analysis
          </div>
        </div>

        {/* Analysis Content */}
        <div className="prose prose-lg max-w-none">
          <div
            className="text-gray-800 leading-relaxed space-y-4"
            dangerouslySetInnerHTML={{
              __html: formatMarkdownToHTML(analysis),
            }}
          />
        </div>

        {/* Export Button */}
        <div className="mt-10 pt-6 border-t border-gray-200">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Export Audit Report
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Simple markdown to HTML converter
 * Supports: headers, bold, lists, paragraphs
 */
function formatMarkdownToHTML(markdown: string): string {
  let html = markdown;

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-6 mb-3">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-8 mb-4">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-10 mb-5">$1</h1>');

  // Bold text with **
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>');

  // Bullet points
  html = html.replace(/^\* (.*$)/gim, '<li class="ml-4">$1</li>');
  html = html.replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>');

  // Numbered lists
  html = html.replace(/^\d+\. (.*$)/gim, '<li class="ml-4">$1</li>');

  // Wrap consecutive list items
  html = html.replace(/(<li.*<\/li>\n?)+/g, '<ul class="list-disc list-inside space-y-2 my-4">$&</ul>');

  // Paragraphs
  html = html.replace(/\n\n/g, '</p><p class="mb-4">');
  html = '<p class="mb-4">' + html + '</p>';

  return html;
}
