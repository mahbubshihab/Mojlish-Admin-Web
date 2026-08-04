'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { db, storage } from '@/lib/firebase';
import { 
  collection, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  serverTimestamp, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import CustomModal from '@/components/CustomModal';

interface Book {
  id: string;
  title: string;
  author: string;
  majlis: string;
  description: string;
  pages: string;
  size: string;
  pdfUrl: string;
  createdAt?: any;
  downloads?: number;
}

export default function Resources() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMajlisFilter, setSelectedMajlisFilter] = useState('সকল');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingAuthor, setEditingAuthor] = useState('');
  const [editingMajlis, setEditingMajlis] = useState('সকল');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  // Real-time Firestore Subscription for Books Collection
  useEffect(() => {
    const q = query(collection(db, 'books'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedBooks: Book[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || 'শিরোনামহীন বই',
            author: data.author || 'কেন্দ্রীয় প্রচার ও প্রকাশনা বিভাগ',
            majlis: data.majlis || 'সকল',
            description: data.description || '',
            pages: data.pages || '৩০ পৃষ্ঠা',
            size: data.size || '২.৫ MB',
            pdfUrl: data.pdfUrl || '',
            createdAt: data.createdAt,
            downloads: data.downloads || 0,
          };
        });
        setBooks(fetchedBooks);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error listening to books collection:', error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Delete book doc from Firestore and file from Storage using Custom Modal
  const handleDeleteBookRequest = (book: Book) => {
    setModalConfig({
      isOpen: true,
      type: 'confirm',
      title: 'বই মুছে ফেলা',
      message: `আপনি কি নিশ্চিত যে "${book.title}" প্রকাশনাটি চিরতরে মুছে ফেলতে চান?`,
      confirmText: 'হ্যাঁ, মুছে ফেলুন',
      cancelText: 'বাতিল',
      onConfirm: async () => {
        setModalConfig(prev => ({ ...prev, isOpen: false }));
        try {
          await deleteDoc(doc(db, 'books', book.id));
          if (book.pdfUrl && book.pdfUrl.includes('firebasestorage')) {
            try {
              const fileRef = ref(storage, book.pdfUrl);
              await deleteObject(fileRef);
            } catch (storageErr) {
              console.log('Storage delete bypass:', storageErr);
            }
          }
        } catch (err: any) {
          setTimeout(() => {
            setModalConfig({
              isOpen: true,
              type: 'error',
              title: 'ত্রুটি',
              message: `বই মুছে ফেলতে ব্যর্থ: ${err.message}`,
              confirmText: 'ঠিক আছে',
              onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
            });
          }, 300);
        }
      },
      onCancel: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
    });
  };

  // Edit inline save
  const startEdit = (b: Book) => {
    setEditingId(b.id);
    setEditingTitle(b.title);
    setEditingAuthor(b.author);
    setEditingMajlis(b.majlis);
  };

  const saveEdit = async (id: string) => {
    if (!editingTitle.trim()) return;
    try {
      await updateDoc(doc(db, 'books', id), {
        title: editingTitle.trim(),
        author: editingAuthor.trim() || 'কেন্দ্রীয় প্রচার ও প্রকাশনা বিভাগ',
        majlis: editingMajlis,
        updatedAt: serverTimestamp(),
      });
      setEditingId(null);
    } catch (err: any) {
      setModalConfig({
        isOpen: true,
        type: 'error',
        title: 'আপডেট ব্যর্থ',
        message: `আপডেট করতে ব্যর্থ: ${err.message}`,
        confirmText: 'ঠিক আছে',
        onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
      });
    }
  };

  // Filter books by search & majlis
  const filteredBooks = books.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          b.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMajlis = selectedMajlisFilter === 'সকল' || b.majlis === selectedMajlisFilter;
    return matchesSearch && matchesMajlis;
  });

  // Pagination calculations
  const totalItems = filteredBooks.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstItem, indexOfLastItem);

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

      {/* Header & Upload Action Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ color: '#F8FAFC', fontSize: '28px', fontWeight: 'bold' }}>বই ও প্রকাশনা রিসোর্স</h1>
          <p style={{ color: '#94A3B8', marginTop: '6px' }}>মোবাইল অ্যাপে প্রদর্শন করার জন্য অফিশিয়াল সাহিত্য ও ফাইল তালিকা</p>
        </div>

        <Link
          href="/resources/upload"
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
          <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: '18px' }} />
          <span>নতুন বই আপলোড করুন</span>
        </Link>
      </div>

      {/* Main Full-Width Resources List Card */}
      <div className="card">
        {/* Search & Majlis Filter Toolbar */}
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
              placeholder="বইয়ের নাম বা লেখক দিয়ে খুঁজুন..."
              style={{ width: '100%', padding: '12px 14px 12px 42px', fontSize: '14px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['সকল', 'খেলাফত মজলিস', 'ইসলামী যুব মজলিস', 'বাংলাদেশ ইসলামী ছাত্র মজলিস', 'ইসলামী শ্রমিক মজলিস', 'বাংলাদেশ ইসলামী মহিলা মজলিস'].map((maj) => (
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

        {/* Books Grid/List View */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-light)' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '28px', color: '#10B981', marginBottom: '12px' }}></i>
            <p>বই ও সাহিত্য লোড হচ্ছে...</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', minHeight: '300px' }}>
            {currentBooks.map((book) => (
              <div 
                key={book.id} 
                className="resource-item" 
                style={{ 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '16px', 
                  padding: '18px 20px', 
                  background: 'rgba(30, 41, 59, 0.4)',
                  transition: 'all 0.2s ease'
                }}
              >
                {editingId === book.id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      placeholder="বইয়ের নাম"
                      style={{ padding: '10px 14px', border: '1px solid #10B981', borderRadius: '8px', fontSize: '14px' }}
                    />
                    <input
                      type="text"
                      value={editingAuthor}
                      onChange={(e) => setEditingAuthor(e.target.value)}
                      placeholder="লেখক"
                      style={{ padding: '10px 14px', border: '1px solid #10B981', borderRadius: '8px', fontSize: '14px' }}
                    />
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '6px' }}>
                      <button onClick={() => saveEdit(book.id)} className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '13px' }}>
                        সেভ করুন
                      </button>
                      <button onClick={() => setEditingId(null)} className="btn" style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#F8FAFC', padding: '8px 20px', fontSize: '13px' }}>
                        বাতিল
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: '16px', flex: 1, alignItems: 'center' }}>
                      <div style={{ 
                        width: '50px', 
                        height: '50px', 
                        background: 'rgba(239, 68, 68, 0.15)', 
                        borderRadius: '14px', 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        flexShrink: 0,
                        border: '1px solid rgba(239, 68, 68, 0.3)'
                      }}>
                        <i className="fa-solid fa-file-pdf" style={{ color: '#EF4444', fontSize: '24px' }}></i>
                      </div>
                      <div>
                        <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#F8FAFC', margin: 0 }}>{book.title}</h4>
                        <p style={{ fontSize: '13px', color: '#94A3B8', marginTop: '4px', fontWeight: '500' }}>
                          <i className="fa-solid fa-pen-nib" style={{ fontSize: '11px', marginRight: '4px' }} /> {book.author}
                        </p>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px', fontSize: '12px', color: '#94A3B8' }}>
                          <span style={{ background: 'rgba(14, 165, 233, 0.15)', color: '#38BDF8', padding: '3px 10px', borderRadius: '6px', fontWeight: 'bold' }}>
                            {book.majlis}
                          </span>
                          <span>• {book.pages}</span>
                          <span>• {book.size}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', flexShrink: 0, alignItems: 'center' }}>
                      {book.pdfUrl && (
                        <a
                          href={book.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ 
                            color: '#10B981', 
                            background: 'rgba(16, 185, 129, 0.15)', 
                            borderRadius: '10px', 
                            padding: '8px 14px', 
                            fontSize: '13px', 
                            fontWeight: 'bold', 
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <i className="fa-solid fa-arrow-up-right-from-square" /> দেখুন
                        </a>
                      )}
                      <button
                        onClick={() => startEdit(book)}
                        style={{ color: '#38BDF8', background: 'rgba(14, 165, 233, 0.15)', border: 'none', borderRadius: '10px', padding: '8px 14px', cursor: 'pointer', fontWeight: '600' }}
                        title="এডিট"
                      >
                        <i className="fa-solid fa-pen-to-square" />
                      </button>
                      <button
                        onClick={() => handleDeleteBookRequest(book)}
                        style={{ color: '#FCA5A5', background: 'rgba(239, 68, 68, 0.15)', border: 'none', borderRadius: '10px', padding: '8px 14px', cursor: 'pointer', fontWeight: '600' }}
                        title="মুছে ফেলুন"
                      >
                        <i className="fa-solid fa-trash" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {filteredBooks.length === 0 && (
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
                  <i className="fa-solid fa-folder-open" />
                </div>
                <h3 style={{ color: '#F8FAFC', fontSize: '16px', fontWeight: 'bold', marginBottom: '6px' }}>
                  কোনো বই বা প্রকাশনা পাওয়া যায়নি
                </h3>
                <p style={{ fontSize: '13px', maxWidth: '340px', margin: '0 auto 16px auto', color: '#94A3B8', lineHeight: '1.5' }}>
                  উপরে "নতুন বই আপলোড করুন" বাটনে ক্লিক করে নতুন পিডিএফ প্রকাশনা যুক্ত করুন।
                </p>
                <Link
                  href="/resources/upload"
                  className="btn btn-primary"
                  style={{ padding: '10px 20px', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
                >
                  <i className="fa-solid fa-cloud-arrow-up" />
                  <span>নতুন বই আপলোড করুন</span>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', flexWrap: 'wrap', gap: '10px' }}>
            <p style={{ color: 'var(--text-light)', fontSize: '13px' }}>
              মোট {totalItems} টি রিসোর্সের মধ্যে {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, totalItems)} দেখানো হচ্ছে
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
