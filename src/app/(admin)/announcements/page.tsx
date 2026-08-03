'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { 
  collection, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy 
} from 'firebase/firestore';
import CustomModal from '@/components/CustomModal';

interface Announcement {
  id: string;
  title: string;
  link?: string;
  description: string;
  targetMajlis?: string;
  sentBy?: string;
  createdAt?: any;
}

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMajlisFilter, setSelectedMajlisFilter] = useState('সকল');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Custom Modal State
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'confirm';
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel?: () => void;
  }>({
    isOpen: false,
    type: 'confirm',
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Real-time listener for Firestore `notifications` collection
  useEffect(() => {
    setIsLoading(true);
    const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs: Announcement[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        docs.push({
          id: docSnap.id,
          title: data.title || '',
          link: data.link || '',
          description: data.description || '',
          targetMajlis: data.targetMajlis || 'সকল',
          sentBy: data.sentBy || 'অ্যাডমিন',
          createdAt: data.createdAt ? data.createdAt.toDate().toLocaleDateString('bn-BD', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) : 'সদ্য'
        });
      });
      setAnnouncements(docs);
      setIsLoading(false);
    }, (error) => {
      console.error('Error fetching notifications:', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDeleteRequest = (item: Announcement) => {
    setModalConfig({
      isOpen: true,
      type: 'confirm',
      title: 'নোটিফিকেশন মুছে ফেলা',
      message: `আপনি কি নিশ্চিত যে "${item.title}" নোটিফিকেশনটি চিরতরে মুছে ফেলতে চান?`,
      confirmText: 'হ্যাঁ, মুছে ফেলুন',
      cancelText: 'বাতিল',
      onConfirm: async () => {
        setModalConfig(prev => ({ ...prev, isOpen: false }));
        try {
          await deleteDoc(doc(db, 'notifications', item.id));
          if (announcements.length - 1 <= (currentPage - 1) * itemsPerPage && currentPage > 1) {
            setCurrentPage((prev) => prev - 1);
          }
        } catch (err: any) {
          console.error('Error deleting notice:', err);
          setTimeout(() => {
            setModalConfig({
              isOpen: true,
              type: 'error',
              title: 'ত্রুটি',
              message: 'নোটিশটি মুছে ফেলা সম্ভব হয়নি।',
              confirmText: 'ঠিক আছে',
              onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
            });
          }, 300);
        }
      },
      onCancel: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
    });
  };

  // Filter announcements
  const filteredAnnouncements = announcements.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          a.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMajlis = selectedMajlisFilter === 'সকল' || a.targetMajlis === selectedMajlisFilter;
    return matchesSearch && matchesMajlis;
  });

  // Pagination calculations
  const totalItems = filteredAnnouncements.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAnnouncements.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div>
      {/* Custom Glassmorphic Modal */}
      <CustomModal
        isOpen={modalConfig.isOpen}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        cancelText={modalConfig.cancelText}
        onConfirm={modalConfig.onConfirm}
        onCancel={modalConfig.onCancel}
      />

      {/* Header & Send Action Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ color: '#F8FAFC', fontSize: '28px', fontWeight: 'bold' }}>ঘোষণা ও নোটিফিকেশন হিস্ট্রি</h1>
          <p style={{ color: '#94A3B8', marginTop: '6px' }}>মোবাইল অ্যাপ ব্যবহারকারীদের কাছে পাঠানো ইউনিভার্সাল পুশ নোটিফিকেশন তালিকা</p>
        </div>

        <Link
          href="/announcements/create"
          className="btn btn-primary"
          style={{
            padding: '12px 22px',
            fontSize: '15px',
            fontWeight: 'bold',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none'
          }}
        >
          <i className="fa-solid fa-paper-plane" style={{ fontSize: '18px' }} />
          <span>নতুন নোটিফিকেশন পাঠান</span>
        </Link>
      </div>

      {/* Main Full-Width Announcements Card */}
      <div className="card">
        {/* Search & Filter Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ position: 'relative', minWidth: '280px', flex: 1, maxWidth: '400px' }}>
            <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="শিরোনাম বা বিবরণ লিখে খুঁজুন..."
              style={{ width: '100%', padding: '12px 14px 12px 42px', fontSize: '14px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['সকল', 'খেলাফত মজলিস', 'ছাত্র মজলিস', 'যুব মজলিস', 'শ্রমিক মজলিস', 'মহিলা মজলিস'].map((maj) => (
              <button
                key={maj}
                onClick={() => {
                  setSelectedMajlisFilter(maj);
                  setCurrentPage(1);
                }}
                style={{
                  padding: '8px 14px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: selectedMajlisFilter === maj ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  color: selectedMajlisFilter === maj ? '#10B981' : '#94A3B8',
                  transition: 'all 0.2s'
                }}
              >
                {maj}
              </button>
            ))}
          </div>
        </div>

        {/* List Section */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-light)' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '28px', color: '#10B981', marginBottom: '12px' }}></i>
            <p>ফায়ারস্টোর থেকে নোটিফিকেশন লোড হচ্ছে...</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', minHeight: '300px' }}>
            {currentItems.map((item) => (
              <div 
                key={item.id} 
                style={{
                  padding: '18px 20px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '16px',
                  background: 'rgba(30, 41, 59, 0.4)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '16px',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#F8FAFC', margin: 0 }}>
                      {item.title}
                    </h3>
                    <span style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(16, 185, 129, 0.15)',
                      color: '#10B981',
                      fontWeight: 'bold'
                    }}>
                      {item.targetMajlis}
                    </span>
                  </div>

                  <p style={{ fontSize: '14px', color: '#94A3B8', margin: '0 0 10px 0', lineHeight: '1.5' }}>
                    {item.description}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: 'var(--text-light)', flexWrap: 'wrap' }}>
                    <span><i className="fa-regular fa-clock" /> {item.createdAt}</span>
                    {item.link && (
                      <a 
                        href={item.link} 
                        target="_blank" 
                        rel="noreferrer" 
                        style={{ color: '#38BDF8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <i className="fa-solid fa-link" /> ওয়েব লিংক দেখুন
                      </a>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteRequest(item)}
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: '#FCA5A5',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '8px 14px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  title="ডিলিট করুন"
                >
                  <i className="fa-solid fa-trash" />
                  <span>মুছুন</span>
                </button>
              </div>
            ))}

            {filteredAnnouncements.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-light)' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  margin: '0 auto 16px auto',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#10B981',
                  fontSize: '28px',
                  border: '1px solid rgba(16, 185, 129, 0.2)'
                }}>
                  <i className="fa-solid fa-bell-slash" />
                </div>
                <h3 style={{ color: '#F8FAFC', fontSize: '16px', fontWeight: 'bold', marginBottom: '6px' }}>
                  কোনো নোটিফিকেশন হিস্ট্রি পাওয়া যায়নি
                </h3>
                <p style={{ fontSize: '13px', maxWidth: '340px', margin: '0 auto 16px auto', color: '#94A3B8', lineHeight: '1.5' }}>
                  উপরে "নতুন নোটিফিকেশন পাঠান" বাটনে ক্লিক করে অ্যাপ ব্যবহারকারীদের জন্য বিজ্ঞপ্তি রিলিজ করুন।
                </p>
                <Link
                  href="/announcements/create"
                  className="btn btn-primary"
                  style={{ padding: '10px 20px', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
                >
                  <i className="fa-solid fa-paper-plane" />
                  <span>নতুন নোটিফিকেশন পাঠান</span>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', flexWrap: 'wrap', gap: '10px' }}>
            <p style={{ color: 'var(--text-light)', fontSize: '13px' }}>
              মোট {totalItems} টি নোটিফিকেশনের মধ্যে {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, totalItems)} দেখানো হচ্ছে
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="btn"
                style={{ background: 'rgba(255, 255, 255, 0.08)', padding: '8px 16px', fontSize: '13px', color: currentPage === 1 ? 'rgba(255, 255, 255, 0.3)' : '#F8FAFC', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
              >
                <i className="fa-solid fa-chevron-left"></i> পূর্ববর্তী
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="btn"
                style={{ background: 'rgba(255, 255, 255, 0.08)', padding: '8px 16px', fontSize: '13px', color: currentPage === totalPages || totalPages === 0 ? 'rgba(255, 255, 255, 0.3)' : '#F8FAFC', cursor: currentPage === totalPages || totalPages === 0 ? 'not-allowed' : 'pointer' }}
              >
                পরবর্তী <i className="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
