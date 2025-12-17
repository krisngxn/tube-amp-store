'use client';

import { useState, useRef } from 'react';
import styles from './page.module.css';

interface DepositProofUploadProps {
    orderCode: string;
    token: string;
    initialProofStatus?: {
        id: string;
        status: 'pending' | 'approved' | 'rejected';
        submittedAt: string;
        reviewNote?: string;
        imageCount: number;
    } | null;
    canUpload: boolean;
    cannotUploadReason?: string;
    translations: {
        title: string;
        subtitle: string;
        dropzoneText: string;
        dropzoneHint: string;
        noteLabel: string;
        notePlaceholder: string;
        uploadButton: string;
        uploading: string;
        successMessage: string;
        errorMessage: string;
        statusPending: string;
        statusApproved: string;
        statusRejected: string;
        rejectionNote: string;
        submittedAt: string;
        cannotUpload: string;
        reuploadButton: string;
        maxFiles: string;
        maxSize: string;
        allowedTypes: string;
    };
    locale: string;
}

export default function DepositProofUpload({
    orderCode,
    token,
    initialProofStatus,
    canUpload,
    cannotUploadReason,
    translations: t,
    locale,
}: DepositProofUploadProps) {
    const [proofStatus, setProofStatus] = useState(initialProofStatus);
    const [files, setFiles] = useState<File[]>([]);
    const [note, setNote] = useState('');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const MAX_FILES = 3;
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
    
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };
    
    const handleFileSelect = (selectedFiles: FileList | null) => {
        if (!selectedFiles) return;
        
        const newFiles = Array.from(selectedFiles).slice(0, MAX_FILES - files.length);
        
        // Validate files
        const validFiles: File[] = [];
        for (const file of newFiles) {
            if (!ALLOWED_TYPES.includes(file.type)) {
                setError(`${file.name}: ${t.allowedTypes}`);
                continue;
            }
            if (file.size > MAX_SIZE) {
                setError(`${file.name}: ${t.maxSize}`);
                continue;
            }
            validFiles.push(file);
        }
        
        if (validFiles.length > 0) {
            setFiles(prev => [...prev, ...validFiles].slice(0, MAX_FILES));
            setError(null);
        }
    };
    
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        handleFileSelect(e.dataTransfer.files);
    };
    
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(true);
    };
    
    const handleDragLeave = () => {
        setDragOver(false);
    };
    
    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };
    
    const handleUpload = async () => {
        if (files.length === 0) return;
        
        setUploading(true);
        setError(null);
        setSuccess(false);
        
        try {
            const formData = new FormData();
            files.forEach(file => formData.append('files', file));
            if (note.trim()) {
                formData.append('note', note.trim());
            }
            
            const response = await fetch(`/api/order/upload-proof/${orderCode}?t=${token}`, {
                method: 'POST',
                body: formData,
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || t.errorMessage);
            }
            
            setSuccess(true);
            setFiles([]);
            setNote('');
            
            // Update proof status
            setProofStatus({
                id: result.proofId,
                status: 'pending',
                submittedAt: new Date().toISOString(),
                imageCount: files.length,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : t.errorMessage);
        } finally {
            setUploading(false);
        }
    };
    
    // If proof is already approved, show success state
    if (proofStatus?.status === 'approved') {
        return (
            <div className={styles.proofSection}>
                <h3>{t.title}</h3>
                <div className={styles.proofStatusApproved}>
                    <div className={styles.statusIcon}>✓</div>
                    <p>{t.statusApproved}</p>
                </div>
            </div>
        );
    }
    
    // If there's a pending proof, show waiting state
    if (proofStatus?.status === 'pending') {
        return (
            <div className={styles.proofSection}>
                <h3>{t.title}</h3>
                <div className={styles.proofStatusPending}>
                    <div className={styles.statusIcon}>⏳</div>
                    <p>{t.statusPending}</p>
                    <p className={styles.submittedAt}>
                        {t.submittedAt}: {formatDate(proofStatus.submittedAt)}
                    </p>
                </div>
            </div>
        );
    }
    
    // If proof was rejected, show rejection and allow re-upload
    const showRejection = proofStatus?.status === 'rejected';
    
    // If cannot upload (and no rejection), show reason
    if (!canUpload && !showRejection) {
        return (
            <div className={styles.proofSection}>
                <h3>{t.title}</h3>
                <div className={styles.proofCannotUpload}>
                    <p>{t.cannotUpload}</p>
                    {cannotUploadReason && <p className={styles.reasonText}>{cannotUploadReason}</p>}
                </div>
            </div>
        );
    }
    
    return (
        <div className={styles.proofSection}>
            <h3>{t.title}</h3>
            <p className={styles.proofSubtitle}>{t.subtitle}</p>
            
            {/* Rejection notice */}
            {showRejection && (
                <div className={styles.rejectionNotice}>
                    <p><strong>{t.statusRejected}</strong></p>
                    {proofStatus.reviewNote && (
                        <p className={styles.rejectionNote}>
                            {t.rejectionNote}: {proofStatus.reviewNote}
                        </p>
                    )}
                </div>
            )}
            
            {/* Success message */}
            {success && (
                <div className={styles.proofSuccess}>
                    <p>{t.successMessage}</p>
                </div>
            )}
            
            {/* Error message */}
            {error && (
                <div className={styles.proofError}>
                    <p>{error}</p>
                </div>
            )}
            
            {/* File drop zone */}
            <div
                className={`${styles.dropzone} ${dragOver ? styles.dropzoneActive : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className={styles.fileInput}
                />
                <div className={styles.dropzoneContent}>
                    <div className={styles.dropzoneIcon}>📷</div>
                    <p>{t.dropzoneText}</p>
                    <p className={styles.dropzoneHint}>
                        {t.dropzoneHint}<br />
                        {t.maxFiles} • {t.maxSize}
                    </p>
                </div>
            </div>
            
            {/* Selected files preview */}
            {files.length > 0 && (
                <div className={styles.selectedFiles}>
                    {files.map((file, index) => (
                        <div key={index} className={styles.selectedFile}>
                            <img
                                src={URL.createObjectURL(file)}
                                alt={`Preview ${index + 1}`}
                                className={styles.filePreview}
                            />
                            <span className={styles.fileName}>{file.name}</span>
                            <button
                                type="button"
                                className={styles.removeFile}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeFile(index);
                                }}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}
            
            {/* Note field */}
            <div className={styles.noteField}>
                <label>{t.noteLabel}</label>
                <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={t.notePlaceholder}
                    rows={2}
                    disabled={uploading}
                />
            </div>
            
            {/* Upload button */}
            <button
                type="button"
                className={`btn btn-primary ${styles.uploadButton}`}
                onClick={handleUpload}
                disabled={files.length === 0 || uploading}
            >
                {uploading ? t.uploading : (showRejection ? t.reuploadButton : t.uploadButton)}
            </button>
        </div>
    );
}

