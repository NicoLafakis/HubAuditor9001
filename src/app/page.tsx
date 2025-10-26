'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuditSelector from '@/components/AuditSelector';
import { AuditType } from '@/types';

// Force dynamic rendering to avoid SSR issues with ThemeProvider
export const dynamic = 'force-dynamic';

export default function Home() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectAudit = async (auditType: AuditType, hubspotToken: string) => {
    setIsSubmitting(true);

    // Store token in sessionStorage for API calls
    sessionStorage.setItem('hubspotToken', hubspotToken);

    // Navigate to audit page
    router.push(`/audit/${auditType}`);
  };

  return (
    <>
      {isSubmitting ? (
        <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--background)' }}>
          <div className="text-center">
            <div
              className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-t-transparent mb-4"
              style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }}
            ></div>
            <p style={{ color: 'var(--muted-foreground)' }}>Starting audit...</p>
          </div>
        </div>
      ) : (
        <AuditSelector onSelectAudit={handleSelectAudit} />
      )}
    </>
  );
}
