'use client';

import { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  serverTimestamp, 
  query, 
  orderBy 
} from 'firebase/firestore';

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [description, setDescription] = useState('');
  const [targetMajlis, setTargetMajlis] = useState('সকল');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

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
      setErrorMessage('নোটিশ তালিকা লোড করতে সমস্যা হয়েছে।');
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Pagination calculations
  const totalItems = announcements.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = announcements.slice(indexOfFirstItem, indexOfLastItem);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      // 1. Create document in Firestore `notifications` collection
      const newDocRef = await addDoc(collection(db, 'notifications'), {
        title: title.trim(),
        description: description.trim(),
        link: link.trim(),
        targetMajlis,
        sentBy: auth.currentUser?.email || 'magician290@gmail.com',
        createdAt: serverTimestamp()
      });

      setSuccessMessage('নোটিফিকেশন সফলভাবে পাঠানো হয়েছে এবং ইউনিভার্সাল ডাটাবেজে সংরক্ষণ করা হয়েছে!');
      setTitle('');
      setLink('');
      setDescription('');
      setTargetMajlis('সকল');
      setCurrentPage(1);
    } catch (err: any) {
      console.error('Error sending announcement:', err);
      setErrorMessage('নোটিফিকেশন পাঠাতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('আপনি কি নিশ্চিত যে এই নোটিশটি মুছে ফেলতে চান?')) return;

    try {
      await deleteDoc(doc(db, 'notifications', id));
      if (announcements.length - 1 <= (currentPage - 1) * itemsPerPage && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      }
    } catch (err) {
      console.error('Error deleting notice:', err);
      alert('নোটিশটি মুছে ফেলা সম্ভব হয়নি।');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: 'var(--text-dark)', fontSize: '28px', fontWeight: 'bold' }}>ঘোষণা ও ডাইনামিক নোটিফিকেশন প্যানেল</h1>
        <p style={{ color: 'var(--text-light)', marginTop: '8px' }}>মোবাইল অ্যাপে ডাইনামিক নোটিফিকেশন ও ঘোষণা পাঠানোর মাধ্যম</p>
      </div>

      {successMessage && (
        <div style={{
          backgroundColor: '#DCFCE7',
          color: '#15803D',
          border: '1px solid #86EFAC',
          padding: '14px 18px',
          borderRadius: '10px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: 600
        }}>
          <i className="fa-solid fa-circle-check" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div style={{
          backgroundColor: '#FEE2E2',
          color: '#B91C1C',
          border: '1px solid #FCA5A5',
          padding: '14px 18px',
          borderRadius: '10px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: 600
        }}>
          <i className="fa-solid fa-triangle-exclamation" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid-2">
        {/* Form section */}
        <div className="card" style={{ height: 'fit-content' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-paper-plane" style={{ color: 'var(--primary-color)' }}></i> নতুন নোটিফিকেশন তৈরি করুন
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>নোটিফিকেশনের শিরোনাম (Title) *</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="যেমন: আগামী মাসিক সভার সময়সূচী..." 
                style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px' }} 
                required
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>লক্ষ্যভিত্তিক মজলিস (Target Group)</label>
              <select
                value={targetMajlis}
                onChange={(e) => setTargetMajlis(e.target.value)}
                style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', backgroundColor: 'white' }}
              >
                <option value="সকল">সকল ব্যবহারকারী (All App Users)</option>
                <option value="খেলাফত মজলিস">খেলাফত মজলিস</option>
                <option value="ছাত্র মজলিস">বাংলাদেশ ইসলামী ছাত্র মজলিস</option>
                <option value="যুব মজলিস">বাংলাদেশ ইসলামী যুব মজলিস</option>
                <option value="শ্রমিক মজলিস">বাংলাদেশ ইসলামী শ্রমিক মজলিস</option>
                <option value="মহিলা মজলিস">খেলাফত মহিলা মজলিস</option>
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>ওয়েব লিংক (Optional)</label>
              <input 
                type="url" 
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="যেমন: https://example.com/details (যদি থাকে)" 
                style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px' }} 
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>বিস্তারিত বিবরণ (Description / Body) *</label>
              <textarea 
                rows={4} 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="বিস্তারিত নোটিফিকেশন বর্ণনা লিখুন..." 
                style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px' }}
                required
              ></textarea>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="btn btn-primary" 
              style={{ width: '100%', height: '48px', fontSize: '15px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {isSubmitting ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin" />
                  <span>পাঠানো হচ্ছে...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-paper-plane" />
                  <span>নোটিফিকেশন ও ঘোষণা পাঠান</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* List section with pagination */}
        <div className="card">
          <h2 style={{ fontSize: '18px', marginBottom: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-bell" style={{ color: 'var(--primary-color)' }}></i> ইউনিভার্সাল নোটিফিকেশন হিস্ট্রি
          </h2>

          {isLoading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-light)' }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '24px', marginBottom: '10px' }} />
              <p>লোডিং হচ্ছে...</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', minHeight: '300px' }}>
              {currentItems.map((item) => (
                <div key={item.id} style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '5px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <i className="fa-regular fa-calendar" /> {item.createdAt}
                      <span style={{ backgroundColor: '#E0F2FE', color: '#0369A1', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}>
                        {item.targetMajlis}
                      </span>
                    </span>
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '6px', color: 'var(--text-dark)' }}>{item.title}</h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-light)', lineHeight: '1.5', marginBottom: item.link ? '10px' : '0' }}>{item.description}</p>
                  {item.link && (
                    <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', color: 'var(--primary-color)', textDecoration: 'none', fontWeight: '600' }}>
                      <i className="fa-solid fa-link" /> বিস্তারিত লিংক দেখুন
                    </a>
                  )}
                  
                  <button 
                    onClick={() => handleDelete(item.id)}
                    style={{ position: 'absolute', top: '16px', right: '16px', color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', padding: '6px' }}
                    title="মুছে ফেলুন"
                  >
                    <i className="fa-solid fa-trash" />
                  </button>
                </div>
              ))}

              {announcements.length === 0 && (
                <p style={{ color: 'var(--text-light)', fontSize: '14px', textAlign: 'center', padding: '40px' }}>কোনো নোটিফিকেশন পাওয়া যায়নি।</p>
              )}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <p style={{ color: 'var(--text-light)', fontSize: '13px' }}>
                মোট {totalItems} টির মধ্যে {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, totalItems)} দেখানো হচ্ছে
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="btn"
                  style={{ background: '#f1f5f9', padding: '6px 12px', fontSize: '13px', color: currentPage === 1 ? '#cbd5e1' : 'var(--text-dark)', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                >
                  <i className="fa-solid fa-chevron-left" /> পূর্ববর্তী
                </button>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="btn"
                  style={{ background: '#f1f5f9', padding: '6px 12px', fontSize: '13px', color: currentPage === totalPages || totalPages === 0 ? '#cbd5e1' : 'var(--text-dark)', cursor: currentPage === totalPages || totalPages === 0 ? 'not-allowed' : 'pointer' }}
                >
                  পরবর্তী <i className="fa-solid fa-chevron-right" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
