import React, { useEffect, useMemo, useState } from 'react';
import type { TeamMember } from '@shared/types';
import { createTeamMember } from '../services/teamMembers';
import { uploadTeamMemberImage } from '../services/storage';

interface TeamMemberAdminModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: (member: TeamMember) => void;
}

const TeamMemberAdminModal: React.FC<TeamMemberAdminModalProps> = ({ open, onClose, onSaved }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [bio, setBio] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const previewUrl = useMemo(() => {
    if (imageFile) return URL.createObjectURL(imageFile);
    return imageUrl.trim();
  }, [imageFile, imageUrl]);

  useEffect(() => {
    return () => {
      if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!open) return;
    setName('');
    setRole('');
    setBio('');
    setImageUrl('');
    setImageFile(null);
    setErrorMessage('');
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    try {
      if (!imageFile && !imageUrl.trim()) throw new Error('Vui lòng chọn ảnh hoặc nhập đường dẫn ảnh.');
      const resolvedImage = imageFile ? await uploadTeamMemberImage(imageFile, name) : imageUrl.trim();
      const nextMember: Omit<TeamMember, 'id'> = {
        name: name.trim(),
        role: role.trim(),
        bio: bio.trim(),
        image: resolvedImage,
        color: 'rgba(255, 255, 255, 0.15)',
      };
      const savedMember = await createTeamMember(nextMember);
      onSaved(savedMember);
      onClose();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Không thể thêm thành viên.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="team-admin-backdrop" onClick={onClose}>
      <section className="team-admin-modal" onClick={(event) => event.stopPropagation()}>
        <header className="team-admin-header">
          <div>
            <span>Future Studio CMS</span>
            <h2>Thêm thành viên</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng">×</button>
        </header>

        <form className="team-admin-form" onSubmit={handleSubmit}>
          <div className="team-admin-preview">
            {previewUrl ? <img src={previewUrl} alt="Xem trước thành viên" /> : <span>Ảnh xem trước</span>}
          </div>

          <div className="team-admin-fields">
            <label>Họ và tên<input value={name} onChange={(event) => setName(event.target.value)} required /></label>
            <label>Chức vụ<input value={role} onChange={(event) => setRole(event.target.value)} required /></label>
            <label>Giới thiệu<textarea rows={5} value={bio} onChange={(event) => setBio(event.target.value)} required /></label>
            <label className="team-admin-file-field">
              Ảnh từ máy tính
              <input type="file" accept="image/*" onChange={(event) => setImageFile(event.target.files?.[0] ?? null)} />
              <span>{imageFile ? imageFile.name : 'Chọn một ảnh'}</span>
            </label>
            <label>Hoặc URL ảnh<input type="url" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="https://..." /></label>
            {errorMessage && <p className="team-admin-error">{errorMessage}</p>}
            <button className="team-admin-submit" type="submit" disabled={submitting}>
              {submitting ? 'Đang tải ảnh và lưu...' : 'Thêm thành viên'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default TeamMemberAdminModal;
