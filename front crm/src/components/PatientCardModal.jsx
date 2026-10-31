import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Printer, 
  RotateCw, 
  Sparkles, 
  HeartPulse, 
  Phone, 
  Droplet, 
  ShieldCheck, 
  Calendar, 
  Copy, 
  Check, 
  Activity, 
  AlertCircle,
  QrCode,
  Layers,
  Leaf
} from 'lucide-react';

// Generates pseudo-random but deterministic barcode bars for any string
function SvgBarcode({ value = 'AYUR-0000', className = '' }) {
  // Deterministic seed based on string
  const hash = value.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const barPattern = [
    2, 1, 3, 1, 2, 2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 2, 1, 3, 1, 2, 2, 1, 1, 3, 2,
    1, 2, 1, 3, 1, 2, 2, 1, 3, 1, 2, 1, 1, 2, 3, 1, 2, 1, 2, 3, 1, 2, 1, 1
  ];

  let currentX = 10;
  const bars = [];
  barPattern.forEach((w, idx) => {
    // vary bar width slightly based on hash
    const width = ((w + (hash % (idx + 1))) % 3) + 1.2;
    if (idx % 2 === 0) {
      bars.push(
        <rect
          key={idx}
          x={currentX}
          y="0"
          width={width}
          height="32"
          fill="currentColor"
        />
      );
    }
    currentX += width + 1.5;
  });

  return (
    <svg
      viewBox={`0 0 ${currentX + 10} 32`}
      className={`h-7 w-auto ${className}`}
      preserveAspectRatio="none"
    >
      {bars}
    </svg>
  );
}

// Crisp QR Code Matrix representation
function SvgQrCode({ value = 'AYUR-0000', size = 64, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      fill="currentColor"
    >
      {/* Outer Finder 1 (Top-Left) */}
      <rect x="2" y="2" width="20" height="20" rx="3" fill="currentColor" />
      <rect x="5" y="5" width="14" height="14" rx="2" fill="var(--qr-bg, #0f172a)" />
      <rect x="8" y="8" width="8" height="8" rx="1" fill="currentColor" />

      {/* Outer Finder 2 (Top-Right) */}
      <rect x="42" y="2" width="20" height="20" rx="3" fill="currentColor" />
      <rect x="45" y="5" width="14" height="14" rx="2" fill="var(--qr-bg, #0f172a)" />
      <rect x="48" y="8" width="8" height="8" rx="1" fill="currentColor" />

      {/* Outer Finder 3 (Bottom-Left) */}
      <rect x="2" y="42" width="20" height="20" rx="3" fill="currentColor" />
      <rect x="5" y="45" width="14" height="14" rx="2" fill="var(--qr-bg, #0f172a)" />
      <rect x="8" y="48" width="8" height="8" rx="1" fill="currentColor" />

      {/* Internal QR Data Modules */}
      <rect x="26" y="4" width="4" height="4" />
      <rect x="34" y="4" width="4" height="4" />
      <rect x="26" y="12" width="4" height="4" />
      <rect x="34" y="12" width="4" height="4" />
      <rect x="30" y="8" width="4" height="8" />

      <rect x="4" y="26" width="4" height="4" />
      <rect x="12" y="26" width="4" height="4" />
      <rect x="4" y="34" width="4" height="4" />
      <rect x="12" y="34" width="4" height="4" />
      <rect x="8" y="30" width="8" height="4" />

      {/* Center Data Cluster */}
      <rect x="24" y="24" width="16" height="16" rx="2" fill="currentColor" opacity="0.9" />
      <rect x="28" y="28" width="8" height="8" rx="1" fill="var(--qr-bg, #0f172a)" />
      <rect x="30" y="30" width="4" height="4" fill="currentColor" />

      {/* Right and Bottom Random Data Modules */}
      <rect x="44" y="26" width="4" height="4" />
      <rect x="52" y="26" width="4" height="4" />
      <rect x="48" y="34" width="4" height="4" />
      <rect x="56" y="34" width="4" height="4" />
      <rect x="44" y="38" width="8" height="4" />

      <rect x="26" y="44" width="4" height="4" />
      <rect x="34" y="44" width="4" height="4" />
      <rect x="26" y="52" width="4" height="4" />
      <rect x="34" y="52" width="4" height="4" />
      <rect x="30" y="48" width="8" height="4" />

      <rect x="44" y="44" width="6" height="6" />
      <rect x="54" y="44" width="6" height="6" />
      <rect x="44" y="54" width="6" height="6" />
      <rect x="54" y="54" width="6" height="6" />
    </svg>
  );
}

// Generates SVG barcode markup string for print HTML
function generateBarcodeSvgString(value = 'AYUR-0000', color = '#34d399') {
  const hash = value.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const barPattern = [
    2, 1, 3, 1, 2, 2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 2, 1, 3, 1, 2, 2, 1, 1, 3, 2,
    1, 2, 1, 3, 1, 2, 2, 1, 3, 1, 2, 1, 1, 2, 3, 1, 2, 1, 2, 3, 1, 2, 1, 1
  ];
  let currentX = 10;
  let rects = '';
  barPattern.forEach((w, idx) => {
    const width = ((w + (hash % (idx + 1))) % 3) + 1.2;
    if (idx % 2 === 0) {
      rects += `<rect x="${currentX}" y="0" width="${width}" height="26" fill="${color}" />`;
    }
    currentX += width + 1.5;
  });
  return `<svg viewBox="0 0 ${currentX + 10} 26" style="height:22px; width:auto;" preserveAspectRatio="none">${rects}</svg>`;
}

// Generates SVG QR code markup string for print HTML
function generateQrSvgString(size = 30) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="#0f172a">
    <rect x="2" y="2" width="20" height="20" rx="3" fill="#0f172a" />
    <rect x="5" y="5" width="14" height="14" rx="2" fill="#ffffff" />
    <rect x="8" y="8" width="8" height="8" rx="1" fill="#0f172a" />
    <rect x="42" y="2" width="20" height="20" rx="3" fill="#0f172a" />
    <rect x="45" y="5" width="14" height="14" rx="2" fill="#ffffff" />
    <rect x="48" y="8" width="8" height="8" rx="1" fill="#0f172a" />
    <rect x="2" y="42" width="20" height="20" rx="3" fill="#0f172a" />
    <rect x="5" y="45" width="14" height="14" rx="2" fill="#ffffff" />
    <rect x="8" y="48" width="8" height="8" rx="1" fill="#0f172a" />
    <rect x="26" y="4" width="4" height="4" fill="#0f172a" /><rect x="34" y="4" width="4" height="4" fill="#0f172a" />
    <rect x="26" y="12" width="4" height="4" fill="#0f172a" /><rect x="34" y="12" width="4" height="4" fill="#0f172a" />
    <rect x="30" y="8" width="4" height="8" fill="#0f172a" /><rect x="4" y="26" width="4" height="4" fill="#0f172a" />
    <rect x="12" y="26" width="4" height="4" fill="#0f172a" /><rect x="4" y="34" width="4" height="4" fill="#0f172a" />
    <rect x="12" y="34" width="4" height="4" fill="#0f172a" /><rect x="8" y="30" width="8" height="4" fill="#0f172a" />
    <rect x="24" y="24" width="16" height="16" rx="2" fill="#0f172a" />
    <rect x="28" y="28" width="8" height="8" rx="1" fill="#ffffff" />
    <rect x="30" y="30" width="4" height="4" fill="#0f172a" /><rect x="44" y="26" width="4" height="4" fill="#0f172a" />
    <rect x="52" y="26" width="4" height="4" fill="#0f172a" /><rect x="48" y="34" width="4" height="4" fill="#0f172a" />
    <rect x="56" y="34" width="4" height="4" fill="#0f172a" /><rect x="44" y="38" width="8" height="4" fill="#0f172a" />
    <rect x="26" y="44" width="4" height="4" fill="#0f172a" /><rect x="34" y="44" width="4" height="4" fill="#0f172a" />
    <rect x="26" y="52" width="4" height="4" fill="#0f172a" /><rect x="34" y="52" width="4" height="4" fill="#0f172a" />
    <rect x="30" y="48" width="8" height="4" fill="#0f172a" /><rect x="44" y="44" width="6" height="6" fill="#0f172a" />
    <rect x="54" y="44" width="6" height="6" fill="#0f172a" /><rect x="44" y="54" width="6" height="6" fill="#0f172a" />
    <rect x="54" y="54" width="6" height="6" fill="#0f172a" />
  </svg>`;
}

export default function PatientCardModal({ patient, onClose }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [viewMode, setViewMode] = useState('single'); // 'single' | 'dual'
  const [theme, setTheme] = useState('emerald'); // 'emerald' | 'saffron' | 'teal' | 'royal'
  const [copied, setCopied] = useState(false);
  const cardRef = useRef(null);

  if (!patient) return null;

  const patientId = patient.patientId || `PAT-${(patient._id || '').slice(-6).toUpperCase()}`;
  const issueDate = patient.createdAt 
    ? new Date(patient.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });

  const handleCopyId = () => {
    navigator.clipboard.writeText(patientId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Color Theme Definitions
  const themes = {
    emerald: {
      name: 'Classical Emerald',
      frontGradient: 'from-emerald-950 via-[#0d231b] to-slate-950',
      backGradient: 'from-[#0b1c16] via-slate-950 to-emerald-950',
      border: 'border-emerald-500/40',
      accentText: 'text-emerald-400',
      pillBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
      badgeBg: 'bg-emerald-600 text-white',
      glow: 'shadow-emerald-900/30',
      cssFrontGradient: 'linear-gradient(135deg, #022c22 0%, #0d231b 45%, #020617 100%)',
      cssBackGradient: 'linear-gradient(135deg, #0b1c16 0%, #020617 50%, #022c22 100%)',
      cssBorder: 'rgba(16, 185, 129, 0.45)',
      cssAccent: '#34d399',
      cssBadgeBg: 'rgba(16, 185, 129, 0.2)',
      cssBadgeBorder: 'rgba(52, 211, 153, 0.35)',
      cssSubText: '#6ee7b7'
    },
    saffron: {
      name: 'Royal Saffron (Kerala)',
      frontGradient: 'from-amber-950 via-[#261705] to-slate-950',
      backGradient: 'from-[#1f1304] via-slate-950 to-amber-950',
      border: 'border-amber-500/40',
      accentText: 'text-amber-400',
      pillBg: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
      badgeBg: 'bg-amber-600 text-slate-950',
      glow: 'shadow-amber-900/30',
      cssFrontGradient: 'linear-gradient(135deg, #451a03 0%, #261705 45%, #020617 100%)',
      cssBackGradient: 'linear-gradient(135deg, #1f1304 0%, #020617 50%, #451a03 100%)',
      cssBorder: 'rgba(245, 158, 11, 0.45)',
      cssAccent: '#fbbf24',
      cssBadgeBg: 'rgba(245, 158, 11, 0.2)',
      cssBadgeBorder: 'rgba(251, 191, 36, 0.35)',
      cssSubText: '#fcd34d'
    },
    teal: {
      name: 'Ayurvedic Dhanwanthari',
      frontGradient: 'from-teal-950 via-[#062024] to-slate-950',
      backGradient: 'from-[#04191c] via-slate-950 to-teal-950',
      border: 'border-teal-500/40',
      accentText: 'text-teal-400',
      pillBg: 'bg-teal-500/15 border-teal-500/30 text-teal-300',
      badgeBg: 'bg-teal-600 text-white',
      glow: 'shadow-teal-900/30',
      cssFrontGradient: 'linear-gradient(135deg, #042f2e 0%, #062024 45%, #020617 100%)',
      cssBackGradient: 'linear-gradient(135deg, #04191c 0%, #020617 50%, #042f2e 100%)',
      cssBorder: 'rgba(20, 184, 166, 0.45)',
      cssAccent: '#2dd4bf',
      cssBadgeBg: 'rgba(20, 184, 166, 0.2)',
      cssBadgeBorder: 'rgba(45, 212, 191, 0.35)',
      cssSubText: '#5eead4'
    },
    royal: {
      name: 'Midnight Clinical',
      frontGradient: 'from-slate-900 via-[#10172a] to-slate-950',
      backGradient: 'from-[#0b101f] via-slate-950 to-slate-900',
      border: 'border-indigo-500/40',
      accentText: 'text-indigo-400',
      pillBg: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300',
      badgeBg: 'bg-indigo-600 text-white',
      glow: 'shadow-indigo-900/30',
      cssFrontGradient: 'linear-gradient(135deg, #0f172a 0%, #10172a 45%, #020617 100%)',
      cssBackGradient: 'linear-gradient(135deg, #0b101f 0%, #020617 50%, #0f172a 100%)',
      cssBorder: 'rgba(99, 102, 241, 0.45)',
      cssAccent: '#818cf8',
      cssBadgeBg: 'rgba(99, 102, 241, 0.2)',
      cssBadgeBorder: 'rgba(129, 140, 248, 0.35)',
      cssSubText: '#a5b4fc'
    }
  };

  const activeTheme = themes[theme] || themes.emerald;

  // Print Patient Card with Identical On-Screen UI
  const handlePrintCard = () => {
    const printWindow = window.open('', '_blank', 'width=920,height=760');
    if (!printWindow) {
      window.print();
      return;
    }

    const blood = patient.bloodGroup || 'O+';
    const emergencyName = patient.emergencyContact?.name || 'Primary Guardian';
    const emergencyRelation = patient.emergencyContact?.relation || 'Family';
    const emergencyPhone = patient.emergencyContact?.phone || patient.phone || 'Recorded in Clinic EMR';
    const allergies = patient.allergies?.length > 0 ? patient.allergies.join(', ') : 'None Reported';
    const diet = patient.dietHabit || 'Vegetarian';
    const barcodeSvg = generateBarcodeSvgString(patientId, activeTheme.cssAccent);
    const qrSvg = generateQrSvgString(28);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>AyurCare Patient Card - ${patient.name} (${patientId})</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 12mm;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              color: #0f172a;
              background: #f8fafc;
              margin: 0;
              padding: 0;
            }
            .page-container {
              max-width: 860px;
              margin: 0 auto;
              text-align: center;
              padding: 10px 0;
            }
            .header-banner {
              margin-bottom: 18px;
              border-bottom: 2px solid #e2e8f0;
              padding-bottom: 10px;
            }
            .header-banner h1 {
              font-size: 18px;
              font-weight: 800;
              color: #064e3b;
              margin: 0;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .header-banner p {
              font-size: 10.5px;
              color: #64748b;
              margin: 3px 0 0;
            }
            .instructions {
              font-size: 10px;
              color: #475569;
              margin-bottom: 18px;
              background: #ffffff;
              padding: 8px 18px;
              border-radius: 8px;
              border: 1px dashed #cbd5e1;
              display: inline-block;
            }
            .cut-sheet {
              border: 1.5px dashed #94a3b8;
              padding: 24px 22px;
              border-radius: 20px;
              display: inline-block;
              background: #ffffff;
              box-shadow: 0 4px 16px rgba(0,0,0,0.04);
            }
            .cards-layout {
              display: flex;
              justify-content: center;
              gap: 24px;
              flex-wrap: wrap;
            }
            /* EXACT ON-SCREEN CR80 PVC Card Dimensions: 390px x 246px (~1.586/1 aspect ratio) */
            .card-ui {
              width: 390px;
              height: 246px;
              border-radius: 16px;
              border: 1.5px solid ${activeTheme.cssBorder};
              padding: 16px 18px;
              color: #ffffff;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              position: relative;
              overflow: hidden;
              text-align: left;
              box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
            }
            .card-ui-front {
              background: ${activeTheme.cssFrontGradient};
            }
            .card-ui-back {
              background: ${activeTheme.cssBackGradient};
            }
            .top-row {
              display: flex;
              align-items: flex-start;
              justify-content: space-between;
              position: relative;
              z-index: 10;
            }
            .brand-flex {
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .brand-icon {
              width: 32px;
              height: 32px;
              border-radius: 8px;
              background: ${activeTheme.cssBadgeBg};
              border: 1px solid ${activeTheme.cssBadgeBorder};
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 16px;
              color: ${activeTheme.cssAccent};
            }
            .brand-title {
              font-size: 11px;
              font-weight: 900;
              letter-spacing: 1px;
              color: #ffffff;
              text-transform: uppercase;
              line-height: 1.2;
            }
            .brand-sub {
              font-size: 8.5px;
              color: ${activeTheme.cssSubText};
              font-weight: 500;
            }
            .id-tag-col {
              display: flex;
              flex-direction: column;
              align-items: flex-end;
            }
            .id-badge {
              font-size: 8.5px;
              font-weight: 800;
              letter-spacing: 0.8px;
              padding: 2px 8px;
              border-radius: 9999px;
              background: rgba(255, 255, 255, 0.12);
              border: 1px solid rgba(255, 255, 255, 0.15);
              color: ${activeTheme.cssSubText};
              text-transform: uppercase;
            }
            .lifetime-sub {
              font-size: 7.5px;
              color: #94a3b8;
              margin-top: 2px;
            }
            .middle-row {
              display: flex;
              align-items: center;
              gap: 14px;
              margin: auto 0;
              padding: 4px 0;
              position: relative;
              z-index: 10;
            }
            .avatar-square {
              width: 58px;
              height: 68px;
              border-radius: 12px;
              background: rgba(30, 41, 59, 0.85);
              border: 2px solid ${activeTheme.cssBorder};
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
            }
            .avatar-initial {
              font-size: 26px;
              font-weight: 900;
              color: ${activeTheme.cssAccent};
              line-height: 1;
            }
            .avatar-gender {
              font-size: 8px;
              font-weight: 800;
              color: #94a3b8;
              text-transform: uppercase;
              margin-top: 4px;
              letter-spacing: 0.5px;
            }
            .details-col {
              flex: 1;
              min-width: 0;
            }
            .patient-name {
              font-size: 15px;
              font-weight: 900;
              color: #ffffff;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              line-height: 1.2;
            }
            .uhid-code {
              font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
              font-size: 12px;
              font-weight: 800;
              color: ${activeTheme.cssAccent};
              letter-spacing: 1px;
              margin: 2px 0 6px;
            }
            .meta-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 4px 8px;
              font-size: 10.5px;
            }
            .meta-item {
              color: #cbd5e1;
            }
            .meta-item .lbl {
              color: #94a3b8;
            }
            .meta-item .val {
              font-weight: 700;
              color: #f1f5f9;
            }
            .blood-pill {
              background: rgba(136, 19, 55, 0.6);
              color: #fda4af;
              border: 1px solid rgba(244, 63, 94, 0.4);
              padding: 1px 6px;
              border-radius: 4px;
              font-weight: 800;
              font-size: 9.5px;
              display: inline-block;
            }
            .bottom-row {
              padding-top: 8px;
              border-top: 1px solid rgba(255, 255, 255, 0.12);
              display: flex;
              align-items: center;
              justify-content: space-between;
              position: relative;
              z-index: 10;
            }
            .barcode-container {
              color: ${activeTheme.cssAccent};
            }
            .validity-col {
              text-align: right;
            }
            .validity-phone {
              font-size: 9.5px;
              font-weight: 700;
              color: #e2e8f0;
            }
            .validity-date {
              font-size: 8px;
              color: #94a3b8;
              margin-top: 1px;
            }

            /* BACK CARD SPECIFIC */
            .back-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              border-bottom: 1px solid rgba(255, 255, 255, 0.12);
              padding-bottom: 7px;
            }
            .back-header-title {
              font-size: 10.5px;
              font-weight: 800;
              color: ${activeTheme.cssAccent};
              letter-spacing: 0.8px;
              text-transform: uppercase;
              display: flex;
              align-items: center;
              gap: 5px;
            }
            .back-header-tag {
              font-size: 8.5px;
              color: #94a3b8;
            }
            .back-content {
              display: flex;
              flex-direction: column;
              gap: 7px;
              margin: auto 0;
              font-size: 10px;
            }
            .emergency-card {
              background: rgba(136, 19, 55, 0.45);
              border: 1px solid rgba(244, 63, 94, 0.35);
              border-radius: 10px;
              padding: 6px 10px;
              color: #fecaca;
            }
            .emergency-label {
              font-size: 8px;
              font-weight: 900;
              text-transform: uppercase;
              letter-spacing: 0.6px;
              color: #fda4af;
              margin-bottom: 1px;
            }
            .emergency-name {
              font-size: 10.5px;
              font-weight: 700;
              color: #ffffff;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .emergency-phone {
              font-family: ui-monospace, SFMono-Regular, monospace;
              font-size: 9.5px;
              color: #fecaca;
            }
            .info-box-flex {
              display: flex;
              align-items: center;
              justify-content: space-between;
              background: rgba(15, 23, 42, 0.65);
              border: 1px solid rgba(255, 255, 255, 0.08);
              border-radius: 10px;
              padding: 6px 10px;
            }
            .info-label {
              font-size: 8px;
              color: #94a3b8;
              text-transform: uppercase;
            }
            .info-val {
              font-size: 10px;
              font-weight: 600;
              color: #e2e8f0;
            }
            .info-val-diet {
              font-size: 10px;
              font-weight: 700;
              color: ${activeTheme.cssAccent};
            }
            .back-footer {
              padding-top: 8px;
              border-top: 1px solid rgba(255, 255, 255, 0.12);
              display: flex;
              align-items: center;
              justify-content: space-between;
              font-size: 8px;
              color: #94a3b8;
            }
            .qr-flex {
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .qr-box {
              padding: 3px;
              background: #ffffff;
              border-radius: 6px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .helpline-text {
              line-height: 1.3;
            }
            .helpline-bold {
              font-weight: 800;
              color: #e2e8f0;
            }
            .back-footer-right {
              font-weight: 700;
              color: ${activeTheme.cssAccent};
              text-align: right;
            }
            .scissor-guide {
              margin-top: 16px;
              font-size: 9px;
              color: #64748b;
              letter-spacing: 0.5px;
            }

            @media print {
              body {
                background: #ffffff !important;
              }
              .page-container {
                padding: 0 !important;
                margin: 0 auto !important;
              }
              .instructions, .header-banner {
                display: none !important;
              }
              .cut-sheet {
                border: 1px dashed #cbd5e1 !important;
                padding: 10px !important;
                box-shadow: none !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="page-container">
            <div class="header-banner">
              <h1>AyurCare Clinical Systems</h1>
              <p>Official Patient Health ID Card &amp; Universal Health ID (UHID) — Print Ready</p>
            </div>

            <div class="instructions">
              ✂️ <strong>Print &amp; Laminate Instructions:</strong> Print on CR80 PVC Card stock or A4 heavy cardstock. Cut along the outer dashed guides and fold down the center for a durable dual-sided wallet card.
            </div>

            <div class="cut-sheet">
              <div class="cards-layout">
                <!-- FRONT CARD -->
                <div class="card-ui card-ui-front">
                  <div class="top-row">
                    <div class="brand-flex">
                      <div class="brand-icon">🌿</div>
                      <div>
                        <div class="brand-title">AYURCARE CLINIC</div>
                        <div class="brand-sub">Classical Panchakarma &amp; Rogi Pariksha</div>
                      </div>
                    </div>
                    <div class="id-tag-col">
                      <div class="id-badge">Smart Health ID</div>
                      <div class="lifetime-sub">Lifetime UHID</div>
                    </div>
                  </div>

                  <div class="middle-row">
                    <div class="avatar-square">
                      <div class="avatar-initial">${patient.name ? patient.name.charAt(0).toUpperCase() : 'P'}</div>
                      <div class="avatar-gender">${patient.gender || 'OPD'}</div>
                    </div>

                    <div class="details-col">
                      <div class="patient-name">${patient.name}</div>
                      <div class="uhid-code">${patientId}</div>
                      <div class="meta-grid">
                        <div class="meta-item"><span class="lbl">Age: </span><span class="val">${patient.age || '—'} Yrs</span></div>
                        <div class="meta-item"><span class="lbl">Blood: </span><span class="blood-pill">${blood}</span></div>
                        <div class="meta-item" style="grid-column: span 2;"><span class="lbl">Contact: </span><span class="val">📞 ${patient.phone || '—'}</span></div>
                      </div>
                    </div>
                  </div>

                  <div class="bottom-row">
                    <div class="barcode-container">${barcodeSvg}</div>
                    <div class="validity-col">
                      <div class="validity-phone">📞 ${patient.phone || 'No phone'}</div>
                      <div class="validity-date">Issued: ${issueDate}</div>
                    </div>
                  </div>
                </div>

                <!-- BACK CARD -->
                <div class="card-ui card-ui-back">
                  <div class="back-header">
                    <div class="back-header-title">🛡️ Emergency &amp; Medical Alert</div>
                    <div class="back-header-tag">Scan for Verification</div>
                  </div>

                  <div class="back-content">
                    <div class="emergency-card">
                      <div class="emergency-label">🚨 Emergency Contact:</div>
                      <div class="emergency-name">${emergencyName} (${emergencyRelation})</div>
                      <div class="emergency-phone">📞 ${emergencyPhone}</div>
                    </div>

                    <div class="info-box-flex">
                      <div>
                        <div class="info-label">Allergies &amp; Alerts:</div>
                        <div class="info-val">${allergies}</div>
                      </div>
                      <div style="text-align: right;">
                        <div class="info-label">Diet Habit:</div>
                        <div class="info-val-diet">${diet}</div>
                      </div>
                    </div>
                  </div>

                  <div class="back-footer">
                    <div class="qr-flex">
                      <div class="qr-box">${qrSvg}</div>
                      <div class="helpline-text">
                        <div class="helpline-bold">AyurCare 24/7 Helpline</div>
                        <div>+91 98470 12345 | help@ayurcare.org</div>
                      </div>
                    </div>
                    <div class="back-footer-right">Present for Fast Token &amp; EMR</div>
                  </div>
                </div>
              </div>
              <div class="scissor-guide">✂️ Cut along outer boundaries to fold Front &amp; Back into standard CR80 wallet size</div>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#0f141f] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full p-5 sm:p-6 my-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                AyurCare Health ID &amp; Patient Card
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official PVC Wallet Card for {patient.name} ({patientId})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: View Mode & Themes */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs">
          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setViewMode('single')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                viewMode === 'single'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              Interactive 3D Flip
            </button>
            <button
              type="button"
              onClick={() => setViewMode('dual')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                viewMode === 'dual'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              Dual Side-by-Side
            </button>
          </div>

          {/* Theme Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium text-slate-400 mr-1">Style:</span>
            {Object.entries(themes).map(([k, t]) => (
              <button
                key={k}
                type="button"
                onClick={() => setTheme(k)}
                className={`w-6 h-6 rounded-full border-2 transition-transform ${
                  theme === k ? 'scale-110 ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-slate-900' : 'opacity-70 hover:opacity-100'
                } ${
                  k === 'emerald' ? 'bg-emerald-600 border-emerald-400' :
                  k === 'saffron' ? 'bg-amber-600 border-amber-400' :
                  k === 'teal' ? 'bg-teal-600 border-teal-400' : 'bg-indigo-600 border-indigo-400'
                }`}
                title={t.name}
              />
            ))}
          </div>
        </div>

        {/* Card Display Area */}
        <div className="py-2 flex justify-center">
          {viewMode === 'single' ? (
            /* Single Card with Flip Animation */
            <div className="w-full max-w-[420px]">
              <div 
                ref={cardRef}
                className="relative rounded-2xl p-0.5 cursor-pointer select-none transition-all duration-300 transform perspective-1000 shadow-2xl"
                onClick={() => setIsFlipped(!isFlipped)}
                title="Click anywhere to flip between Front and Back"
              >
                {!isFlipped ? (
                  /* FRONT CARD VIEW */
                  <div className={`w-full aspect-[1.586/1] rounded-2xl bg-gradient-to-br ${activeTheme.frontGradient} border ${activeTheme.border} p-4 sm:p-5 text-white flex flex-col justify-between relative overflow-hidden shadow-xl`}>
                    {/* Background Decorative Rings */}
                    <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-white/5 blur-xl pointer-events-none" />
                    <div className="absolute -left-12 -bottom-12 w-40 h-40 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

                    {/* Card Top Branding */}
                    <div className="flex items-start justify-between relative z-10">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 font-bold shadow-xs">
                          🌿
                        </div>
                        <div>
                          <div className="font-extrabold tracking-wider text-[11px] sm:text-xs text-white uppercase">
                            AYURCARE CLINIC
                          </div>
                          <div className="text-[9px] text-emerald-300/80 font-medium">
                            Classical Panchakarma &amp; Rogi Pariksha
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-emerald-300 border border-white/10 uppercase">
                          Smart Health ID
                        </span>
                        <span className="text-[8px] text-slate-400 mt-0.5">Lifetime UHID</span>
                      </div>
                    </div>

                    {/* Card Middle: Avatar & Core Patient Details */}
                    <div className="flex items-center gap-3.5 relative z-10 my-auto py-1">
                      <div className="w-14 h-16 sm:w-16 sm:h-18 rounded-xl bg-slate-800/80 border-2 border-emerald-500/40 flex flex-col items-center justify-center shadow-inner shrink-0 relative overflow-hidden">
                        <span className="text-xl sm:text-2xl font-black text-emerald-400">
                          {patient.name ? patient.name.charAt(0).toUpperCase() : 'P'}
                        </span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">
                          {patient.gender || 'OPD'}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="font-extrabold text-sm sm:text-base text-white truncate tracking-tight">
                          {patient.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5 mb-1.5">
                          <span className="font-mono text-xs font-bold text-emerald-400 tracking-wider">
                            {patientId}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyId();
                            }}
                            className="text-slate-400 hover:text-emerald-400 transition"
                            title="Copy UHID"
                          >
                            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px] sm:text-[11px]">
                          <div className="text-slate-300">
                            <span className="text-slate-400">Age: </span>
                            <span className="font-semibold">{patient.age || '—'} Yrs</span>
                          </div>
                          <div className="text-slate-300">
                            <span className="text-slate-400">Blood: </span>
                            <span className="font-bold text-rose-300 bg-rose-950/60 px-1.5 py-0.2 rounded border border-rose-500/30">
                              {patient.bloodGroup || 'O+'}
                            </span>
                          </div>
                          <div className="text-slate-300 col-span-2">
                            <span className="text-slate-400">Contact: </span>
                            <span className="font-semibold text-slate-200">📞 {patient.phone || '—'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Bottom: Barcode & Verification */}
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between relative z-10">
                      <div className="text-emerald-400/90">
                        <SvgBarcode value={patientId} className="h-6" />
                      </div>
                      <div className="text-right">
                        <div className="text-[9px] font-bold text-slate-300">
                          📞 {patient.phone || 'No phone'}
                        </div>
                        <div className="text-[8px] text-slate-400">
                          Issued: {issueDate}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* BACK CARD VIEW */
                  <div className={`w-full aspect-[1.586/1] rounded-2xl bg-gradient-to-br ${activeTheme.backGradient} border ${activeTheme.border} p-4 sm:p-5 text-white flex flex-col justify-between relative overflow-hidden shadow-xl`}>
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="font-bold text-xs tracking-wider uppercase text-emerald-400 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" /> Emergency &amp; Medical Alert
                      </span>
                      <span className="text-[9px] text-slate-400">Scan for Verification</span>
                    </div>

                    <div className="space-y-2 py-1 text-[10px] sm:text-[11px] text-slate-300">
                      <div className="bg-rose-950/40 border border-rose-500/30 p-2 rounded-xl text-rose-200">
                        <strong className="text-rose-300 block text-[9px] uppercase tracking-wider">
                          🚨 Emergency Contact:
                        </strong>
                        <div className="font-semibold truncate">
                          {patient.emergencyContact?.name || 'Primary Guardian'} ({patient.emergencyContact?.relation || 'Family'})
                        </div>
                        <div className="font-mono text-[10px] text-rose-300">
                          📞 {patient.emergencyContact?.phone || patient.phone || 'Recorded in Clinic EMR'}
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 bg-slate-900/60 p-2 rounded-xl border border-white/5">
                        <div className="space-y-0.5">
                          <div className="text-slate-400 text-[9px] uppercase">Allergies &amp; Alerts:</div>
                          <div className="font-medium text-slate-200">
                            {patient.allergies?.length > 0 ? patient.allergies.join(', ') : 'None Reported'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-slate-400 text-[9px] uppercase">Diet Habit:</div>
                          <div className="font-semibold text-emerald-400">
                            {patient.dietHabit || 'Vegetarian'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[8px] text-slate-400">
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-white rounded-md text-slate-950">
                          <SvgQrCode value={patientId} size={28} />
                        </div>
                        <div>
                          <div className="font-bold text-slate-200">AyurCare 24/7 Helpline</div>
                          <div>+91 98470 12345 | help@ayurcare.org</div>
                        </div>
                      </div>
                      <div className="text-right font-medium text-emerald-400">
                        Present for Fast Token &amp; EMR
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Flip Button Hint */}
              <div className="text-center mt-2.5">
                <button
                  type="button"
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-500 dark:text-slate-400 dark:hover:text-emerald-400 transition"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Click to view {isFlipped ? 'Front of Card' : 'Back of Card'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Dual Side-by-Side View */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              {/* Front Preview */}
              <div className={`w-full aspect-[1.586/1] rounded-2xl bg-gradient-to-br ${activeTheme.frontGradient} border ${activeTheme.border} p-4 text-white flex flex-col justify-between shadow-lg relative overflow-hidden`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-extrabold text-[11px] uppercase">🌿 AYURCARE CLINIC</div>
                    <div className="text-[8px] text-emerald-300">Panchakarma Health ID</div>
                  </div>
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-emerald-300">FRONT</span>
                </div>

                <div className="flex items-center gap-3 my-auto py-1">
                  <div className="w-12 h-14 rounded-lg bg-slate-800/80 border border-emerald-500/40 flex flex-col items-center justify-center font-black text-lg text-emerald-400 shrink-0">
                    {patient.name ? patient.name.charAt(0).toUpperCase() : 'P'}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-sm truncate">{patient.name}</div>
                    <div className="font-mono text-xs text-emerald-400 font-bold">{patientId}</div>
                    <div className="text-[10px] text-slate-300 mt-0.5">
                      {patient.age || '—'}Y / {patient.gender || '—'} • Blood: {patient.bloodGroup || 'O+'}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[9px] border-t border-white/10 pt-1.5">
                  <span className="font-mono font-bold text-slate-300">||| | |||| | ||</span>
                  <span className="text-slate-400">📞 {patient.phone || '—'}</span>
                </div>
              </div>

              {/* Back Preview */}
              <div className={`w-full aspect-[1.586/1] rounded-2xl bg-gradient-to-br ${activeTheme.backGradient} border ${activeTheme.border} p-4 text-white flex flex-col justify-between shadow-lg relative overflow-hidden`}>
                <div className="flex items-start justify-between">
                  <div className="font-bold text-[11px] text-emerald-400 uppercase">EMERGENCY &amp; VERIFICATION</div>
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-emerald-300">BACK</span>
                </div>

                <div className="space-y-1.5 my-auto text-[10px]">
                  <div className="bg-rose-950/50 border border-rose-500/30 p-1.5 rounded-lg text-rose-200">
                    <div className="font-bold text-[8.5px] uppercase">Emergency:</div>
                    <div className="truncate">{patient.emergencyContact?.name || 'Primary Contact'} ({patient.emergencyContact?.phone || patient.phone})</div>
                  </div>
                  <div className="text-[9px] text-slate-300">
                    <div><strong>Allergies:</strong> {patient.allergies?.length > 0 ? patient.allergies.join(', ') : 'None'}</div>
                    <div><strong>Diet:</strong> {patient.dietHabit || 'Vegetarian'}</div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[8px] text-slate-400 border-t border-white/10 pt-1.5">
                  <span>AyurCare 24/7 Helpline: +91 98470 12345</span>
                  <span className="text-emerald-400 font-bold">VERIFIED</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons: Print & Close */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="text-[11px] text-slate-400 hidden sm:block">
            Standard CR80 PVC / Card Stock (85.6mm × 54mm)
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handlePrintCard}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Health ID Card</span>
            </button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
}
