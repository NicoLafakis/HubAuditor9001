import { ReactNode } from 'react';

interface AuditLayoutProps {
  sidebar: ReactNode;
  content: ReactNode;
}

export default function AuditLayout({ sidebar, content }: AuditLayoutProps) {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Sidebar */}
      <aside className="lg:sticky lg:top-0 lg:h-screen">{sidebar}</aside>

      {/* Main Content */}
      <main className="flex-1">{content}</main>
    </div>
  );
}
