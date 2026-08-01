'use client';
import { useState, useEffect } from 'react';
import { db, storage } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  serverTimestamp, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';

interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
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

  // Form states for new book upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('সাংগঠনিক সাহিত্য');
  const [majlis, setMajlis] = useState('সকল');
  const [description, setDescription] = useState('');
  const [pages, setPages] = useState('');
  
  // Upload status
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingAuthor, setEditingAuthor] = useState('');
  const [editingCategory, setEditingCategory] = useState('সাংগঠনিক সাহিত্য');
  const [editingMajlis, setEditingMajlis] = useState('সকল');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
            category: data.category || 'সাংগঠনিক সাহিত্য',
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

  // Format file size to human readable MB
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 MB';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  // Upload PDF & Create Firestore Metadata Document
  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('অনুগ্রহ করে বইয়ের নাম লিখুন');
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

      // Add Metadata to Firestore
      await addDoc(collection(db, 'books'), {
        title: title.trim(),
        author: author.trim() || 'কেন্দ্রীয় প্রচার ও প্রকাশনা বিভাগ',
        category,
        majlis,
        description: description.trim() || `${title.trim()} সংক্রান্ত প্রকাশনা`,
        pages: pages.trim() ? (pages.trim().endsWith('পৃষ্ঠা') ? pages.trim() : `${pages.trim()} পৃষ্ঠা`) : '৪০ পৃষ্ঠা',
        size: fileSizeStr,
        pdfUrl: finalPdfUrl,
        downloads: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Reset form
      setTitle('');
      setAuthor('');
      setCategory('সাংগঠনিক সাহিত্য');
      setMajlis('সকল');
      setDescription('');
      setPages('');
      setSelectedFile(null);
      setUploadProgress(0);
      alert('বইটি সফলভাবে ফায়ারবেসে আপলোড ও সংরক্ষিত হয়েছে!');
    } catch (err: any) {
      console.error('Add book error:', err);
      alert(`বই আপলোড করতে ব্যর্থ হয়েছে: ${err.message || 'অজ্ঞাত ত্রুটি'}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Delete book doc from Firestore and file from Storage
  const handleDeleteBook = async (book: Book) => {
    if (!confirm(`আপনি কি নিশ্চিত যে "${book.title}" মুছে ফেলতে চান?`)) return;

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
      alert(`বই মুছে ফেলতে ব্যর্থ: ${err.message}`);
    }
  };

  // Edit inline save
  const startEdit = (b: Book) => {
    setEditingId(b.id);
    setEditingTitle(b.title);
    setEditingAuthor(b.author);
    setEditingCategory(b.category);
    setEditingMajlis(b.majlis);
  };

  const saveEdit = async (id: string) => {
    if (!editingTitle.trim()) return;
    try {
      await updateDoc(doc(db, 'books', id), {
        title: editingTitle.trim(),
        author: editingAuthor.trim() || 'কেন্দ্রীয় প্রচার ও প্রকাশনা বিভাগ',
        category: editingCategory,
        majlis: editingMajlis,
        updatedAt: serverTimestamp(),
      });
      setEditingId(null);
    } catch (err: any) {
      alert(`আপডেট করতে ব্যর্থ: ${err.message}`);
    }
  };

  // Pagination calculations
  const totalItems = books.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBooks = books.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: 'var(--text-dark)', fontSize: '28px', fontWeight: 'bold' }}>বই ও প্রকাশনা রিসোর্স ম্যানেজমেন্ট</h1>
        <p style={{ color: 'var(--text-light)', marginTop: '8px' }}>
          ফ্লটার অ্যাপের জন্য পিডিএফ ফাইলগুলো ফায়ার স্টোরেজে আপলোড করুন এবং মেটাডাটা ফায়ারস্টোরে ডাইনামিকভাবে সেভ করুন
        </p>
      </div>

      <div className="grid-2">
        {/* Upload Form Section */}
        <div className="card" style={{ height: 'fit-content' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-file-pdf" style={{ color: '#ef4444' }}></i> ফায়ারবেসে নতুন বই আপলোড
          </h2>

          <form onSubmit={handleAddBook}>
            {/* File upload drag & drop box */}
            <div style={{ border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '24px', textAlign: 'center', marginBottom: '20px', background: '#f8fafc' }}>
              <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: '36px', color: selectedFile ? '#059669' : '#94a3b8', marginBottom: '12px' }}></i>
              <p style={{ fontSize: '14px', color: 'var(--text-dark)', fontWeight: '600' }}>
                {selectedFile ? selectedFile.name : 'পিডিএফ ফাইল সিলেক্ট বা ড্র্যাগ করুন'}
              </p>
              {selectedFile && (
                <p style={{ fontSize: '12px', color: '#059669', marginTop: '4px', fontWeight: 'bold' }}>
                  সাইজ: {formatFileSize(selectedFile.size)}
                </p>
              )}
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0]);
                  }
                }}
                style={{ marginTop: '12px', fontSize: '13px' }}
              />
            </div>

            {/* Progress Bar when uploading */}
            {isUploading && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                  <span>ফায়ারে স্টোরেজে আপলোড হচ্ছে...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'var(--primary-color)', transition: 'width 0.2s' }}></div>
                </div>
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>বইয়ের শিরোনাম *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="যেমন: খেলাফত ব্যবস্থা ও আধুনিক বিশ্ব"
                style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px' }}
                required
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>লেখক / প্রকাশনা</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="যেমন: কেন্দ্রীয় প্রচার ও প্রকাশনা বিভাগ"
                style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>ক্যাটাগরি</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', background: 'white' }}
                >
                  <option value="সাংগঠনিক সাহিত্য">সাংগঠনিক সাহিত্য</option>
                  <option value="সিলেবাস ও পাঠ্যক্রম">সিলেবাস ও পাঠ্যক্রম</option>
                  <option value="ইসলামী দাওয়াত">ইসলামী দাওয়াত</option>
                  <option value="নীতিমালা ও নির্দেশিকা">নীতিমালা ও নির্দেশিকা</option>
                  <option value="সাধারণ">সাধারণ</option>
                </select>
              </div>

              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>টার্গেট মজলিস</label>
                <select
                  value={majlis}
                  onChange={(e) => setMajlis(e.target.value)}
                  style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', background: 'white' }}
                >
                  <option value="সকল">সকল মজলিস</option>
                  <option value="খেলাফত মজলিস">খেলাফত মজলিস</option>
                  <option value="ছাত্র মজলিস">ছাত্র মজলিস</option>
                  <option value="যুব মজলিস">যুব মজলিস</option>
                  <option value="মহিলা মজলিস">মহিলা মজলিস</option>
                  <option value="শ্রমিক মজলিস">শ্রমিক মজলিস</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>পৃষ্ঠা সংখ্যা</label>
              <input
                type="text"
                value={pages}
                onChange={(e) => setPages(e.target.value)}
                placeholder="যেমন: ৪৮ পৃষ্ঠা"
                style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px' }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>সংক্ষিপ্ত বিবরণ / সারসংক্ষেপ</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="বইটি সম্পর্কে সংক্ষিপ্ত বিবরণ লিখুন..."
                rows={3}
                style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px' }}
              />
            </div>

            <button
              type="submit"
              disabled={isUploading}
              className="btn btn-primary"
              style={{ width: '100%', height: '48px', fontSize: '15px', fontWeight: 'bold' }}
            >
              {isUploading ? 'আপলোড হচ্ছে...' : 'ফায়ারবেসে আপলোড করুন'}
            </button>
          </form>
        </div>

        {/* Books List Section */}
        <div className="card">
          <h2 style={{ fontSize: '18px', marginBottom: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-book-open" style={{ color: 'var(--primary-color)' }}></i> আপলোডকৃত বই ও মেটাডাটা
            <span style={{ fontSize: '12px', background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '12px', marginLeft: 'auto' }}>
              লাইভ ডাটা
            </span>
          </h2>

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '24px', marginBottom: '10px' }}></i>
              <p>ফায়ারস্টোর থেকে ডাটা লোড হচ্ছে...</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '300px' }}>
              {currentBooks.map((book) => (
                <div key={book.id} className="resource-item" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                  {editingId === book.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        placeholder="বইয়ের নাম"
                        style={{ padding: '8px 12px', border: '1px solid var(--primary-color)', borderRadius: '6px', fontSize: '14px' }}
                      />
                      <input
                        type="text"
                        value={editingAuthor}
                        onChange={(e) => setEditingAuthor(e.target.value)}
                        placeholder="লেখক"
                        style={{ padding: '8px 12px', border: '1px solid var(--primary-color)', borderRadius: '6px', fontSize: '14px' }}
                      />
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '6px' }}>
                        <button onClick={() => saveEdit(book.id)} className="btn btn-primary" style={{ padding: '6px 16px', fontSize: '13px' }}>
                          সেভ
                        </button>
                        <button onClick={() => setEditingId(null)} className="btn" style={{ background: '#f1f5f9', padding: '6px 16px', fontSize: '13px' }}>
                          বাতিল
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', gap: '12px' }}>
                      <div style={{ display: 'flex', gap: '14px', flex: 1 }}>
                        <div style={{ width: '44px', height: '44px', background: '#fee2e2', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                          <i className="fa-solid fa-file-pdf" style={{ color: '#ef4444', fontSize: '22px' }}></i>
                        </div>
                        <div>
                          <h4 style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--text-dark)' }}>{book.title}</h4>
                          <p style={{ fontSize: '13px', color: '#475569', marginTop: '2px', fontWeight: '500' }}>
                            <i className="fa-solid fa-pen-nib"></i> {book.author}
                          </p>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px', fontSize: '12px', color: '#64748b' }}>
                            <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold', color: '#0f172a' }}>
                              {book.category}
                            </span>
                            <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                              {book.majlis}
                            </span>
                            <span>• {book.pages}</span>
                            <span>• {book.size}</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                        {book.pdfUrl && (
                          <a
                            href={book.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#059669', background: '#ecfdf5', borderRadius: '6px', padding: '6px 10px', fontSize: '13px', fontWeight: 'bold', textDecoration: 'none' }}
                          >
                            <i className="fa-solid fa-arrow-up-right-from-square"></i> দেখুন
                          </a>
                        )}
                        <button
                          onClick={() => startEdit(book)}
                          style={{ color: '#0ea5e9', background: '#f0f9ff', border: 'none', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer' }}
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteBook(book)}
                          style={{ color: '#ef4444', background: '#fef2f2', border: 'none', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer' }}
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {books.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>
                  <i className="fa-solid fa-book-skull" style={{ fontSize: '36px', marginBottom: '10px' }}></i>
                  <p>ফায়ারস্টোরে কোনো বই পাওয়া যায়নি। বাম পাশের ফরমের মাধ্যমে আপলোড করুন।</p>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <p style={{ color: 'var(--text-light)', fontSize: '13px' }}>
              মোট {totalItems} টি রিসোর্সের মধ্যে {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, totalItems)} দেখানো হচ্ছে
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="btn"
                style={{ background: '#f1f5f9', padding: '6px 12px', fontSize: '13px', color: currentPage === 1 ? '#cbd5e1' : 'var(--text-dark)', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
              >
                <i className="fa-solid fa-chevron-left"></i> পূর্ববর্তী
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="btn"
                style={{ background: '#f1f5f9', padding: '6px 12px', fontSize: '13px', color: currentPage === totalPages || totalPages === 0 ? '#cbd5e1' : 'var(--text-dark)', cursor: currentPage === totalPages || totalPages === 0 ? 'not-allowed' : 'pointer' }}
              >
                পরবর্তী <i className="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
