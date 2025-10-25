'use client';

import { useState, useEffect } from 'react';

interface AnalysisPanelProps {
  analysis: string;
  auditType: string;
  timestamp: string;
}

interface AnalysisSection {
  title: string;
  content: string;
  icon: string;
}

export default function AnalysisPanel({ analysis, auditType, timestamp }: AnalysisPanelProps) {
  const [sections, setSections] = useState<AnalysisSection[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0])); // First section open by default
  const [currentSection, setCurrentSection] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [bookmarkedSections, setBookmarkedSections] = useState<Set<number>>(new Set());
  const [showBookmarks, setShowBookmarks] = useState(false);

  const auditTypeNames: Record<string, string> = {
    'contact-quality': 'Contact Data Quality',
    'pipeline-health': 'Deal Pipeline Health',
    'company-enrichment': 'Company Enrichment',
    'lead-scoring': 'Lead Scoring & Segmentation',
    'sync-integrity': 'Sync Integrity',
  };

  // Parse analysis into sections on mount
  useEffect(() => {
    const parsed = parseAnalysisIntoSections(analysis);
    setSections(parsed);
  }, [analysis]);

  // Handle scroll for back-to-top button
  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLDivElement;
      setShowBackToTop(target.scrollTop > 300);
    };

    const scrollContainer = document.getElementById('analysis-scroll-container');
    scrollContainer?.addEventListener('scroll', handleScroll);
    return () => scrollContainer?.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleSection = (index: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSections(newExpanded);
    setCurrentSection(index);
  };

  const toggleBookmark = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newBookmarks = new Set(bookmarkedSections);
    if (newBookmarks.has(index)) {
      newBookmarks.delete(index);
    } else {
      newBookmarks.add(index);
    }
    setBookmarkedSections(newBookmarks);
  };

  const goToNext = () => {
    if (currentSection < sections.length - 1) {
      const nextIndex = currentSection + 1;
      setCurrentSection(nextIndex);
      setExpandedSections(new Set([nextIndex])); // Auto-expand next section
      scrollToSection(nextIndex);
    }
  };

  const goToPrev = () => {
    if (currentSection > 0) {
      const prevIndex = currentSection - 1;
      setCurrentSection(prevIndex);
      setExpandedSections(new Set([prevIndex])); // Auto-expand previous section
      scrollToSection(prevIndex);
    }
  };

  const expandAll = () => {
    setExpandedSections(new Set(sections.map((_, i) => i)));
  };

  const collapseAll = () => {
    setExpandedSections(new Set());
  };

  const scrollToSection = (index: number) => {
    const element = document.getElementById(`section-${index}`);
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToTop = () => {
    const container = document.getElementById('analysis-scroll-container');
    container?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const progressPercentage = sections.length > 0 ? Math.round(((currentSection + 1) / sections.length) * 100) : 0;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        goToPrev();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSection, sections.length]);

  return (
    <div id="analysis-scroll-container" className="flex-1 bg-background p-8 overflow-y-auto relative">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {auditTypeNames[auditType] || auditType} Audit
          </h1>
          <p className="text-sm text-muted-foreground">
            Generated on {new Date(timestamp).toLocaleString()}
          </p>
        </div>

        {/* Navigation Controls */}
        <div className="mb-6 bg-card rounded-xl shadow-sm border border-card p-4 sticky top-0 z-10">
          <div className="flex items-center justify-between gap-4 mb-3">
            {/* Progress */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-foreground">
                Section {currentSection + 1} of {sections.length}
              </span>
              <div className="hidden sm:flex items-center gap-2">
                <div className="flex gap-1">
                  {sections.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentSection(index);
                        scrollToSection(index);
                        setExpandedSections(new Set([index]));
                      }}
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: index === currentSection ? '32px' : '8px',
                        background: index === currentSection 
                          ? 'var(--primary)' 
                          : expandedSections.has(index) 
                          ? 'var(--primary-hover)' 
                          : 'var(--muted)'
                      }}
                      title={sections[index]?.title}
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold text-primary ml-1">{progressPercentage}%</span>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowBookmarks(!showBookmarks)}
                className="text-xs px-3 py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors flex items-center gap-1"
              >
                <span>🔖</span>
                <span className="hidden sm:inline">Bookmarks ({bookmarkedSections.size})</span>
              </button>
              <button
                onClick={collapseAll}
                className="text-xs px-3 py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                Collapse All
              </button>
              <button
                onClick={expandAll}
                className="text-xs px-3 py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                Expand All
              </button>
              <div className="h-4 w-px bg-border mx-1"></div>
              <button
                onClick={goToPrev}
                disabled={currentSection === 0}
                className="px-4 py-2 text-sm font-medium text-foreground-light hover:text-foreground disabled:text-muted-foreground disabled:cursor-not-allowed hover:bg-muted rounded-lg transition-colors flex items-center gap-1"
              >
                <span>←</span>
                <span className="hidden sm:inline">Previous</span>
              </button>
              <button
                onClick={goToNext}
                disabled={currentSection === sections.length - 1}
                className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary-hover disabled:bg-muted disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-1"
              >
                <span className="hidden sm:inline">Next</span>
                <span>→</span>
              </button>
            </div>
          </div>

          {/* Bookmarks Panel */}
          {showBookmarks && bookmarkedSections.size > 0 && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs font-medium text-muted-foreground mb-2">Bookmarked Sections:</p>
              <div className="flex flex-wrap gap-2">
                {Array.from(bookmarkedSections).map(index => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentSection(index);
                      scrollToSection(index);
                      setExpandedSections(new Set([index]));
                    }}
                    className="text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                    style={{ background: 'var(--primary-focus)', color: 'var(--primary)' }}
                  >
                    <span>{sections[index]?.icon}</span>
                    <span>{sections[index]?.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {sections.map((section, index) => (
            <div
              key={index}
              id={`section-${index}`}
              className={`bg-card rounded-xl shadow-sm border transition-all duration-300 transform ${
                currentSection === index
                  ? 'ring-2 scale-[1.01]'
                  : 'border-card hover:shadow-md'
              }`}
              style={{
                borderColor: currentSection === index ? 'var(--primary)' : undefined,
                '--tw-ring-color': 'var(--primary-focus)'
              } as React.CSSProperties}
            >
              {/* Section Header */}
              <button
                onClick={() => toggleSection(index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-muted rounded-t-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{section.icon}</span>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{section.title}</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {expandedSections.has(index) ? 'Click to collapse' : 'Click to expand'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => toggleBookmark(index, e)}
                    className={`p-2 rounded-lg transition-all hover:scale-110 ${
                      bookmarkedSections.has(index)
                        ? 'text-warning hover:opacity-80'
                        : 'text-muted-foreground hover:text-foreground-light'
                    }`}
                    title={bookmarkedSections.has(index) ? 'Remove bookmark' : 'Bookmark this section'}
                  >
                    <span className="text-xl">{bookmarkedSections.has(index) ? '🔖' : '🔖'}</span>
                  </button>
                  <svg
                    className={`w-6 h-6 text-muted-foreground transition-transform duration-300 ${
                      expandedSections.has(index) ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Section Content */}
              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  expandedSections.has(index) ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-6 pb-6 pt-2 animate-fadeIn">
                  <div
                    className="prose prose-lg max-w-none leading-relaxed"
                    style={{ color: 'var(--foreground-light)' }}
                    dangerouslySetInnerHTML={{ __html: formatMarkdownToHTML(section.content) }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Export Button */}
        <div className="mt-8 pt-6 border-t border-border">
          <button className="w-full sm:w-auto bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary-hover transition-colors shadow-sm hover:shadow-md">
            📄 Export Full Report
          </button>
        </div>

        {/* Keyboard Shortcut Hint */}
        <div className="mt-4 text-center text-xs text-muted-foreground">
          💡 Tip: Use arrow keys to navigate between sections
        </div>
      </div>

      {/* Floating Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-primary text-primary-foreground p-4 rounded-full shadow-lg hover:bg-primary-hover transition-all hover:scale-110 animate-slideIn z-20"
          aria-label="Back to top"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}
    </div>
  );
}

/**
 * Parse AI analysis into structured sections
 */
function parseAnalysisIntoSections(analysis: string): AnalysisSection[] {
  const sections: AnalysisSection[] = [];
  
  // Split by markdown headers (## or **Section Name**)
  const lines = analysis.split('\n');
  let currentSection: AnalysisSection | null = null;
  let contentBuffer: string[] = [];

  const sectionIcons: Record<string, string> = {
    overview: '📊',
    'key findings': '🔍',
    findings: '🔍',
    'business impact': '💰',
    impact: '💰',
    recommendations: '✅',
    'action items': '✅',
    'next steps': '🚀',
    benchmark: '📈',
    summary: '📝',
    conclusion: '🎯',
  };

  const getIcon = (title: string): string => {
    const lowerTitle = title.toLowerCase();
    for (const [key, icon] of Object.entries(sectionIcons)) {
      if (lowerTitle.includes(key)) return icon;
    }
    return '📄';
  };

  for (const line of lines) {
    // Check if it's a section header
    const h2Match = line.match(/^##\s+(.+)$/);
    const boldMatch = line.match(/^\*\*(.+)\*\*$/);
    
    if (h2Match || boldMatch) {
      // Save previous section
      if (currentSection) {
        currentSection.content = contentBuffer.join('\n').trim();
        sections.push(currentSection);
        contentBuffer = [];
      }
      
      // Start new section
      const title = h2Match ? h2Match[1] : boldMatch![1];
      currentSection = {
        title: title.replace(/\*\*/g, '').trim(),
        content: '',
        icon: getIcon(title),
      };
    } else if (currentSection) {
      contentBuffer.push(line);
    } else {
      // Content before first section - create an "Overview" section
      if (line.trim()) {
        if (!currentSection) {
          currentSection = {
            title: 'Overview',
            content: '',
            icon: '📊',
          };
        }
        contentBuffer.push(line);
      }
    }
  }

  // Save last section
  if (currentSection) {
    currentSection.content = contentBuffer.join('\n').trim();
    sections.push(currentSection);
  }

  return sections.filter(s => s.content.length > 0);
}

/**
 * Simple markdown to HTML converter
 */
function formatMarkdownToHTML(markdown: string): string {
  let html = markdown;

  // Bold text with **
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold" style="color: var(--foreground)">$1</strong>');

  // Bullet points
  html = html.replace(/^\* (.+)$/gim, '<li>$1</li>');
  html = html.replace(/^- (.+)$/gim, '<li>$1</li>');

  // Numbered lists
  html = html.replace(/^\d+\.\s+(.+)$/gim, '<li>$1</li>');

  // Wrap consecutive list items
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul class="list-disc list-inside space-y-2 my-4 ml-4">$&</ul>');

  // Paragraphs
  html = html.split('\n\n').map(para => {
    if (para.trim().startsWith('<ul>') || para.trim().startsWith('<li>')) {
      return para;
    }
    return `<p class="mb-4">${para.trim()}</p>`;
  }).join('');

  return html;
}
