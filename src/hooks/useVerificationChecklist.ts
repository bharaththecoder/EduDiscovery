import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface VerificationDocument {
  id: string;
  label: string;
  category: 'Mandatory' | 'Category Specific' | 'Regional';
  description: string;
  completed: boolean;
  issuingAuthority: string;
}

const DEFAULT_DOCUMENTS: Omit<VerificationDocument, 'completed'>[] = [
  {
    id: 'rank_card',
    label: 'AP EAPCET 2026 Rank Card & Hall Ticket',
    category: 'Mandatory',
    description: 'Mandatory for Web-Options choice filling and HLC slot booking.',
    issuingAuthority: 'APSCHE / JNTUK'
  },
  {
    id: 'ssc_inter_memos',
    label: 'Class 10 (SSC) & Intermediate Marks Memos',
    category: 'Mandatory',
    description: 'Proof of Date of Birth and minimum qualifying percentage in MPC group (45% for OC, 40% reserved).',
    issuingAuthority: 'BIEAP / BSEAP'
  },
  {
    id: 'study_residence',
    label: 'Study / Bonafide Certificates (Classes 6 to Intermediate)',
    category: 'Regional',
    description: 'Determines statutory 85% Local Candidate Reservation for AU or SVU Region.',
    issuingAuthority: 'School / Junior College Principal'
  },
  {
    id: 'caste_certificate',
    label: 'Integrated Caste / Community Certificate',
    category: 'Category Specific',
    description: 'Required for BC-A/B/C/D/E, SC, ST category quota verification.',
    issuingAuthority: 'Tahsildar via MeeSeva / Ward Sachivalayam'
  },
  {
    id: 'income_ews_certificate',
    label: 'Income Certificate (Valid) / EWS Certificate / White Ration Card',
    category: 'Category Specific',
    description: 'Mandatory for JVD 100% full tuition fee reimbursement and 10% OC-EWS reservation.',
    issuingAuthority: 'Revenue Dept / MeeSeva'
  },
  {
    id: 'transfer_conduct',
    label: 'Transfer Certificate (TC) & Conduct Certificate',
    category: 'Mandatory',
    description: 'Issued by intermediate college at the time of final admission reporting.',
    issuingAuthority: 'Intermediate College'
  }
];

const STORAGE_KEY = 'edudiscovery_verification_checklist';

export function useVerificationChecklist() {
  const { currentUser, updateUserDoc } = useAuth();

  const [documents, setDocuments] = useState<VerificationDocument[]>(() => {
    const cached = localStorage.getItem(STORAGE_KEY);
    let completedIds: string[] = [];
    if (cached) {
      try {
        completedIds = JSON.parse(cached);
      } catch {
        // fallback
      }
    } else if (currentUser?.verificationDocs) {
      completedIds = currentUser.verificationDocs;
    }

    return DEFAULT_DOCUMENTS.map(doc => ({
      ...doc,
      completed: completedIds.includes(doc.id)
    }));
  });

  // Keep in sync with user profile if available
  useEffect(() => {
    if (currentUser?.verificationDocs && Array.isArray(currentUser.verificationDocs)) {
      setDocuments(prev =>
        prev.map(d => ({
          ...d,
          completed: currentUser.verificationDocs.includes(d.id)
        }))
      );
    }
  }, [currentUser?.verificationDocs]);

  const toggleDocument = (id: string) => {
    setDocuments(prev => {
      const next = prev.map(doc => (doc.id === id ? { ...doc, completed: !doc.completed } : doc));
      const completedIds = next.filter(d => d.completed).map(d => d.id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(completedIds));

      if (currentUser?.id) {
        updateUserDoc({ verificationDocs: completedIds }).catch(err => {
          console.warn('[useVerificationChecklist] Cloud sync failed:', err);
        });
      }
      return next;
    });
  };

  const markAll = (completed: boolean) => {
    setDocuments(prev => {
      const next = prev.map(d => ({ ...d, completed }));
      const completedIds = next.filter(d => d.completed).map(d => d.id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(completedIds));

      if (currentUser?.id) {
        updateUserDoc({ verificationDocs: completedIds }).catch(err => {
          console.warn('[useVerificationChecklist] Cloud sync failed:', err);
        });
      }
      return next;
    });
  };

  const completedCount = documents.filter(d => d.completed).length;
  const totalCount = documents.length;
  const readinessPercentage = Math.round((completedCount / totalCount) * 100);

  return {
    documents,
    completedCount,
    totalCount,
    readinessPercentage,
    toggleDocument,
    markAll
  };
}
