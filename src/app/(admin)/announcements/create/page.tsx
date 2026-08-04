'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import CustomModal from '@/components/CustomModal';

export default function AnnouncementCreate() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [description, setDescription] = useState('');
  const [targetMajlis, setTargetMajlis] = useState('সকল');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'confirm';
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setModalConfig({
        isOpen: true,
        type: 'error',
        title: 'তথ্য অসম্পূর্ণ',
        message: 'অনুগ্রহ করে শিরোনাম ও বিস্তারিত বিবরণ ইনপুট দিন।',
        onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create document in Firestore `notifications` collection
      const newDocRef = await addDoc(collection(db, 'notifications'), {
        title: title.trim(),
        description: description.trim(),
        link: link.trim(),
        targetMajlis,
        createdAt: serverTimestamp()
      });

      // 2. Trigger FCM Push Notification to all subscribed devices
      try {
        await fetch('/api/send-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim(),
            link: link.trim(),
            targetMajlis,
            docId: newDocRef.id,
          }),
        });
      } catch (fcmErr) {
        console.warn('FCM Push notification warning:', fcmErr);
      }

      // Show Custom Glassmorphic Success Modal
      setModalConfig({
        isOpen: true,
        type: 'success',
        title: 'নোটিফিকেশন পাঠানো হয়েছে!',
        message: 'নোটিফিকেশনটি সফলভাবে তৈরি হয়েছে এবং সকল অ্যাপ ব্যবহারকারীর কাছে পুশ নোটিফিকেশন হিসেবে রিলিজ করা হয়েছে।',
        onConfirm: () => {
          setModalConfig(prev => ({ ...prev, isOpen: false }));
          router.push('/announcements');
        }
      });
    } catch (err: any) {
      console.error('Error sending announcement:', err);
      setModalConfig({
        isOpen: true,
        type: 'error',
        title: 'ব্যর্থ হয়েছে',
        message: `নোটিফিকেশন পাঠাতে সমস্যা হয়েছে: ${err.message || 'অজ্ঞাত ত্রুটি'}`,
        onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Custom Glassmorphic Confirmation/Alert Modal */}
      <CustomModal
        isOpen={modalConfig.isOpen}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        onConfirm={modalConfig.onConfirm}
      />

      {/* Back Button & Header */}
      <div style={{ marginBottom: '24px' }}>
        <Link 
          href="/announcements"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: '#10B981',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 600,
            marginBottom: '12px'
          }}
        >
          <i className="fa-solid fa-arrow-left" />
          <span>ঘোষণা তালিকায় ফিরে যান</span>
        </Link>
        <h1 style={{ color: '#F8FAFC', fontSize: '28px', fontWeight: 'bold' }}>নতুন নোটিফিকেশন ও ঘোষণা তৈরি করুন</h1>
        <p style={{ color: '#94A3B8', marginTop: '6px' }}>মোবাইল অ্যাপ ব্যবহারকারীদের কাছে পুশ নোটিফিকেশন পাঠান ও ইউনিভার্সাল ফিডে সেভ করুন</p>
      </div>

      {/* Form Card */}
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px', color: '#F8FAFC' }}>
              নোটিফিকেশনের শিরোনাম (Title) *
            </label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="যেমন: আগামী মাসিক সভার সময়সূচী..." 
              style={{ width: '100%', padding: '14px', fontSize: '14px' }} 
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px', color: '#F8FAFC' }}>
                লক্ষ্যভিত্তিক মজলিস (Target Group)
              </label>
              <select
                value={targetMajlis}
                onChange={(e) => setTargetMajlis(e.target.value)}
                style={{ width: '100%', padding: '14px', fontSize: '14px' }}
              >
                <option value="সকল">সকল ব্যবহারকারী (All App Users)</option>
                <option value="খেলাফত মজলিস">খেলাফত মজলিস</option>
                <option value="ইসলামী যুব মজলিস">ইসলামী যুব মজলিস</option>
                <option value="বাংলাদেশ ইসলামী ছাত্র মজলিস">বাংলাদেশ ইসলামী ছাত্র মজলিস</option>
                <option value="ইসলামী শ্রমিক মজলিস">ইসলামী শ্রমিক মজলিস</option>
                <option value="বাংলাদেশ ইসলামী মহিলা মজলিস">বাংলাদেশ ইসলামী মহিলা মজলিস</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px', color: '#F8FAFC' }}>
                ওয়েব লিংক (Optional)
              </label>
              <input 
                type="url" 
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="যেমন: https://example.com/details (যদি থাকে)" 
                style={{ width: '100%', padding: '14px', fontSize: '14px' }} 
              />
            </div>
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px', color: '#F8FAFC' }}>
              বিস্তারিত বিবরণ (Description / Body) *
            </label>
            <textarea 
              rows={5} 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="বিস্তারিত নোটিফিকেশন বর্ণনা লিখুন..." 
              style={{ width: '100%', padding: '14px', fontSize: '14px' }}
              required
            ></textarea>
          </div>

          <div style={{ display: 'flex', gap: '14px' }}>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{ flex: 1, height: '50px', fontSize: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
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
            <Link
              href="/announcements"
              className="btn"
              style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#F8FAFC', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', fontWeight: '600' }}
            >
              বাতিল
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
