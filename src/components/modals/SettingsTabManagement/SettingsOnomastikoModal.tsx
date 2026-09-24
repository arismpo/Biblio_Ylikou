'use client'

import React from 'react'

interface SettingsOnomastikoModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: () => void
    onDelete?: () => void
    editingOnomastiko: any
    name: string
    setName: (value: string) => void
    number: string
    setNumber: (value: string) => void
    page: string
    setPage: (value: string) => void
    infos: string
    setInfos: (value: string) => void
    highlighted: boolean
    setHighlighted: (value: boolean) => void
    darkMode: boolean
}

const SettingsOnomastikoModal: React.FC<SettingsOnomastikoModalProps> = ({
    isOpen,
    onClose,
    onSave,
    onDelete,
    editingOnomastiko,
    name,
    setName,
    number,
    setNumber,
    page,
    setPage,
    infos,
    setInfos,
    highlighted,
    setHighlighted,
    darkMode
}) => {
    if (!isOpen) return null

    const isNew = !editingOnomastiko

    // 🔥 INLINE STYLES - ΜΕΓΑΛΥΤΕΡΟ ΜΕΓΕΘΟΣ
    const overlayStyle: React.CSSProperties = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '20px'
    }

    const modalStyle: React.CSSProperties = {
        backgroundColor: darkMode ? '#1f2937' : '#ffffff',
        borderRadius: '12px',
        padding: '32px',  // 🔥 ΑΥΞΗΜΕΝΟ PADDING
        maxWidth: '768px', // 🔥 ΑΥΞΗΜΕΝΟ ΠΛΑΤΟΣ (από 512px σε 768px)
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        color: darkMode ? '#ffffff' : '#111827'
    }

    // 🔥 ΜΕΓΑΛΥΤΕΡΑ INPUTS
    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '10px 14px',  // 🔥 ΑΥΞΗΜΕΝΟ PADDING
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        backgroundColor: darkMode ? '#374151' : '#ffffff',
        color: darkMode ? '#ffffff' : '#111827',
        fontSize: '15px'  // 🔥 ΜΕΓΑΛΥΤΕΡΗ ΓΡΑΜΜΑΤΟΣΕΙΡΑ
    }

    const labelStyle: React.CSSProperties = {
        display: 'block',
        fontSize: '14px',
        fontWeight: '600',  // 🔥 BOLD
        marginBottom: '6px',
        color: darkMode ? '#d1d5db' : '#374151'
    }

    const textareaStyle: React.CSSProperties = {
        width: '100%',
        padding: '10px 14px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        backgroundColor: darkMode ? '#374151' : '#ffffff',
        color: darkMode ? '#ffffff' : '#111827',
        fontSize: '15px',
        minHeight: '100px',  // 🔥 ΜΕΓΑΛΥΤΕΡΟ TEXTAREA
        resize: 'vertical'
    }

    const buttonStyle = (color: string, hoverColor: string) => ({
        padding: '10px 20px',  // 🔥 ΜΕΓΑΛΥΤΕΡΑ ΚΟΥΜΠΙΑ
        borderRadius: '8px',
        border: 'none',
        backgroundColor: color,
        color: '#ffffff',
        cursor: 'pointer',
        fontSize: '15px',
        fontWeight: '500',
        transition: 'background-color 0.2s'
    })

    return (
        <div style={overlayStyle} onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
            <div style={modalStyle}>

                <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
                    {isNew ? '➕ Προσθήκη Ονομαστικού' : '✏️ Επεξεργασία Ονομαστικού'}
                </h3>

                {/* 🔥 GRID 2 ΣΤΗΛΕΣ ΓΙΑ ΚΑΛΥΤΕΡΗ ΧΡΗΣΗ ΧΩΡΟΥ */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                        <label style={labelStyle}>Όνομα *</label>
                        <input
                            type="text"
                            style={inputStyle}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>Αριθμός (προαιρετικό)</label>
                        <input
                            type="text"
                            style={inputStyle}
                            value={number}
                            onChange={(e) => setNumber(e.target.value)}
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>Σελίδα</label>
                        <input
                            type="number"
                            min="1"
                            style={inputStyle}
                            value={page}
                            onChange={(e) => setPage(e.target.value)}
                            placeholder="π.χ. 32"
                        />
                        <p style={{ fontSize: '12px', marginTop: '4px', color: darkMode ? '#9ca3af' : '#6b7280' }}>
                            Ο αριθμός σελίδας όπου εμφανίζεται αυτό το ονομαστικό
                        </p>
                    </div>

                    <div>
                        <label style={labelStyle}>Επισήμανση</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '8px' }}>
                            <input
                                type="checkbox"
                                checked={highlighted}
                                onChange={(e) => setHighlighted(e.target.checked)}
                                style={{ width: '18px', height: '18px' }}
                            />
                            <span style={{ fontSize: '14px', color: darkMode ? '#d1d5db' : '#374151' }}>
                                ✨ Κίτρινο φόντο στο βιβλίο υλικού
                            </span>
                        </div>
                    </div>
                </div>

                {/* Πληροφορίες - ΠΛΗΡΟΥΣ ΠΛΑΤΟΥΣ */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={labelStyle}>Πληροφορίες / Σημειώσεις</label>
                    <textarea
                        style={textareaStyle}
                        value={infos}
                        onChange={(e) => setInfos(e.target.value)}
                        placeholder="Προσθέστε πληροφορίες για αυτό το ονομαστικό..."
                    />
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
                    {!isNew && onDelete && (
                        <button
                            onClick={onDelete}
                            style={buttonStyle('#dc2626', '#b91c1c')}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                        >
                            🗑️ Διαγραφή
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: darkMode ? '#4b5563' : '#e5e7eb',
                            color: darkMode ? '#ffffff' : '#111827',
                            cursor: 'pointer',
                            fontSize: '15px',
                            fontWeight: '500',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = darkMode ? '#6b7280' : '#d1d5db'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = darkMode ? '#4b5563' : '#e5e7eb'}
                    >
                        Ακύρωση
                    </button>
                    <button
                        onClick={onSave}
                        style={{
                            padding: '10px 24px',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: '#2563eb',
                            color: '#ffffff',
                            cursor: 'pointer',
                            fontSize: '15px',
                            fontWeight: '500',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                    >
                        {isNew ? 'Δημιουργία' : 'Αποθήκευση'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default SettingsOnomastikoModal