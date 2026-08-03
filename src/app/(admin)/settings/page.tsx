'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

interface SocialLinkItem {
  active: boolean;
  url: string;
}

interface SocialLinksState {
  facebook: SocialLinkItem;
  youtube: SocialLinkItem;
  twitter: SocialLinkItem;
  website: SocialLinkItem;
  telegram: SocialLinkItem;
  whatsapp: SocialLinkItem;
}

interface MajlisInfo {
  id: string;
  name: string;
  badgeColor: string;
  icon: string;
}

const MAJLIS_LIST: MajlisInfo[] = [
  { id: 'khelafat', name: 'খেলাফত মজলিস', badgeColor: '#059669', icon: 'fa-mosque' },
  { id: 'jubo', name: 'ইসলামী যুব মজলিস', badgeColor: '#0284C7', icon: 'fa-user-ninja' },
  { id: 'chatro', name: 'বাংলাদেশ ইসলামী ছাত্র মজলিস', badgeColor: '#D97706', icon: 'fa-graduation-cap' },
  { id: 'labor', name: 'বাংলাদেশ ইসলামী শ্রমিক মজলিস', badgeColor: '#DC2626', icon: 'fa-helmet-safety' },
  { id: 'women', name: 'বাংলাদেশ ইসলামী মহিলা মজলিস', badgeColor: '#EC4899', icon: 'fa-person-dress' },
];

const DEFAULT_LINKS: Record<string, SocialLinksState> = {
  khelafat: {
    facebook: { active: true, url: 'https://facebook.com/groups/mojlish' },
    youtube: { active: true, url: 'https://youtube.com/mojlishofficial' },
    twitter: { active: false, url: 'https://x.com/mojlish' },
    website: { active: true, url: 'https://khelafatmojlish.com' },
    telegram: { active: false, url: '' },
    whatsapp: { active: false, url: '' },
  },
  jubo: {
    facebook: { active: true, url: 'https://facebook.com/islamijubomajlis' },
    youtube: { active: true, url: 'https://youtube.com/@islamijubomajlis' },
    twitter: { active: false, url: '' },
    website: { active: true, url: 'https://islamijubomajlis.org' },
    telegram: { active: false, url: '' },
    whatsapp: { active: false, url: '' },
  },
  chatro: {
    facebook: { active: true, url: 'https://facebook.com/chatromajlis' },
    youtube: { active: true, url: 'https://youtube.com/@chatromajlis' },
    twitter: { active: false, url: '' },
    website: { active: true, url: 'https://chatromajlis.org' },
    telegram: { active: false, url: '' },
    whatsapp: { active: false, url: '' },
  },
  labor: {
    facebook: { active: true, url: 'https://facebook.com/labormajlis' },
    youtube: { active: false, url: '' },
    twitter: { active: false, url: '' },
    website: { active: false, url: '' },
    telegram: { active: false, url: '' },
    whatsapp: { active: false, url: '' },
  },
  women: {
    facebook: { active: true, url: 'https://facebook.com/womenmajlis' },
    youtube: { active: false, url: '' },
    twitter: { active: false, url: '' },
    website: { active: false, url: '' },
    telegram: { active: false, url: '' },
    whatsapp: { active: false, url: '' },
  },
};

export default function Settings() {
  const [selectedMajlisId, setSelectedMajlisId] = useState<string>('khelafat');
  const [socialLinks, setSocialLinks] = useState<SocialLinksState>(DEFAULT_LINKS['khelafat']);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  const currentMajlis = MAJLIS_LIST.find(m => m.id === selectedMajlisId) || MAJLIS_LIST[0];

  // Real-time sync with Firestore `settings/social_links_${selectedMajlisId}`
  useEffect(() => {
    const docRef = doc(db, 'settings', `social_links_${selectedMajlisId}`);
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as SocialLinksState;
        setSocialLinks({
          facebook: data.facebook || DEFAULT_LINKS[selectedMajlisId].facebook,
          youtube: data.youtube || DEFAULT_LINKS[selectedMajlisId].youtube,
          twitter: data.twitter || DEFAULT_LINKS[selectedMajlisId].twitter,
          website: data.website || DEFAULT_LINKS[selectedMajlisId].website,
          telegram: data.telegram || { active: false, url: '' },
          whatsapp: data.whatsapp || { active: false, url: '' },
        });
      } else {
        setSocialLinks(DEFAULT_LINKS[selectedMajlisId] || DEFAULT_LINKS['khelafat']);
      }
    }, (err) => {
      console.error('Error loading social links from Firestore:', err);
    });

    return () => unsubscribe();
  }, [selectedMajlisId]);

  const toggleLink = (key: keyof SocialLinksState) => {
    if (!isEditing) return;
    setSocialLinks(prev => ({
      ...prev,
      [key]: { ...prev[key], active: !prev[key].active }
    }));
  };

  const handleUrlChange = (key: keyof SocialLinksState, url: string) => {
    if (!isEditing) return;
    setSocialLinks(prev => ({
      ...prev,
      [key]: { ...prev[key], url }
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditing) return;

    setIsSaving(true);
    setSuccessMessage('');
    try {
      await setDoc(doc(db, 'settings', `social_links_${selectedMajlisId}`), socialLinks);
      // Also update generic `social_links` doc if khelafat for backwards compatibility
      if (selectedMajlisId === 'khelafat') {
        await setDoc(doc(db, 'settings', 'social_links'), socialLinks);
      }
      setSuccessMessage(`${currentMajlis.name} এর সোশ্যাল মিডিয়া লিংক সফলভাবে আপডেট করা হয়েছে!`);
      setIsEditing(false);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      console.error('Error saving social links:', err);
      alert(`সেটিংস সেভ করতে সমস্যা হয়েছে: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: 'var(--text-dark)', fontSize: '28px', fontWeight: 'bold' }}>মজলিসভিত্তিক সোশ্যাল মিডিয়া সেটিংস</h1>
        <p style={{ color: 'var(--text-light)', marginTop: '6px' }}>প্রতিটি সংগঠনের নিজস্ব অফিসিয়াল সোশ্যাল মিডিয়া পেজ ও লিংক আলাদাভাবে কনফিগার করুন</p>
      </div>

      {/* 📌 Majlis Selection Tabs */}
      <div style={{
        display: 'flex',
        gap: '10px',
        overflowX: 'auto',
        paddingBottom: '12px',
        marginBottom: '24px',
      }}>
        {MAJLIS_LIST.map((majlis) => {
          const isSelected = majlis.id === selectedMajlisId;
          return (
            <button
              key={majlis.id}
              onClick={() => {
                setSelectedMajlisId(majlis.id);
                setIsEditing(false);
              }}
              style={{
                padding: '10px 18px',
                borderRadius: '12px',
                border: isSelected ? `2px solid ${majlis.badgeColor}` : '1px solid var(--border-color)',
                backgroundColor: isSelected ? `${majlis.badgeColor}22` : 'rgba(30, 41, 59, 0.4)',
                color: isSelected ? majlis.badgeColor : 'var(--text-light)',
                fontWeight: isSelected ? 700 : 500,
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
              }}
            >
              <i className={`fa-solid ${majlis.icon}`} style={{ color: majlis.badgeColor }} />
              <span>{majlis.name}</span>
            </button>
          );
        })}
      </div>

      {successMessage && (
        <div style={{
          maxWidth: '650px',
          margin: '0 auto 20px auto',
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid #10B981',
          color: '#10B981',
          padding: '12px 18px',
          borderRadius: '14px',
          fontWeight: 600,
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <i className="fa-solid fa-circle-check" style={{ fontSize: '18px' }} />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="card" style={{ maxWidth: '650px', margin: '0 auto' }}>
        {/* Header with Majlis Badge & Lock/Unlock Status */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{
                backgroundColor: currentMajlis.badgeColor,
                color: 'white',
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '6px'
              }}>
                {currentMajlis.name}
              </span>
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', color: '#F8FAFC', margin: 0 }}>
              <i className="fa-solid fa-share-nodes" style={{ color: currentMajlis.badgeColor }}></i> সোশ্যাল মিডিয়া লিংকসমূহ
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              fontSize: '12px',
              fontWeight: 700,
              padding: '4px 12px',
              borderRadius: '20px',
              backgroundColor: isEditing ? 'rgba(234, 179, 8, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              color: isEditing ? '#EAB308' : '#10B981',
              border: isEditing ? '1px solid rgba(234, 179, 8, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <i className={`fa-solid ${isEditing ? 'fa-lock-open' : 'fa-lock'}`} />
              {isEditing ? 'এডিটিং আনলকড' : 'সুরক্ষিত (লকড)'}
            </span>

            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-primary"
                style={{
                  backgroundColor: currentMajlis.badgeColor,
                  borderColor: currentMajlis.badgeColor,
                  padding: '8px 16px',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <i className="fa-solid fa-pen-to-square" />
                <span>এডিট করুন</span>
              </button>
            )}
          </div>
        </div>

        <p style={{ fontSize: '14px', color: 'var(--text-light)', marginBottom: '24px' }}>
          {isEditing 
            ? `${currentMajlis.name} এর জন্য প্রয়োজনীয় লিংক সংশোধন ও টগল অন/অফ করে নিচে সেভ করুন।`
            : `${currentMajlis.name} এর সোশ্যাল লিংক এডিট করতে "এডিট করুন" বাটনে ক্লিক করুন।`}
        </p>

        <form onSubmit={handleSave}>
          {/* Facebook */}
          <div style={cardStyle(isEditing)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <label style={labelStyle}>
                <i className="fa-brands fa-facebook" style={{ color: '#1877F2', fontSize: '20px' }}></i> ফেসবুক পেজ / গ্রুপ
              </label>
              <ToggleSwitch
                checked={socialLinks.facebook.active}
                onChange={() => toggleLink('facebook')}
                disabled={!isEditing}
              />
            </div>
            <input 
              type="url" 
              value={socialLinks.facebook.url} 
              onChange={(e) => handleUrlChange('facebook', e.target.value)}
              placeholder="ফেসবুক পেজ বা গ্রুপের URL লিংক লিখুন"
              style={inputStyle(isEditing, socialLinks.facebook.active)} 
              disabled={!isEditing || !socialLinks.facebook.active} 
            />
          </div>

          {/* YouTube */}
          <div style={cardStyle(isEditing)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <label style={labelStyle}>
                <i className="fa-brands fa-youtube" style={{ color: '#FF0000', fontSize: '20px' }}></i> ইউটিউব চ্যানেল
              </label>
              <ToggleSwitch
                checked={socialLinks.youtube.active}
                onChange={() => toggleLink('youtube')}
                disabled={!isEditing}
              />
            </div>
            <input 
              type="url" 
              value={socialLinks.youtube.url} 
              onChange={(e) => handleUrlChange('youtube', e.target.value)}
              placeholder="ইউটিউব চ্যানেলের URL লিংক লিখুন"
              style={inputStyle(isEditing, socialLinks.youtube.active)} 
              disabled={!isEditing || !socialLinks.youtube.active} 
            />
          </div>

          {/* Twitter / X */}
          <div style={cardStyle(isEditing)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <label style={labelStyle}>
                <i className="fa-brands fa-x-twitter" style={{ color: '#F8FAFC', fontSize: '20px' }}></i> এক্স (টুইটার)
              </label>
              <ToggleSwitch
                checked={socialLinks.twitter.active}
                onChange={() => toggleLink('twitter')}
                disabled={!isEditing}
              />
            </div>
            <input 
              type="url" 
              value={socialLinks.twitter.url} 
              onChange={(e) => handleUrlChange('twitter', e.target.value)}
              placeholder="টুইটার / X প্রফাইল লিংক লিখুন"
              style={inputStyle(isEditing, socialLinks.twitter.active)} 
              disabled={!isEditing || !socialLinks.twitter.active} 
            />
          </div>

          {/* Website */}
          <div style={cardStyle(isEditing)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <label style={labelStyle}>
                <i className="fa-solid fa-globe" style={{ color: currentMajlis.badgeColor, fontSize: '20px' }}></i> অফিসিয়াল ওয়েবসাইট
              </label>
              <ToggleSwitch
                checked={socialLinks.website.active}
                onChange={() => toggleLink('website')}
                disabled={!isEditing}
              />
            </div>
            <input 
              type="url" 
              value={socialLinks.website.url} 
              onChange={(e) => handleUrlChange('website', e.target.value)}
              placeholder="অফিসিয়াল ওয়েবসাইটের URL লিখুন"
              style={inputStyle(isEditing, socialLinks.website.active)} 
              disabled={!isEditing || !socialLinks.website.active} 
            />
          </div>

          {/* Telegram */}
          <div style={cardStyle(isEditing)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <label style={labelStyle}>
                <i className="fa-brands fa-telegram" style={{ color: '#24A1DE', fontSize: '20px' }}></i> টেলিগ্রাম চ্যানেল / গ্রুপ
              </label>
              <ToggleSwitch
                checked={socialLinks.telegram.active}
                onChange={() => toggleLink('telegram')}
                disabled={!isEditing}
              />
            </div>
            <input 
              type="url" 
              value={socialLinks.telegram.url} 
              onChange={(e) => handleUrlChange('telegram', e.target.value)}
              placeholder="টেলিগ্রাম চ্যানেল বা গ্রুপের লিংক লিখুন"
              style={inputStyle(isEditing, socialLinks.telegram.active)} 
              disabled={!isEditing || !socialLinks.telegram.active} 
            />
          </div>

          {/* WhatsApp */}
          <div style={cardStyle(isEditing)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <label style={labelStyle}>
                <i className="fa-brands fa-whatsapp" style={{ color: '#25D366', fontSize: '20px' }}></i> হোয়াটসঅ্যাপ চ্যানেল / গ্রুপ
              </label>
              <ToggleSwitch
                checked={socialLinks.whatsapp.active}
                onChange={() => toggleLink('whatsapp')}
                disabled={!isEditing}
              />
            </div>
            <input 
              type="url" 
              value={socialLinks.whatsapp.url} 
              onChange={(e) => handleUrlChange('whatsapp', e.target.value)}
              placeholder="হোয়াটসঅ্যাপ গ্রুপ বা চ্যানেলের লিংক লিখুন"
              style={inputStyle(isEditing, socialLinks.whatsapp.active)} 
              disabled={!isEditing || !socialLinks.whatsapp.active} 
            />
          </div>

          {/* Action Buttons when unlocked */}
          {isEditing && (
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button 
                type="submit"
                disabled={isSaving}
                className="btn btn-primary" 
                style={{
                  flex: 1,
                  height: '48px',
                  backgroundColor: currentMajlis.badgeColor,
                  borderColor: currentMajlis.badgeColor,
                  fontSize: '15px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {isSaving ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin" />
                    <span>সেভ হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-floppy-disk" />
                    <span>{currentMajlis.name} সেটিংস সেভ করুন</span>
                  </>
                )}
              </button>
              <button 
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn" 
                style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#F8FAFC', padding: '0 20px', fontSize: '15px', fontWeight: '600' }}
              >
                বাতিল
              </button>
            </div>
          )}
        </form>
      </div>

      <style jsx global>{`
        input[type="checkbox"] {
          position: relative;
        }
        input[type="checkbox"]::before {
          content: "";
          position: absolute;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          top: 2px;
          left: 2px;
          background-color: white;
          transition: transform 0.2s;
        }
        input[type="checkbox"]:checked::before {
          transform: translateX(20px);
        }
      `}</style>
    </div>
  );
}

function ToggleSwitch({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        style={{
          width: '42px',
          height: '22px',
          appearance: 'none',
          backgroundColor: checked ? '#10B981' : 'rgba(255, 255, 255, 0.15)',
          borderRadius: '20px',
          position: 'relative',
          outline: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.65 : 1,
          transition: 'background-color 0.2s',
        }}
      />
      <span style={{ marginLeft: '10px', fontSize: '14px', fontWeight: '600', color: checked ? '#10B981' : 'var(--text-light)' }}>
        {checked ? 'চালু' : 'বন্ধ'}
      </span>
    </div>
  );
}

const cardStyle = (isEditing: boolean) => ({
  marginBottom: '20px',
  padding: '18px',
  border: isEditing ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-color)',
  borderRadius: '16px',
  background: isEditing ? 'rgba(16, 185, 129, 0.04)' : 'rgba(30, 41, 59, 0.4)',
  transition: 'all 0.25s ease'
});

const labelStyle = {
  fontWeight: 'bold' as const,
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  fontSize: '15px',
  color: '#F8FAFC'
};

const inputStyle = (isEditing: boolean, active: boolean) => ({
  width: '100%',
  padding: '12px',
  fontSize: '14px',
  opacity: isEditing && active ? 1 : 0.6
});
