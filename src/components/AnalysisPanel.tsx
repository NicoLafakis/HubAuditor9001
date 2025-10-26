'use client';

import { useState, useEffect } from 'react';
import DOMPurify from 'isomorphic-dompurify';

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
    <div className="flex-1 bg-background overflow-y-auto relative" id="analysis-scroll-container">
      <div className="max-w-5xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {auditTypeNames[auditType] || auditType} Audit
          </h1>
          <p className="text-sm text-muted-foreground">
            Generated on {new Date(timestamp).toLocaleString()}
          </p>
        </div>

        {/* Navigation Controls - Fixed Sticky */}
        <div 
          className="sticky top-0 z-20 mb-6 -mx-8 px-8 py-4 backdrop-blur-md border-b"
          style={{ 
            backgroundColor: 'rgba(var(--card-rgb), 0.95)',
            borderColor: 'var(--border)'
          }}
        >
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
            {/* Progress */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-foreground">
                Section {currentSection + 1} of {sections.length}
              </span>
              <div className="hidden md:flex items-center gap-2">
                <div className="flex gap-1">
                  {sections.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentSection(index);
                        scrollToSection(index);
                        setExpandedSections(new Set([index]));
                      }}
                      className="h-2 rounded-full transition-all hover:scale-110"
                      style={{
                        width: index === currentSection ? '32px' : '8px',
                        background: index === currentSection
                          ? 'var(--primary)'
                          : expandedSections.has(index)
                          ? 'var(--primary-hover)'
                          : 'var(--muted)'
                      }}
                      aria-label={`Go to section ${index + 1}: ${sections[index]?.title}`}
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
                onClick={collapseAll}
                className="text-sm px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                aria-label="Collapse all sections"
              >
                Collapse All
              </button>
              <button
                onClick={expandAll}
                className="text-sm px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                aria-label="Expand all sections"
              >
                Expand All
              </button>
              <div className="hidden md:block h-4 w-px bg-border mx-2"></div>
              <button
                onClick={goToPrev}
                disabled={currentSection === 0}
                className="px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed disabled:hover:bg-transparent rounded transition-colors flex items-center gap-1"
                aria-label="Go to previous section"
              >
                <span>←</span>
                <span className="hidden md:inline">Previous</span>
              </button>
              <button
                onClick={goToNext}
                disabled={currentSection === sections.length - 1}
                className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary-hover disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed rounded transition-colors flex items-center gap-1"
                aria-label="Go to next section"
              >
                <span className="hidden md:inline">Next</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sections - Professional Design */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <div
              key={index}
              id={`section-${index}`}
              className={`bg-card border transition-all duration-200 ${
                currentSection === index
                  ? 'ring-1 ring-primary shadow-lg'
                  : 'border-border shadow-sm hover:shadow-md'
              }`}
              style={{
                borderLeft: currentSection === index ? '4px solid var(--primary)' : undefined,
              } as React.CSSProperties}
            >
              {/* Section Header - Clean Professional Design */}
              <button
                onClick={() => toggleSection(index)}
                className="w-full px-8 py-5 flex items-center justify-between text-left transition-colors group"
                aria-expanded={expandedSections.has(index)}
                aria-controls={`section-content-${index}`}
                aria-label={`${expandedSections.has(index) ? 'Collapse' : 'Expand'} ${section.title} section`}
              >
                <div className="flex-1">
                  <h2
                    id={`section-heading-${index}`}
                    className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors"
                  >
                    {section.title}
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <svg
                    className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${
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
                id={`section-content-${index}`}
                role="region"
                aria-labelledby={`section-heading-${index}`}
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  expandedSections.has(index) ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-8 pb-8 border-t border-border">
                  <div
                    className="prose prose-lg max-w-none leading-relaxed pt-6"
                    style={{ color: 'var(--foreground-light)' }}
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formatMarkdownToHTML(section.content)) }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Keyboard Shortcut Hint */}
        <div className="mt-8 pt-6 border-t border-border text-center text-sm text-muted-foreground">
          Tip: Use arrow keys to navigate between sections
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

  // Professional section configuration
  const sectionConfig: Record<string, { title: string; icon: string; priority: number }> = {
    'overview': { title: 'Overview', icon: '', priority: 1 },
    'business impact': { title: 'Business Impact', icon: '', priority: 2 },
    'recommendations': { title: 'Recommendations', icon: '', priority: 3 },
    'benchmark': { title: 'Benchmark Against Industry Standards', icon: '', priority: 4 },
    'grade': { title: 'Overall Grade', icon: '', priority: 5 },
    'success metrics': { title: 'Success Metrics to Track', icon: '', priority: 6 },
  };

  const getSectionInfo = (title: string): { title: string; icon: string; priority: number } => {
    const lowerTitle = title.toLowerCase();
    for (const [key, config] of Object.entries(sectionConfig)) {
      if (lowerTitle.includes(key)) return config;
    }
    return { title, icon: '', priority: 999 };
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
      const cleanTitle = title.replace(/\*\*/g, '').trim();
      const sectionInfo = getSectionInfo(cleanTitle);
      
      currentSection = {
        title: sectionInfo.title,
        content: '',
        icon: sectionInfo.icon,
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
            icon: '',
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

  // Merge and consolidate sections
  const consolidatedSections: AnalysisSection[] = [];
  const sectionMap = new Map<string, AnalysisSection>();
  
  for (const section of sections) {
    const lowerTitle = section.title.toLowerCase();
    
    // Merge Overview and Key Findings
    if (lowerTitle.includes('overview')) {
      if (!sectionMap.has('overview')) {
        sectionMap.set('overview', { ...section, title: 'Overview', icon: '' });
      } else {
        sectionMap.get('overview')!.content += '\n\n' + section.content;
      }
    } else if (lowerTitle.includes('key finding') || lowerTitle.includes('findings')) {
      if (!sectionMap.has('overview')) {
        sectionMap.set('overview', { title: 'Overview', content: section.content, icon: '' });
      } else {
        sectionMap.get('overview')!.content += '\n\n**Key Findings**\n\n' + section.content;
      }
    }
    // Consolidate Business Impact
    else if (lowerTitle.includes('business impact') || 
             lowerTitle.includes('revenue leakage') ||
             lowerTitle.includes('operational inefficiency') ||
             lowerTitle.includes('strategic blindness') ||
             lowerTitle.includes('wasted marketing')) {
      if (!sectionMap.has('business-impact')) {
        sectionMap.set('business-impact', { title: 'Business Impact', content: '', icon: '' });
      }
      if (lowerTitle.includes('business impact')) {
        sectionMap.get('business-impact')!.content = section.content + '\n\n' + (sectionMap.get('business-impact')!.content || '');
      } else {
        sectionMap.get('business-impact')!.content += '\n\n' + section.content;
      }
    }
    // Consolidate Recommendations
    else if (lowerTitle.includes('recommendation') || 
             lowerTitle.includes('action') ||
             lowerTitle.includes('next step') ||
             lowerTitle.includes('timeline')) {
      if (!sectionMap.has('recommendations')) {
        sectionMap.set('recommendations', { title: 'Recommendations', content: '', icon: '' });
      }
      if (lowerTitle.includes('recommendation')) {
        sectionMap.get('recommendations')!.content = section.content + '\n\n' + (sectionMap.get('recommendations')!.content || '');
      } else {
        sectionMap.get('recommendations')!.content += '\n\n' + section.content;
      }
    }
    // Benchmark section
    else if (lowerTitle.includes('benchmark') || lowerTitle.includes('industry standard')) {
      if (!sectionMap.has('benchmark')) {
        sectionMap.set('benchmark', { title: 'Benchmark Against Industry Standards', content: section.content, icon: '' });
      } else {
        sectionMap.get('benchmark')!.content += '\n\n' + section.content;
      }
    }
    // Grade section
    else if (lowerTitle.includes('grade') || lowerTitle.includes('score')) {
      if (!sectionMap.has('grade')) {
        sectionMap.set('grade', { title: 'Overall Grade', content: section.content, icon: '' });
      } else {
        sectionMap.get('grade')!.content += '\n\n' + section.content;
      }
    }
    // Success Metrics section
    else if (lowerTitle.includes('success metric') || lowerTitle.includes('metrics to track')) {
      if (!sectionMap.has('metrics')) {
        sectionMap.set('metrics', { title: 'Success Metrics to Track', content: section.content, icon: '' });
      } else {
        sectionMap.get('metrics')!.content += '\n\n' + section.content;
      }
    }
    // Other sections
    else {
      consolidatedSections.push(section);
    }
  }
  
  // Add sections in correct order
  const orderedKeys = ['overview', 'business-impact', 'recommendations', 'benchmark', 'grade', 'metrics'];
  for (const key of orderedKeys) {
    const section = sectionMap.get(key);
    if (section && section.content.trim()) {
      consolidatedSections.push(section);
    }
  }

  return consolidatedSections.filter(s => s.content.length > 0);
}

/**
 * Professional markdown to HTML converter with table support
 */
function formatMarkdownToHTML(markdown: string): string {
  let html = markdown;

  // Handle markdown tables
  const tableRegex = /(\|.+\|[\r\n]+\|[-:\s|]+\|[\r\n]+(?:\|.+\|[\r\n]*)+)/g;
  html = html.replace(tableRegex, (match) => {
    const lines = match.trim().split('\n');
    if (lines.length < 3) return match;

    const headers = lines[0].split('|').map(h => h.trim()).filter(h => h);
    const rows = lines.slice(2).map(row => 
      row.split('|').map(cell => cell.trim()).filter(cell => cell)
    );

    let tableHTML = '<div class="overflow-x-auto my-8"><table class="min-w-full border-collapse" style="border: 1px solid var(--border)">';
    
    // Header
    tableHTML += '<thead style="background: var(--muted)"><tr>';
    headers.forEach(header => {
      tableHTML += `<th class="px-6 py-4 text-left font-bold text-sm uppercase tracking-wide" style="border: 1px solid var(--border); color: var(--foreground)">${header}</th>`;
    });
    tableHTML += '</tr></thead>';

    // Body
    tableHTML += '<tbody>';
    rows.forEach((row, idx) => {
      const bgColor = idx % 2 === 0 ? 'var(--card)' : 'var(--background)';
      tableHTML += `<tr style="background: ${bgColor}" class="hover:bg-muted transition-colors">`;
      row.forEach(cell => {
        tableHTML += `<td class="px-6 py-4" style="border: 1px solid var(--border); color: var(--foreground-light)">${cell}</td>`;
      });
      tableHTML += '</tr>';
    });
    tableHTML += '</tbody></table></div>';

    return tableHTML;
  });

  // Handle Timeline sections (Timeline: Within X)
  html = html.replace(/^(Timeline:\s+Within\s+.+?)$/gim, '<h4 class="text-base font-bold mt-6 mb-3 pb-2 border-b" style="color: var(--primary); border-color: var(--border)">$1</h4>');

  // Handle subsection headers (###)
  html = html.replace(/^###\s+(.+)$/gim, '<h3 class="text-xl font-bold mt-8 mb-4" style="color: var(--foreground)">$1</h3>');

  // Handle emoji bullets for Business Impact subsections
  html = html.replace(/^(📄|💰|🎯|⚠️|✅|🚀)\s+(.+?):$/gim, '<h4 class="text-lg font-bold mt-6 mb-3" style="color: var(--foreground)">$2</h4>');

  // Bold text with **
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold" style="color: var(--foreground)">$1</strong>');

  // Bullet points
  html = html.replace(/^\*\s+(.+)$/gim, '<li class="mb-2">$1</li>');
  html = html.replace(/^-\s+(.+)$/gim, '<li class="mb-2">$1</li>');

  // Numbered lists
  html = html.replace(/^\d+\.\s+(.+)$/gim, '<li class="mb-2">$1</li>');

  // Wrap consecutive list items
  html = html.replace(/(<li class="mb-2">.*<\/li>\n?)+/g, '<ul class="list-disc list-outside space-y-1 my-4 ml-6 text-foreground-light">$&</ul>');

  // Paragraphs
  html = html.split('\n\n').map(para => {
    const trimmed = para.trim();
    if (trimmed.startsWith('<ul>') || 
        trimmed.startsWith('<li>') || 
        trimmed.startsWith('<table') || 
        trimmed.startsWith('<div class="overflow') ||
        trimmed.startsWith('<h3') ||
        trimmed.startsWith('<h4')) {
      return para;
    }
    if (trimmed.length > 0) {
      return `<p class="mb-4 leading-relaxed">${trimmed}</p>`;
    }
    return '';
  }).join('');

  return html;
}
