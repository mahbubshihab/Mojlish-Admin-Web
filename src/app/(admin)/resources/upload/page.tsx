'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import CustomModal from '@/components/CustomModal';

export default function ResourceUpload() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [majlis, setMajlis] = useState('সকল');
  const [description, setDescription] = useState('');
  const [pages, setPages] = useState('');

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 MB';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setModalConfig({
        isOpen: true,
        type: 'error',
        title: 'শিরোনাম আবশ্যক',
        message: 'অনুগ্রহ করে বইয়ের শিরোনাম লিখুন।',
        onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      let finalPdfUrl = '';
      let fileSizeStr = '৩.৫ MB';

      if (selectedFile) {
        fileSizeStr = formatFileSize(selectedFile.size);
        const fileName = `${Date.now()}_${selectedFile.name.replace(/\s+/g, '_')}`;
        const storageRef = ref(storage, `books/${fileName}`);
        const uploadTask = uploadBytesResumable(storageRef, selectedFile);

        await new Promise<void>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
              setUploadProgress(progress);
            },
            (error) => {
              console.error('Storage upload failed:', error);
              reject(error);
            },
            async () => {
              finalPdfUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve();
            }
          );
        });
      }

      await addDoc(collection(db, 'books'), {
        title: title.trim(),
        author: author.trim() || 'কেন্দ্রীয় প্রচার ও প্রকাশনা বিভাগ',
        majlis,
        description: description.trim() || `${title.trim()} সংক্রান্ত প্রকাশনা`,
        pages: pages.trim() ? (pages.trim().endsWith('পৃষ্ঠা') ? pages.trim() : `${pages.trim()} পৃষ্ঠা`) : '৪০ পৃষ্ঠা',
        size: fileSizeStr,
        pdfUrl: finalPdfUrl,
        downloads: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setModalConfig({
        isOpen: true,
        type: 'success',
        title: 'আপলোড সম্পন্ন!',
        message: 'বইটি সফলভাবে আপলোড ও প্রকাশ করা হয়েছে।',
        onConfirm: () => {
          setModalConfig(prev => ({ ...prev, isOpen: false }));
          router.push('/resources');
        }
      });
    } catch (err: any) {
      console.error('Add book error:', err);
      setModalConfig({
        isOpen: true,
        type: 'error',
        title: 'আপলোড ব্যর্থ',
        message: `বই আপলোড করতে ব্যর্থ হয়েছে: ${err.message || 'অজ্ঞাত ত্রুটি'}`,
        onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Custom Glassmorphic Modal */}
      <CustomModal
        isOpen={modalConfig.isOpen}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        onConfirm={modalConfig.onConfirm}
      />

      {/* Back Button & Title Header */}
      <div style={{ marginBottom: '24px' }}>
        <Link 
          href="/resources"
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
          <span>রিসোর্স তালিকায় ফিরে যান</span>
        </Link>
        <h1 style={{ color: '#F8FAFC', fontSize: '28px', fontWeight: 'bold' }}>নতুন বই আপলোড</h1>
        <p style={{ color: '#94A3B8', marginTop: '6px' }}>পিডিএফ ফাইল ও বিস্তারিত তথ্য ইনপুট দিয়ে প্রকাশ করুন</p>
      </div>

      {/* Full Width Dedicated Upload Form Card */}
      <div className="card">
        <form onSubmit={handleAddBook}>
          {/* Custom Interactive Drag & Drop File Upload Box */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            style={{ 
              border: selectedFile ? '2px solid #10B981' : '2px dashed rgba(255, 255, 255, 0.2)', 
              borderRadius: '20px', 
              padding: '36px 24px', 
              textAlign: 'center', 
              marginBottom: '24px', 
              background: selectedFile ? 'rgba(16, 185, 129, 0.08)' : 'rgba(30, 41, 59, 0.4)',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              position: 'relative'
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setSelectedFile(e.target.files[0]);
                }
              }}
              style={{ display: 'none' }}
            />
            <i className={`fa-solid ${selectedFile ? 'fa-file-circle-check' : 'fa-cloud-arrow-up'}`} style={{ fontSize: '44px', color: selectedFile ? '#10B981' : '#0EA5E9', marginBottom: '14px' }}></i>
            <p style={{ fontSize: '15px', color: '#F8FAFC', fontWeight: '700' }}>
              {selectedFile ? selectedFile.name : 'পিডিএফ ফাইল আপলোড করতে এখানে ক্লিক করুন'}
            </p>
            <p style={{ fontSize: '13px', color: selectedFile ? '#10B981' : '#94A3B8', marginTop: '6px', fontWeight: selectedFile ? 'bold' : 'normal' }}>
              {selectedFile ? `সাইজ: ${formatFileSize(selectedFile.size)}` : 'বা ফাইল এখানে ড্র্যাগ ও ড্রপ করুন (পিডিএফ)'}
            </p>
            {selectedFile && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                }}
                style={{
                  marginTop: '14px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: '#FCA5A5',
                  border: 'none',
                  padding: '6px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <i className="fa-solid fa-xmark" /> ফাইল সরান
              </button>
            )}
          </div>

          {/* Progress Bar when uploading */}
          {isUploading && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                <span>আপলোড হচ্ছে...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div style={{ width: '100%', height: '10px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'linear-gradient(90deg, #10B981 0%, #0EA5E9 100%)', transition: 'width 0.2s' }}></div>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px', color: '#F8FAFC' }}>বইয়ের শিরোনাম *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="যেমন: খেলাফত ব্যবস্থা ও আধুনিক বিশ্ব"
                style={{ width: '100%', padding: '14px', fontSize: '14px' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px', color: '#F8FAFC' }}>লেখক / প্রকাশনা</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="যেমন: কেন্দ্রীয় প্রচার ও প্রকাশনা বিভাগ"
                style={{ width: '100%', padding: '14px', fontSize: '14px' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px', color: '#F8FAFC' }}>টার্গেট মজলিস</label>
              <select
                value={majlis}
                onChange={(e) => setMajlis(e.target.value)}
                style={{ width: '100%', padding: '14px', fontSize: '14px' }}
              >
                <option value="সকল">সকল মজলিস</option>
                <option value="খেলাফত মজলিস">খেলাফত মজলিস</option>
                <option value="ইসলামী যুব মজলিস">ইসলামী যুব মজলিস</option>
                <option value="বাংলাদেশ ইসলামী ছাত্র মজলিস">বাংলাদেশ ইসলামী ছাত্র মজলিস</option>
                <option value="বাংলাদেশ ইসলামী শ্রমিক মজলিস">বাংলাদেশ ইসলামী শ্রমিক মজলিস</option>
                <option value="বাংলাদেশ ইসলামী মহিলা মজলিস">বাংলাদেশ ইসলামী মহিলা মজলিস</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px', color: '#F8FAFC' }}>পৃষ্ঠা সংখ্যা</label>
              <input
                type="text"
                value={pages}
                onChange={(e) => setPages(e.target.value)}
                placeholder="যেমন: ৪৮ পৃষ্ঠা"
                style={{ width: '100%', padding: '14px', fontSize: '14px' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px', color: '#F8FAFC' }}>সংক্ষিপ্ত বিবরণ</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="বইটি সম্পর্কে সংক্ষিপ্ত বিবরণ লিখুন..."
              rows={4}
              style={{ width: '100%', padding: '14px', fontSize: '14px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '14px' }}>
            <button
              type="submit"
              disabled={isUploading}
              className="btn btn-primary"
              style={{ flex: 1, height: '50px', fontSize: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {isUploading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin" />
                  <span>আপলোড হচ্ছে ({uploadProgress}%)...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-cloud-arrow-up" />
                  <span>আপলোড করুন</span>
                </>
              )}
            </button>
            <Link
              href="/resources"
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
