'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuditSelector from '@/components/AuditSelector';
import { AuditType } from '@/types';

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
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Starting audit...</p>
          </div>
        </div>
      ) : (
        <AuditSelector onSelectAudit={handleSelectAudit} />
      )}
    </>
  );
}
