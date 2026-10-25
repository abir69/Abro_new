const fs = require('fs');
const path = require('path');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Aristo Future Plot Initiative - Standalone Syndicate Ledger</title>
  <meta name="description" content="Collaborative land syndicate management platform tracking 11-member deposits, real-time Firestore sync, automated contribution reminders, transaction ledger, and member management." />

  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            brand: {
              50: '#ecfdf5',
              500: '#10b981',
              600: '#059669',
              900: '#064e3b',
              950: '#022c22',
            }
          }
        }
      }
    }
  </script>

  <!-- React 18 & ReactDOM CDN (Pre-compiled production, Instant mobile load without Babel) -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>

  <!-- Firebase v10 Modular SDK via ES Modules -->
  <script type="module">
    import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
    import { 
      getFirestore, 
      collection, 
      doc, 
      setDoc, 
      getDoc, 
      getDocs, 
      deleteDoc, 
      onSnapshot, 
      writeBatch,
      getDocFromServer
    } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';

    const firebaseConfig = {
      projectId: "directed-hydra-v3kqt",
      appId: "1:531509153426:web:f4d21498c9eee9fccc204b",
      apiKey: "AIzaSyDryOZuMg2G-IfDdVogBQesasu8LXeRrOU",
      authDomain: "directed-hydra-v3kqt.firebaseapp.com",
      firestoreDatabaseId: "ai-studio-aristofutureplot-0bbb5f2e-2153-4594-b593-ae7568d3a361",
      storageBucket: "directed-hydra-v3kqt.firebasestorage.app",
      messagingSenderId: "531509153426",
      measurementId: "",
      oAuthClientId: "531509153426-rf1g065pejim4c6mti1aimso91mcek1h.apps.googleusercontent.com"
    };

    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const db = firebaseConfig.firestoreDatabaseId 
      ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
      : getFirestore(app);

    window.__FIREBASE__ = {
      app,
      db,
      collection,
      doc,
      setDoc,
      getDoc,
      getDocs,
      deleteDoc,
      onSnapshot,
      writeBatch,
      getDocFromServer,
      config: firebaseConfig
    };

    window.dispatchEvent(new CustomEvent('firebase-initialized'));
  </script>

  <style>
    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.98); }
      to { opacity: 1; transform: scale(1); }
    }
    .animate-fadeIn {
      animation: fadeIn 0.15s ease-out forwards;
    }
    /* Custom scrollbar for dark theme */
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    ::-webkit-scrollbar-track {
      background: #090d16;
    }
    ::-webkit-scrollbar-thumb {
      background: #1e293b;
      border-radius: 9999px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #334155;
    }

    @media print {
      body {
        background: white !important;
        color: black !important;
      }
      .no-print {
        display: none !important;
      }
      .print-only {
        display: block !important;
      }
    }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white">
  <div id="root">
    <div class="min-h-screen flex items-center justify-center bg-slate-950 text-slate-300">
      <div class="flex flex-col items-center gap-3">
        <div class="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
        <p class="text-xs font-mono text-slate-400">Loading Aristo Syndicate Portal & Connecting Live Cloud Database...</p>
      </div>
    </div>
  </div>

  <!-- Pre-compiled Vanilla JavaScript Application Script (Instant Load, No In-Browser Babel) -->
  <script>
    const { useState, useEffect, useMemo, useRef, createElement: h } = React;

    // --- ICONS (SVG Functional Components) ---
    const IconBuilding = ({ className = "w-5 h-5" }) => h("svg", { className, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 }, h("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" }));
    const IconUsers = ({ className = "w-5 h-5" }) => h("svg", { className, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 }, h("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" }));
    const IconFileSpreadsheet = ({ className = "w-5 h-5" }) => h("svg", { className, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 }, h("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" }));
    const IconLandmark = ({ className = "w-5 h-5" }) => h("svg", { className, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 }, h("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10zm4 4v4m4-4v4m4-4v4" }));
    const IconClock = ({ className = "w-5 h-5" }) => h("svg", { className, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 }, h("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" }));
    const IconCheckCircle = ({ className = "w-5 h-5" }) => h("svg", { className, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 }, h("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" }));
    const IconAlertTriangle = ({ className = "w-5 h-5" }) => h("svg", { className, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 }, h("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" }));
    const IconShieldCheck = ({ className = "w-5 h-5" }) => h("svg", { className, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 }, h("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" }));
    const IconHeart = ({ className = "w-5 h-5" }) => h("svg", { className, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 }, h("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" }));
    const IconPhone = ({ className = "w-5 h-5" }) => h("svg", { className, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 }, h("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" }));
    const IconMail = ({ className = "w-5 h-5" }) => h("svg", { className, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 }, h("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" }));
    const IconX = ({ className = "w-5 h-5" }) => h("svg", { className, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 }, h("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M6 18L18 6M6 6l12 12" }));
    const IconEdit = ({ className = "w-5 h-5" }) => h("svg", { className, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 }, h("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" }));
    const IconCopy = ({ className = "w-5 h-5" }) => h("svg", { className, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 }, h("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" }));
    const IconCheck = ({ className = "w-5 h-5" }) => h("svg", { className, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 }, h("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M5 13l4 4L19 7" }));
    const IconEye = ({ className = "w-5 h-5" }) => h("svg", { className, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 }, h("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" }), h("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" }));
    const IconTrash = ({ className = "w-5 h-5" }) => h("svg", { className, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 }, h("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" }));
    const IconLogOut = ({ className = "w-5 h-5" }) => h("svg", { className, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 }, h("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" }));
    const IconWhatsApp = ({ className = "w-4 h-4" }) => h("svg", { className, fill: "currentColor", viewBox: "0 0 24 24" }, h("path", { d: "M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.299.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.087-.179.182-.077.357.101.174.452.747.969 1.208.666.593 1.228.777 1.402.864.173.087.275.072.376-.044.101-.116.433-.506.549-.679.116-.173.231-.144.39-.087s1.011.477 1.184.563c.173.087.289.13.332.202.043.073.043.419-.101.824zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.662 1.435 5.176L2 22l4.954-1.399C8.406 21.493 10.145 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.61 0-3.11-.476-4.377-1.293l-.314-.205-2.937.83.805-2.861-.219-.327C4.12 14.869 3.6 13.484 3.6 12c0-4.632 3.768-8.4 8.4-8.4s8.4 3.768 8.4 8.4-3.768 8.4-8.4 8.4z" }));
    const IconPrinter = ({ className = "w-5 h-5" }) => h("svg", { className, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 }, h("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" }));
    const IconFileText = ({ className = "w-5 h-5" }) => h("svg", { className, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 }, h("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" }));
    const IconShare = ({ className = "w-5 h-5" }) => h("svg", { className, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 }, h("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" }));

    const formatCurrency = (amount, symbol = '৳') => {
      const num = Number(amount) || 0;
      return \`\${symbol} \${num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}\`;
    };

    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      } catch (e) {
        return dateStr;
      }
    };

    const DEFAULT_DEPOSIT_BANK = 'The City Bank PLC';
    const DEFAULT_DEPOSIT_ACCOUNT = '1781580054174';

    const INITIAL_PLOT_PROJECT = {
      initiativeName: "Aristo Future Initiative",
      plotTitle: "Joint Initiative Fund",
      sector: "Collaborative Deposit & Savings Initiative",
      location: "Dhaka, Bangladesh",
      plotSize: "11 Joint Participants",
      totalTargetPrice: 11000000,
      monthlyPerMemberExpected: 2000,
      totalCombinedBankCharge: 0,
      combinedChargeNotes: "The City Bank PLC ledger & account maintenance charge",
      leadAdminName: "Md. Minhazul Islam Abir",
      leadAdminDesignation: "Lead Admin & Chief Trustee",
      syndicateAdminName: "Md. Mostak Ahmed",
      syndicateAdminDesignation: "Syndicate Admin & Treasury Officer",
      currency: "BDT",
      symbol: "৳",
      dueDayOfMonth: 10,
      bankDetails: {
        bankName: "The City Bank PLC",
        accountName: "Aristo Future Initiative (Joint Escrow)",
        accountNumber: "1781580054174",
        routingNumber: "225272654",
        branch: "Principal Branch, Dhaka",
        mfsNumber: "+880 1712-992700 (Citytouch / bKash)"
      }
    };

    const INITIAL_MEMBERS = [
      { 
        id: 'm1', 
        name: 'Md. Minhazul Islam Abir', 
        email: 'miabir9927@gmail.com', 
        mobile: '+880 1712-992700', 
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 
        role: 'admin', 
        nomineeName: 'Salma Begum', 
        nomineeRelation: 'Mother', 
        emergencyContactName: 'Kazi Farhana',
        emergencyContactRelation: 'Sister',
        emergencyContactPhone: '+880 1711-002233',
        nidOrId: 'NID-1992-748291039', 
        joinedDate: '2025-01-10', 
        pin: '2026',
        approvalStatus: 'approved'
      },
      { 
        id: 'm2', 
        name: 'Md. Mostak Ahmed', 
        email: 'mostak.ahmed@gmail.com', 
        mobile: '+880 1819-234567', 
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', 
        role: 'member', 
        nomineeName: 'Rasheda Ahmed', 
        nomineeRelation: 'Spouse', 
        emergencyContactName: 'Rasheda Ahmed',
        emergencyContactRelation: 'Spouse',
        emergencyContactPhone: '+880 1819-998877',
        nidOrId: 'NID-1988-392810481', 
        joinedDate: '2025-01-12', 
        pin: '1234',
        approvalStatus: 'approved'
      },
      { 
        id: 'm3', 
        name: 'Md. Mahmudul Hasan', 
        email: 'mahmudul.hasan@gmail.com', 
        mobile: '+880 1914-567890', 
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', 
        role: 'member', 
        nomineeName: 'Fatema Hasan', 
        nomineeRelation: 'Mother', 
        emergencyContactName: 'Fatema Hasan',
        emergencyContactRelation: 'Mother',
        emergencyContactPhone: '+880 1914-112233',
        nidOrId: 'NID-1993-847291847', 
        joinedDate: '2025-01-15', 
        pin: '1234',
        approvalStatus: 'approved'
      },
      { 
        id: 'm4', 
        name: 'Naeem Hasan', 
        email: 'naeem.hasan@gmail.com', 
        mobile: '+880 1711-345678', 
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80', 
        role: 'member', 
        nomineeName: 'Farzana Naeem', 
        nomineeRelation: 'Spouse', 
        emergencyContactName: 'Farzana Naeem',
        emergencyContactRelation: 'Spouse',
        emergencyContactPhone: '+880 1711-445566',
        nidOrId: 'NID-1985-182947192', 
        joinedDate: '2025-01-15', 
        pin: '1234',
        approvalStatus: 'approved'
      },
      { 
        id: 'm5', 
        name: 'Md. Mehedi Hasan Shawon', 
        email: 'mehedi.shawon@gmail.com', 
        mobile: '+880 1622-456789', 
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80', 
        role: 'member', 
        nomineeName: 'Roksana Begum', 
        nomineeRelation: 'Mother', 
        emergencyContactName: 'Roksana Begum',
        emergencyContactRelation: 'Mother',
        emergencyContactPhone: '+880 1622-778899',
        nidOrId: 'NID-1994-472918401', 
        joinedDate: '2025-01-18', 
        pin: '1234',
        approvalStatus: 'approved'
      },
      { 
        id: 'm6', 
        name: 'Md. Nadim Khan', 
        email: 'nadim.khan@gmail.com', 
        mobile: '+880 1833-567891', 
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80', 
        role: 'member', 
        nomineeName: 'Farida Khan', 
        nomineeRelation: 'Mother', 
        emergencyContactName: 'Farida Khan',
        emergencyContactRelation: 'Mother',
        emergencyContactPhone: '+880 1833-223344',
        nidOrId: 'NID-1991-382910482', 
        joinedDate: '2025-01-20', 
        pin: '1234',
        approvalStatus: 'approved'
      },
      { 
        id: 'm7', 
        name: 'Shamim Osman', 
        email: 'shamim.osman@gmail.com', 
        mobile: '+880 1922-678912', 
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80', 
        role: 'member', 
        nomineeName: 'Nasrin Sultana', 
        nomineeRelation: 'Spouse', 
        emergencyContactName: 'Nasrin Sultana',
        emergencyContactRelation: 'Spouse',
        emergencyContactPhone: '+880 1922-556677',
        nidOrId: 'NID-1987-928471039', 
        joinedDate: '2025-01-22', 
        pin: '1234',
        approvalStatus: 'approved'
      },
      { 
        id: 'm8', 
        name: 'Naruttam Chandra Sarker', 
        email: 'naruttam.sarker@gmail.com', 
        mobile: '+880 1733-789023', 
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 
        role: 'member', 
        nomineeName: 'Anjali Sarker', 
        nomineeRelation: 'Spouse', 
        emergencyContactName: 'Anjali Sarker',
        emergencyContactRelation: 'Spouse',
        emergencyContactPhone: '+880 1733-889900',
        nidOrId: 'NID-1990-284910382', 
        joinedDate: '2025-01-25', 
        pin: '1234',
        approvalStatus: 'approved'
      },
      { 
        id: 'm9', 
        name: 'Sukhen Chandra Mondal', 
        email: 'sukhen.mondal@gmail.com', 
        mobile: '+880 1844-890134', 
        avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80', 
        role: 'member', 
        nomineeName: 'Mita Mondal', 
        nomineeRelation: 'Spouse', 
        emergencyContactName: 'Mita Mondal',
        emergencyContactRelation: 'Spouse',
        emergencyContactPhone: '+880 1844-334455',
        nidOrId: 'NID-1995-182930491', 
        joinedDate: '2025-01-28', 
        pin: '1234',
        approvalStatus: 'approved'
      },
      { 
        id: 'm10', 
        name: 'Didar-E-Mosnobi Rumi', 
        email: 'didar.rumi@gmail.com', 
        mobile: '+880 1933-901245', 
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80', 
        role: 'member', 
        nomineeName: 'Sultana Rumi', 
        nomineeRelation: 'Spouse', 
        emergencyContactName: 'Sultana Rumi',
        emergencyContactRelation: 'Spouse',
        emergencyContactPhone: '+880 1933-667788',
        nidOrId: 'NID-1992-629104829', 
        joinedDate: '2025-02-01', 
        pin: '1234',
        approvalStatus: 'approved'
      },
      { 
        id: 'm11', 
        name: 'Mehedi Hasan', 
        email: 'mehedi.hasan11@gmail.com', 
        mobile: '+880 1744-012356', 
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', 
        role: 'member', 
        nomineeName: 'Fariha Hasan', 
        nomineeRelation: 'Spouse', 
        emergencyContactName: 'Fariha Hasan',
        emergencyContactRelation: 'Spouse',
        emergencyContactPhone: '+880 1744-990011',
        nidOrId: 'NID-1989-729104820', 
        joinedDate: '2025-02-05', 
        pin: '1234',
        approvalStatus: 'approved'
      }
    ];

    const INITIATIVE_CYCLES = [
      'March 2026',
      'April 2026',
      'May 2026',
      'June 2026',
      'July 2026',
      'August 2026',
      'September 2026',
      'October 2026'
    ];

    const generateInitialTransactions = () => {
      const txs = [];
      const cycleDates = {
        'March 2026': '2026-03-08',
        'April 2026': '2026-04-09',
        'May 2026': '2026-05-07',
        'June 2026': '2026-06-08',
        'July 2026': '2026-07-09',
        'August 2026': '2026-08-08',
        'September 2026': '2026-09-07',
        'October 2026': '2026-10-06'
      };

      INITIATIVE_CYCLES.forEach((cycle, cycleIdx) => {
        INITIAL_MEMBERS.forEach((member, memberIdx) => {
          const txId = \`tx-c\${cycleIdx + 1}-m\${memberIdx + 1}\`;
          const ref = \`CITY-\${cycle.slice(0, 3).toUpperCase()}-\${1000 + memberIdx * 10 + cycleIdx}\`;
          txs.push({
            id: txId,
            memberId: member.id,
            memberName: member.name,
            date: cycleDates[cycle],
            amount: 2000,
            deductionOrFee: 0,
            netAmount: 2000,
            method: 'Bank Transfer',
            depositBank: DEFAULT_DEPOSIT_BANK,
            depositAccountNumber: DEFAULT_DEPOSIT_ACCOUNT,
            referenceNumber: ref,
            bankOrChannel: DEFAULT_DEPOSIT_BANK,
            monthPeriod: cycle,
            status: 'Verified',
            notes: \`\${cycle} regular syndicate deposit to \${DEFAULT_DEPOSIT_BANK} (\${DEFAULT_DEPOSIT_ACCOUNT})\`,
            createdAt: \`\${cycleDates[cycle]}T10:00:00Z\`,
            verifiedAt: \`\${cycleDates[cycle]}T12:00:00Z\`,
            verifiedBy: 'Md. Minhazul Islam Abir'
          });
        });
      });
      return txs.reverse();
    };

    const INITIAL_TRANSACTIONS = generateInitialTransactions();

    // Helper: calculate member due breakdown
    function calculateMemberSummary(member, transactions, project) {
      const memTxs = transactions.filter(t => t.memberId === member.id && t.status === 'Verified');
      const totalDeposited = memTxs.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
      const expectedPerMonth = member.customMonthlyDeposit || project.monthlyPerMemberExpected || 2000;
      const totalMonths = INITIATIVE_CYCLES.length;
      const totalExpected = expectedPerMonth * totalMonths;
      const totalDue = Math.max(0, totalExpected - totalDeposited);
      
      const dueMonths = [];
      INITIATIVE_CYCLES.forEach(cycle => {
        const hasDeposit = memTxs.some(t => t.monthPeriod === cycle);
        if (!hasDeposit) dueMonths.push(cycle);
      });

      return {
        totalDeposited,
        totalExpected,
        totalDue,
        totalMonths,
        clearedCount: memTxs.length,
        dueMonths,
        isCleared: totalDue === 0
      };
    }

    // --- MAIN APP COMPONENT ---
    function App() {
      const [members, setMembers] = useState(INITIAL_MEMBERS);
      const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
      const [project, setProject] = useState(INITIAL_PLOT_PROJECT);
      const [session, setSession] = useState({ isLoggedIn: false, role: 'member' });
      const [isCloudSynced, setIsCloudSynced] = useState(false);
      const [activeTab, setActiveTab] = useState('dashboard');
      const [toastMessage, setToastMessage] = useState(null);

      // Modals
      const [isGoogleFormModalOpen, setIsGoogleFormModalOpen] = useState(false);
      const [isApprovalsModalOpen, setIsApprovalsModalOpen] = useState(false);
      const [preselectedFormMemberId, setPreselectedFormMemberId] = useState('');
      const [selectedReceiptTx, setSelectedReceiptTx] = useState(null);
      const [selectedStatementMember, setSelectedStatementMember] = useState(null);
      const [editingMember, setEditingMember] = useState(null);

      const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3500);
      };

      // Live Firestore Sync & Data Integrity Enforcement
      useEffect(() => {
        const setupFirebase = () => {
          if (!window.__FIREBASE__) return;
          const { db, collection, doc, onSnapshot, getDocs, writeBatch } = window.__FIREBASE__;

          // CRITICAL: NEVER OVERWRITE LIVE DATA. Only seed if Firestore collection is completely empty!
          getDocs(collection(db, "members")).then((snap) => {
            if (snap.empty) {
              const batch = writeBatch(db);
              batch.set(doc(db, "project", "aristo_plot_main"), INITIAL_PLOT_PROJECT);
              INITIAL_MEMBERS.forEach(m => batch.set(doc(db, "members", m.id), m));
              INITIAL_TRANSACTIONS.forEach(t => batch.set(doc(db, "transactions", t.id), t));
              batch.commit().then(() => {
                setIsCloudSynced(true);
                showToast("Connected to live Firestore. Data seeded.");
              });
            } else {
              setIsCloudSynced(true);
            }
          }).catch(err => {
            console.log("Firestore connect:", err);
          });

          const unsubMembers = onSnapshot(collection(db, "members"), (snapshot) => {
            if (!snapshot.empty) {
              const list = [];
              snapshot.forEach(d => list.push(d.data()));
              list.sort((a, b) => parseInt(a.id.replace(/\\D/g, '') || 0) - parseInt(b.id.replace(/\\D/g, '') || 0));
              setMembers(list);
              setIsCloudSynced(true);
            }
          });

          const unsubTxs = onSnapshot(collection(db, "transactions"), (snapshot) => {
            const list = [];
            snapshot.forEach(d => list.push(d.data()));
            list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setTransactions(list);
            setIsCloudSynced(true);
          });

          const unsubProject = onSnapshot(doc(db, "project", "aristo_plot_main"), (docSnap) => {
            if (docSnap.exists()) {
              setProject(docSnap.data());
              setIsCloudSynced(true);
            }
          });

          return () => {
            unsubMembers();
            unsubTxs();
            unsubProject();
          };
        };

        if (window.__FIREBASE__) {
          setupFirebase();
        } else {
          window.addEventListener('firebase-initialized', setupFirebase);
          return () => window.removeEventListener('firebase-initialized', setupFirebase);
        }
      }, []);

      // Auto-open deposit form from URL param
      useEffect(() => {
        try {
          const params = new URLSearchParams(window.location.search);
          if (params.get('form') === 'deposit' || params.has('deposit')) {
            const mId = params.get('member');
            handleOpenDepositForm(mId);
          }
        } catch (e) {}
      }, []);

      const syncTxToCloud = (tx) => {
        if (window.__FIREBASE__) {
          const { db, doc, setDoc } = window.__FIREBASE__;
          setDoc(doc(db, "transactions", tx.id), tx, { merge: true }).catch(console.error);
        }
      };

      const deleteTxFromCloud = (txId) => {
        if (window.__FIREBASE__) {
          const { db, doc, deleteDoc } = window.__FIREBASE__;
          deleteDoc(doc(db, "transactions", txId)).catch(console.error);
        }
      };

      const syncMemberToCloud = (member) => {
        if (window.__FIREBASE__) {
          const { db, doc, setDoc } = window.__FIREBASE__;
          setDoc(doc(db, "members", member.id), member, { merge: true }).catch(console.error);
        }
      };

      const syncProjectToCloud = (proj) => {
        if (window.__FIREBASE__) {
          const { db, doc, setDoc } = window.__FIREBASE__;
          setDoc(doc(db, "project", "aristo_plot_main"), proj, { merge: true }).catch(console.error);
        }
      };

      const grossTotal = useMemo(() => {
        return transactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
      }, [transactions]);

      const netTotal = useMemo(() => {
        return Math.max(0, grossTotal - (project.totalCombinedBankCharge || 0));
      }, [grossTotal, project.totalCombinedBankCharge]);

      const pendingTxs = useMemo(() => {
        return transactions.filter(t => t.status === 'Pending Review');
      }, [transactions]);

      // AUTO-SELECT MEMBER'S NAME IN DEPOSIT FORM:
      // When any member is logged in, their memberId is automatically selected.
      const handleOpenDepositForm = (memberIdOverride) => {
        const targetId = memberIdOverride || (session.isLoggedIn && session.memberId ? session.memberId : (members[0] ? members[0].id : 'm1'));
        setPreselectedFormMemberId(targetId);
        setIsGoogleFormModalOpen(true);
      };

      const handleApproveDeposit = (tx) => {
        const approved = {
          ...tx,
          status: 'Verified',
          verifiedAt: new Date().toISOString(),
          verifiedBy: session.memberName || 'Md. Minhazul Islam Abir'
        };
        setTransactions(prev => prev.map(t => t.id === tx.id ? approved : t));
        syncTxToCloud(approved);
        showToast(\`Deposit of \${formatCurrency(tx.amount)} approved live!\`);
      };

      const handleRejectDeposit = (txId) => {
        const target = transactions.find(t => t.id === txId);
        if (target) {
          const flagged = { ...target, status: 'Flagged' };
          setTransactions(prev => prev.map(t => t.id === txId ? flagged : t));
          syncTxToCloud(flagged);
          showToast("Deposit flagged.");
        }
      };

      const handleGoogleFormSubmit = (newTx) => {
        setTransactions(prev => [newTx, ...prev]);
        syncTxToCloud(newTx);
        showToast(\`Deposit submitted for \${newTx.memberName}. Awaiting Admin Approval.\`);
      };

      const shareUrl = window.location.origin + window.location.pathname + '?form=deposit';
      const isAdmin = session.isLoggedIn && session.role === 'admin';

      // --- PUBLIC / LOGIN SCREEN ---
      if (!session.isLoggedIn) {
        return h("div", { className: "min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans relative" },
          toastMessage && h("div", { className: "fixed bottom-5 right-5 z-50 bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-lg animate-bounce" }, toastMessage),

          // Top Info Ticker
          h("div", { className: "border-b border-emerald-900/50 bg-slate-900/80 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2" },
            h("div", { className: "flex items-center gap-2" },
              h(IconLandmark, { className: "w-4 h-4 text-emerald-400" }),
              h("span", null, "Bank: ", h("strong", { className: "text-white" }, project.bankDetails.bankName), " · Acc: ", h("strong", { className: "text-emerald-400 font-mono" }, project.bankDetails.accountNumber))
            ),
            h("div", { className: "flex items-center gap-2 text-[11px] text-emerald-400" },
              h("span", { className: "w-2 h-2 rounded-full bg-emerald-400 animate-pulse" }),
              h("span", null, isCloudSynced ? "Live Cloud Synced (Firestore)" : "Connecting to Cloud...")
            )
          ),

          // Center Login Card
          h("div", { className: "flex-1 flex items-center justify-center p-4" },
            h("div", { className: "w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl p-6 text-center space-y-4" },
              h("div", { className: "w-12 h-12 bg-emerald-600 rounded-2xl mx-auto flex items-center justify-center text-white shadow-lg shadow-emerald-950" },
                h(IconBuilding, { className: "w-6 h-6" })
              ),
              h("div", null,
                h("h1", { className: "text-xl font-bold text-white" }, project.initiativeName),
                h("p", { className: "text-xs text-slate-400 mt-1" }, "11-Member Joint Trust Treasury · Sector 27, Purbachal")
              ),
              h("div", { className: "flex justify-center gap-2 pt-2" },
                h("button", {
                  onClick: () => handleOpenDepositForm(),
                  className: "px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-xl text-xs font-semibold border border-indigo-500/40 transition-colors flex items-center gap-1.5 cursor-pointer"
                },
                  h(IconFileSpreadsheet, { className: "w-4 h-4 text-indigo-400" }),
                  h("span", null, "Submit Deposit (Google Form)")
                )
              ),
              h(AuthCard, {
                members,
                leadAdminName: project.leadAdminName,
                onLogin: (user) => {
                  setSession(user);
                  showToast(\`Signed in as \${user.memberName}\`);
                },
                onRequestAccess: (newMem) => {
                  setMembers(prev => [...prev, newMem]);
                  syncMemberToCloud(newMem);
                  showToast("Access request submitted to Admin.");
                }
              })
            )
          ),

          isGoogleFormModalOpen && h(GoogleFormModal, {
            members,
            project,
            preselectedId: preselectedFormMemberId,
            onClose: () => setIsGoogleFormModalOpen(false),
            onSubmit: handleGoogleFormSubmit,
            shareUrl
          })
        );
      }

      // --- LOGGED IN PORTAL VIEW ---
      return h("div", { className: "min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans" },
        toastMessage && h("div", { className: "fixed bottom-5 right-5 z-50 bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-lg animate-bounce" }, toastMessage),

        // Header
        h("header", { className: "sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md border-b border-emerald-900/40" },
          h("div", { className: "border-b border-slate-800 bg-slate-900/60 px-4 py-1 text-xs text-slate-300 flex flex-wrap justify-between items-center gap-2" },
            h("div", { className: "flex items-center gap-2" },
              h("span", { className: "w-2 h-2 rounded-full bg-emerald-400 animate-pulse" }),
              h("span", { className: "text-emerald-400 font-semibold" }, isCloudSynced ? "Live Cloud Synced · Firebase Firestore" : "Local Storage Mode"),
              h("span", { className: "text-slate-600" }, "|"),
              h("span", null, "Bank: ", h("strong", null, project.bankDetails.bankName), " (", project.bankDetails.accountNumber, ")")
            ),
            h("div", { className: "flex items-center gap-3 font-mono text-xs" },
              h("span", null, "Gross: ", h("strong", null, formatCurrency(grossTotal))),
              h("span", { className: "text-emerald-400" }, "Net Treasury: ", h("strong", null, formatCurrency(netTotal)))
            )
          ),
          h("div", { className: "max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3" },
            h("div", { className: "flex items-center gap-3" },
              h("div", { className: "w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-md" },
                h(IconBuilding, { className: "w-5 h-5" })
              ),
              h("div", null,
                h("h1", { className: "text-base font-bold text-white" }, project.initiativeName),
                h("p", { className: "text-[11px] text-slate-400" }, "Collaborative Ledger · Sector 27, Purbachal")
              )
            ),

            h("nav", { className: "flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-medium" },
              h("button", {
                onClick: () => setActiveTab('dashboard'),
                className: \`px-3 py-1.5 rounded-lg transition-all \${activeTab === 'dashboard' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-300 hover:text-white'}\`
              }, "Dashboard"),
              h("button", {
                onClick: () => setActiveTab('transactions'),
                className: \`px-3 py-1.5 rounded-lg transition-all \${activeTab === 'transactions' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-300 hover:text-white'}\`
              }, "Transactions (", transactions.length, ")"),
              h("button", {
                onClick: () => setActiveTab('members'),
                className: \`px-3 py-1.5 rounded-lg transition-all \${activeTab === 'members' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-300 hover:text-white'}\`
              }, "11 Members")
            ),

            h("div", { className: "flex items-center gap-2" },
              h("button", {
                onClick: () => handleOpenDepositForm(), // AUTO-SELECTS LOGGED-IN MEMBER!
                className: "px-2.5 py-1.5 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-xl text-xs font-semibold border border-indigo-500/40 flex items-center gap-1 cursor-pointer transition-all",
                title: "Open public deposit submission form"
              },
                h(IconFileSpreadsheet, { className: "w-3.5 h-3.5" }),
                h("span", null, "Deposit Form")
              ),
              isAdmin && pendingTxs.length > 0 && h("button", {
                onClick: () => setIsApprovalsModalOpen(true),
                className: "px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer shadow animate-pulse"
              },
                h(IconClock, { className: "w-3.5 h-3.5" }),
                h("span", null, "Approvals (", pendingTxs.length, ")")
              ),
              h("div", { className: "flex items-center gap-2 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-xl text-xs" },
                h("div", { className: "text-left" },
                  h("span", { className: "font-bold text-white block leading-tight" }, session.memberName),
                  h("span", { className: "text-[10px] text-emerald-400 font-mono uppercase" }, session.role)
                ),
                h("button", {
                  onClick: () => setSession({ isLoggedIn: false, role: 'member' }),
                  title: "Sign Out",
                  className: "p-1 text-slate-400 hover:text-rose-400 transition-colors ml-1 cursor-pointer"
                }, h(IconLogOut, { className: "w-3.5 h-3.5" }))
              )
            )
          )
        ),

        // Main Content Area
        h("main", { className: "max-w-7xl mx-auto px-4 py-6 flex-1 w-full space-y-6" },
          activeTab === 'dashboard' && h(DashboardView, {
            project,
            members,
            transactions,
            grossTotal,
            netTotal,
            pendingTxs,
            isAdmin,
            currentMemberId: session.memberId,
            onOpenDepositForm: (mId) => handleOpenDepositForm(mId),
            onOpenApprovals: () => setIsApprovalsModalOpen(true),
            onExportStatement: (mem) => setSelectedStatementMember(mem),
            onUpdateBankCharge: (newCharge) => {
              const updated = { ...project, totalCombinedBankCharge: newCharge };
              setProject(updated);
              syncProjectToCloud(updated);
              showToast("Bank charge updated live.");
            }
          }),

          activeTab === 'transactions' && h(TransactionsView, {
            transactions,
            members,
            project,
            isAdmin,
            onViewReceipt: (tx) => setSelectedReceiptTx(tx),
            onApprove: handleApproveDeposit,
            onDelete: (txId) => {
              if (confirm("Delete this deposit permanently?")) {
                setTransactions(prev => prev.filter(t => t.id !== txId));
                deleteTxFromCloud(txId);
                showToast("Transaction deleted.");
              }
            }
          }),

          activeTab === 'members' && h(MembersView, {
            members,
            transactions,
            project,
            currentMemberId: session.memberId,
            isAdmin,
            onOpenDepositForm: (mId) => handleOpenDepositForm(mId),
            onExportStatement: (mem) => setSelectedStatementMember(mem),
            onEditProfile: (mem) => setEditingMember(mem),
            onUpdateProfile: (updatedMem) => {
              setMembers(prev => prev.map(m => m.id === updatedMem.id ? updatedMem : m));
              syncMemberToCloud(updatedMem);
              showToast(\`Profile updated for \${updatedMem.name}\`);
            }
          })
        ),

        // --- MODALS ---
        isGoogleFormModalOpen && h(GoogleFormModal, {
          members,
          project,
          preselectedId: preselectedFormMemberId,
          onClose: () => setIsGoogleFormModalOpen(false),
          onSubmit: handleGoogleFormSubmit,
          shareUrl
        }),

        isApprovalsModalOpen && h(ApprovalsModal, {
          pendingTxs,
          project,
          onClose: () => setIsApprovalsModalOpen(false),
          onApprove: handleApproveDeposit,
          onReject: handleRejectDeposit
        }),

        selectedReceiptTx && h(ReceiptModal, {
          tx: selectedReceiptTx,
          project,
          onClose: () => setSelectedReceiptTx(null)
        }),

        selectedStatementMember && h(MemberStatementModal, {
          member: selectedStatementMember,
          transactions,
          project,
          isAdmin,
          currentMemberId: session.memberId,
          onClose: () => setSelectedStatementMember(null)
        }),

        editingMember && h(MemberEditModal, {
          member: editingMember,
          isAdmin,
          currentMemberId: session.memberId,
          onClose: () => setEditingMember(null),
          onSave: (updated) => {
            setMembers(prev => prev.map(m => m.id === updated.id ? updated : m));
            syncMemberToCloud(updated);
            setEditingMember(null);
            showToast(\`Emergency contact & profile saved for \${updated.name}\`);
          }
        })
      );
    }

    // --- AUTH / ACCESS REQUEST CARD ---
    function AuthCard({ members, leadAdminName, onLogin, onRequestAccess }) {
      const [tab, setTab] = useState('member'); // 'admin' | 'member' | 'register'
      const [adminPin, setAdminPin] = useState('');
      const [selectedMemberId, setSelectedMemberId] = useState(members[0]?.id || 'm1');
      const [memberPin, setMemberPin] = useState('1234');
      const [regName, setRegName] = useState('');
      const [regPhone, setRegPhone] = useState('');
      const [error, setError] = useState('');

      const handleAdminSubmit = (e) => {
        e.preventDefault();
        setError('');
        if (adminPin === '2026') {
          onLogin({ isLoggedIn: true, role: 'admin', memberId: 'm1', memberName: leadAdminName });
        } else {
          setError("Invalid Admin PIN. (Authorized PIN required for Md. Minhazul Islam Abir)");
        }
      };

      const handleMemberSubmit = (e) => {
        e.preventDefault();
        setError('');
        const mem = members.find(m => m.id === selectedMemberId);
        if (!mem) return;
        if (mem.approvalStatus === 'pending') {
          setError(\`Login Pending Approval: \${mem.name} is awaiting Lead Admin approval.\`);
          return;
        }
        if (memberPin === (mem.pin || '1234')) {
          onLogin({ isLoggedIn: true, role: 'member', memberId: mem.id, memberName: mem.name });
        } else {
          setError("Invalid Security PIN for this member.");
        }
      };

      const handleRegisterSubmit = (e) => {
        e.preventDefault();
        if (!regName.trim() || !regPhone.trim()) {
          setError("Please provide Name and Phone number.");
          return;
        }
        const newMember = {
          id: \`m-req-\${Date.now().toString().slice(-4)}\`,
          name: regName.trim(),
          email: \`\${regName.toLowerCase().replace(/\\s+/g, '')}@gmail.com\`,
          mobile: regPhone.trim(),
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
          role: "member",
          pin: "1234",
          approvalStatus: "pending",
          joinedDate: new Date().toISOString().split('T')[0]
        };
        onRequestAccess(newMember);
        setRegName('');
        setRegPhone('');
        setError("Request sent! Awaiting Lead Admin approval.");
      };

      return h("div", { className: "space-y-4 pt-2" },
        h("div", { className: "grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs" },
          h("button", {
            type: "button",
            onClick: () => { setTab('admin'); setError(''); },
            className: \`py-1.5 rounded-lg font-semibold transition-all \${tab === 'admin' ? 'bg-emerald-600 text-white' : 'text-slate-400'}\`
          }, "Admin"),
          h("button", {
            type: "button",
            onClick: () => { setTab('member'); setError(''); },
            className: \`py-1.5 rounded-lg font-semibold transition-all \${tab === 'member' ? 'bg-emerald-600 text-white' : 'text-slate-400'}\`
          }, "Member"),
          h("button", {
            type: "button",
            onClick: () => { setTab('register'); setError(''); },
            className: \`py-1.5 rounded-lg font-semibold transition-all \${tab === 'register' ? 'bg-emerald-600 text-white' : 'text-slate-400'}\`
          }, "Request")
        ),

        error && h("div", { className: "p-2.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs text-left" }, error),

        tab === 'admin' && h("form", { onSubmit: handleAdminSubmit, className: "space-y-3 text-left" },
          h("div", null,
            h("label", { className: "text-[11px] text-slate-400 block mb-1" }, "Lead Admin: ", h("strong", null, leadAdminName)),
            h("input", {
              type: "password",
              value: adminPin,
              onChange: (e) => setAdminPin(e.target.value),
              placeholder: "Enter Security PIN (e.g. 2026)",
              className: "w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-base sm:text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
            })
          ),
          h("button", {
            type: "submit",
            className: "w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
          }, "Enter Admin Console")
        ),

        tab === 'member' && h("form", { onSubmit: handleMemberSubmit, className: "space-y-3 text-left" },
          h("div", null,
            h("label", { className: "text-[11px] text-slate-400 block mb-1" }, "Select Member Account"),
            h("select", {
              value: selectedMemberId,
              onChange: (e) => setSelectedMemberId(e.target.value),
              className: "w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-base sm:text-xs text-white focus:outline-none focus:border-emerald-500"
            },
              members.map(m => h("option", { key: m.id, value: m.id }, m.name, " (", m.mobile, ")"))
            )
          ),
          h("div", null,
            h("label", { className: "text-[11px] text-slate-400 block mb-1" }, "4-Digit Member PIN"),
            h("input", {
              type: "password",
              value: memberPin,
              onChange: (e) => setMemberPin(e.target.value),
              placeholder: "PIN (Default: 1234)",
              className: "w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-base sm:text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
            })
          ),
          h("button", {
            type: "submit",
            className: "w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
          }, "Sign in to Member Portal")
        ),

        tab === 'register' && h("form", { onSubmit: handleRegisterSubmit, className: "space-y-3 text-left" },
          h("div", null,
            h("label", { className: "text-[11px] text-slate-400 block mb-1" }, "Full Name"),
            h("input", {
              type: "text",
              value: regName,
              onChange: (e) => setRegName(e.target.value),
              placeholder: "e.g. Shakil Chowdhury",
              className: "w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-base sm:text-xs text-white focus:outline-none focus:border-emerald-500"
            })
          ),
          h("div", null,
            h("label", { className: "text-[11px] text-slate-400 block mb-1" }, "Mobile Contact"),
            h("input", {
              type: "text",
              value: regPhone,
              onChange: (e) => setRegPhone(e.target.value),
              placeholder: "+880 1711-XXXXXX",
              className: "w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-base sm:text-xs text-white focus:outline-none focus:border-emerald-500"
            })
          ),
          h("button", {
            type: "submit",
            className: "w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
          }, "Submit Request for Approval")
        )
      );
    }

    // --- GOOGLE FORM DEPOSIT MODAL WITH AUTO-SELECTION ---
    function GoogleFormModal({ members, project, preselectedId, onClose, onSubmit, shareUrl }) {
      const [selectedId, setSelectedId] = useState(preselectedId || members[0]?.id || '');
      useEffect(() => {
        if (preselectedId) setSelectedId(preselectedId);
      }, [preselectedId]);

      const [amount, setAmount] = useState('2000');
      const [month, setMonth] = useState('October 2026');
      const [method, setMethod] = useState('Bank Transfer');
      const [refNo, setRefNo] = useState('');
      const [notes, setNotes] = useState('');
      const [copied, setCopied] = useState(false);
      const [submitted, setSubmitted] = useState(false);

      const targetMember = members.find(m => m.id === selectedId) || members[0];

      const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      };

      const handleWhatsApp = () => {
        const text = \`Assalamu Alaikum. Please submit your monthly deposit voucher for \${project.initiativeName}:\\n\${shareUrl}\\nBank: \${project.bankDetails.bankName}\\nAccount: \${project.bankDetails.accountNumber}\\nName: \${project.bankDetails.accountName}\`;
        window.open(\`https://wa.me/?text=\${encodeURIComponent(text)}\`, '_blank');
      };

      const handleFormSubmit = (e) => {
        e.preventDefault();
        const numAmount = parseFloat(amount) || 2000;
        const newTx = {
          id: \`tx-form-\${Date.now()}\`,
          memberId: targetMember.id,
          memberName: targetMember.name,
          date: new Date().toISOString().split('T')[0],
          amount: numAmount,
          deductionOrFee: 0,
          netAmount: numAmount,
          method,
          depositBank: project.bankDetails.bankName,
          depositAccountNumber: project.bankDetails.accountNumber,
          referenceNumber: refNo.trim() || \`CITY-FORM-\${Date.now().toString().slice(-6)}\`,
          bankOrChannel: project.bankDetails.bankName,
          monthPeriod: month,
          status: 'Pending Review',
          notes: notes.trim() ? \`[Google Form] \${notes.trim()}\` : '[Submitted via Public Form]',
          submittedVia: 'google_form',
          createdAt: new Date().toISOString()
        };
        onSubmit(newTx);
        setSubmitted(true);
      };

      return h("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn" },
        h("div", { className: "w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]" },
          // Header
          h("div", { className: "bg-gradient-to-r from-emerald-700 via-teal-700 to-indigo-800 p-5 text-white flex justify-between items-center" },
            h("div", null,
              h("span", { className: "text-[10px] uppercase font-bold tracking-wider bg-black/30 px-2 py-0.5 rounded-full border border-white/20" }, "Google Form · Public Deposit Portal"),
              h("h2", { className: "text-lg font-bold mt-1" }, "Initiative Deposit Submission Form")
            ),
            h("button", { onClick: onClose, className: "p-1 rounded-lg hover:bg-white/20 cursor-pointer" },
              h(IconX, { className: "w-5 h-5 text-white" })
            )
          ),

          // Share Bar
          h("div", { className: "bg-slate-950 px-4 py-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs" },
            h("div", { className: "flex items-center gap-1.5 text-slate-300" },
              h(IconShare, { className: "w-4 h-4 text-emerald-400" }),
              h("span", { className: "font-semibold text-white" }, "Shareable Link:"),
              h("span", { className: "font-mono text-[11px] text-slate-400 truncate max-w-[150px]" }, shareUrl)
            ),
            h("div", { className: "flex items-center gap-2" },
              h("button", {
                onClick: handleCopy,
                className: "px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium flex items-center gap-1 transition-colors cursor-pointer"
              },
                copied ? h(IconCheck, { className: "w-3.5 h-3.5" }) : h(IconCopy, { className: "w-3.5 h-3.5" }),
                h("span", null, copied ? "Copied!" : "Copy Link")
              ),
              h("button", {
                onClick: handleWhatsApp,
                className: "px-2.5 py-1 bg-[#25D366] text-slate-950 font-bold rounded-lg flex items-center gap-1 cursor-pointer"
              },
                h(IconWhatsApp, { className: "w-3.5 h-3.5" }),
                h("span", null, "WhatsApp")
              )
            )
          ),

          // Form Body
          h("div", { className: "p-6 overflow-y-auto flex-1 space-y-4" },
            submitted ? (
              h("div", { className: "py-12 text-center space-y-3" },
                h("div", { className: "w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto" },
                  h(IconCheckCircle, { className: "w-8 h-8" })
                ),
                h("h3", { className: "text-lg font-bold text-white" }, "Your response has been recorded!"),
                h("p", { className: "text-xs text-slate-300 max-w-sm mx-auto" }, "Your deposit for ", h("strong", { className: "text-emerald-400" }, targetMember.name), " has been logged to live Firestore and queued for ", h("strong", { className: "text-white" }, "Admin Approval"), "."),
                h("button", {
                  onClick: onClose,
                  className: "mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl cursor-pointer"
                }, "Done")
              )
            ) : (
              h("form", { onSubmit: handleFormSubmit, className: "space-y-4 text-left text-xs" },
                h("div", { className: "p-3 rounded-xl bg-slate-950 border border-slate-800" },
                  h("span", { className: "text-[10px] text-slate-400 uppercase font-semibold block" }, "Official Deposit Account"),
                  h("span", { className: "font-bold text-white text-sm mt-0.5 block" }, project.bankDetails.bankName),
                  h("span", { className: "text-emerald-400 font-mono font-bold" }, "A/C: ", project.bankDetails.accountNumber)
                ),

                // Question 1: Member Selection (WITH AUTO-SELECTED BADGE)
                h("div", null,
                  h("div", { className: "flex items-center justify-between mb-1" },
                    h("label", { className: "text-[11px] font-semibold text-slate-300 block" }, "Selected Syndicate Member *"),
                    preselectedId && h("span", { className: "text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700/80 px-2 py-0.5 rounded-full font-bold animate-pulse" }, "Auto-Selected")
                  ),
                  h("select", {
                    value: selectedId,
                    onChange: (e) => setSelectedId(e.target.value),
                    className: "w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-base sm:text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
                  },
                    members.map(m => h("option", { key: m.id, value: m.id }, m.name, " (", m.mobile, ")"))
                  )
                ),

                // Question 2: Amount
                h("div", null,
                  h("label", { className: "text-[11px] font-semibold text-slate-300 block mb-1" }, "Deposit Amount (BDT) *"),
                  h("input", {
                    type: "number",
                    value: amount,
                    onChange: (e) => setAmount(e.target.value),
                    placeholder: "2000",
                    className: "w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-base sm:text-xs text-white focus:outline-none focus:border-emerald-500 font-mono font-bold"
                  })
                ),

                // Question 3: Month Cycle
                h("div", null,
                  h("label", { className: "text-[11px] font-semibold text-slate-300 block mb-1" }, "Contribution Cycle / Month *"),
                  h("select", {
                    value: month,
                    onChange: (e) => setMonth(e.target.value),
                    className: "w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-base sm:text-xs text-white focus:outline-none focus:border-emerald-500"
                  },
                    INITIATIVE_CYCLES.map(c => h("option", { key: c, value: c }, c))
                  )
                ),

                // Question 4: Payment Method
                h("div", null,
                  h("label", { className: "text-[11px] font-semibold text-slate-300 block mb-1" }, "Payment Method *"),
                  h("select", {
                    value: method,
                    onChange: (e) => setMethod(e.target.value),
                    className: "w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-base sm:text-xs text-white focus:outline-none focus:border-emerald-500"
                  },
                    ['Bank Transfer', 'bKash / MFS', 'Nagad', 'Cheque', 'Direct Deposit', 'Cash'].map(pm => h("option", { key: pm, value: pm }, pm))
                  )
                ),

                // Question 5: Reference / Voucher No
                h("div", null,
                  h("label", { className: "text-[11px] font-semibold text-slate-300 block mb-1" }, "Bank Reference / Voucher / TrxID *"),
                  h("input", {
                    type: "text",
                    value: refNo,
                    onChange: (e) => setRefNo(e.target.value),
                    placeholder: "e.g. CITY-DEP-992123 or TrxID",
                    className: "w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-base sm:text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  })
                ),

                // Question 6: Notes
                h("div", null,
                  h("label", { className: "text-[11px] font-semibold text-slate-400 block mb-1" }, "Additional Notes (Optional)"),
                  h("input", {
                    type: "text",
                    value: notes,
                    onChange: (e) => setNotes(e.target.value),
                    placeholder: "Branch, cheque number, or sender details",
                    className: "w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-base sm:text-xs text-white focus:outline-none focus:border-emerald-500"
                  })
                ),

                h("button", {
                  type: "submit",
                  className: "w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-lg shadow-emerald-950"
                }, "Submit Deposit Voucher")
              )
            )
          )
        )
      );
    }

    // --- APPROVALS MODAL ---
    function ApprovalsModal({ pendingTxs, project, onClose, onApprove, onReject }) {
      return h("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn" },
        h("div", { className: "w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" },
          h("div", { className: "p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950" },
            h("h3", { className: "font-bold text-white text-sm flex items-center gap-2" },
              h(IconClock, { className: "w-4 h-4 text-amber-400" }),
              h("span", null, "Pending Deposit Approvals (", pendingTxs.length, ")")
            ),
            h("button", { onClick: onClose, className: "p-1 rounded-lg hover:bg-slate-800 cursor-pointer" },
              h(IconX, { className: "w-4 h-4 text-slate-400" })
            )
          ),
          h("div", { className: "p-4 overflow-y-auto flex-1 space-y-3" },
            pendingTxs.length === 0 ? (
              h("div", { className: "py-12 text-center text-slate-500 text-xs" }, "No pending submissions. All deposits are verified!")
            ) : (
              pendingTxs.map(tx => (
                h("div", { key: tx.id, className: "p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs" },
                  h("div", null,
                    h("span", { className: "font-bold text-white text-sm block" }, tx.memberName),
                    h("span", { className: "text-slate-400 text-[11px]" }, tx.monthPeriod, " · Ref: ", h("strong", { className: "text-slate-300 font-mono" }, tx.referenceNumber)),
                    h("span", { className: "text-emerald-400 font-mono font-bold block mt-0.5" }, formatCurrency(tx.amount))
                  ),
                  h("div", { className: "flex items-center gap-2" },
                    h("button", {
                      onClick: () => onApprove(tx),
                      className: "px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl cursor-pointer"
                    }, "Approve Deposit"),
                    h("button", {
                      onClick: () => onReject(tx.id),
                      className: "px-3 py-1.5 bg-rose-950 hover:bg-rose-900 text-rose-300 rounded-xl cursor-pointer"
                    }, "Flag / Reject")
                  )
                )
              ))
            )
          )
        )
      );
    }

    // --- RECEIPT MODAL ---
    function ReceiptModal({ tx, project, onClose }) {
      return h("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn" },
        h("div", { className: "w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 text-xs space-y-4" },
          h("div", { className: "flex justify-between items-center border-b border-slate-800 pb-3" },
            h("div", null,
              h("h3", { className: "font-bold text-white text-sm" }, project.initiativeName),
              h("span", { className: "text-[11px] text-slate-400" }, "Official Deposit Voucher")
            ),
            h("button", { onClick: onClose, className: "p-1 rounded-lg hover:bg-slate-800 cursor-pointer" },
              h(IconX, { className: "w-4 h-4 text-slate-400" })
            )
          ),
          h("div", { className: "space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono" },
            h("div", { className: "flex justify-between" }, h("span", { className: "text-slate-400" }, "Member:"), h("strong", { className: "text-white" }, tx.memberName)),
            h("div", { className: "flex justify-between" }, h("span", { className: "text-slate-400" }, "Cycle:"), h("strong", { className: "text-white" }, tx.monthPeriod)),
            h("div", { className: "flex justify-between" }, h("span", { className: "text-slate-400" }, "Date:"), h("strong", { className: "text-white" }, tx.date)),
            h("div", { className: "flex justify-between" }, h("span", { className: "text-slate-400" }, "Amount:"), h("strong", { className: "text-emerald-400 text-sm" }, formatCurrency(tx.amount))),
            h("div", { className: "flex justify-between" }, h("span", { className: "text-slate-400" }, "Bank:"), h("strong", { className: "text-white" }, tx.depositBank || project.bankDetails.bankName)),
            h("div", { className: "flex justify-between" }, h("span", { className: "text-slate-400" }, "Account:"), h("strong", { className: "text-slate-300" }, tx.depositAccountNumber || project.bankDetails.accountNumber)),
            h("div", { className: "flex justify-between" }, h("span", { className: "text-slate-400" }, "Reference:"), h("strong", { className: "text-slate-300" }, tx.referenceNumber)),
            h("div", { className: "flex justify-between" }, h("span", { className: "text-slate-400" }, "Status:"), h("span", { className: "text-emerald-400 font-bold" }, tx.status))
          ),
          h("button", {
            onClick: () => window.print(),
            className: "w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold cursor-pointer"
          }, "Print Receipt Slip")
        )
      );
    }

    // --- REQUIREMENT 2: SINGLE MEMBER STATEMENT PDF EXPORT MODAL ---
    function MemberStatementModal({ member, transactions, project, isAdmin, currentMemberId, onClose }) {
      const memberTxs = useMemo(() => {
        return transactions
          .filter(t => t.memberId === member.id && t.status === 'Verified')
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      }, [transactions, member.id]);

      const summary = useMemo(() => calculateMemberSummary(member, transactions, project), [member, transactions, project]);

      const handleExportPdf = () => {
        const prevTitle = document.title;
        document.title = \`Aristo_Plot_Statement_\${member.name.replace(/\\s+/g, '_')}\`;
        window.print();
        setTimeout(() => {
          document.title = prevTitle;
        }, 1000);
      };

      const canViewPrivateDetails = isAdmin || currentMemberId === member.id;

      return h("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn" },
        h("div", { className: "w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] text-slate-100" },
          // Toolbar (hidden on print)
          h("div", { className: "p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 bg-slate-950 no-print" },
            h("div", { className: "flex items-center gap-2" },
              h(IconFileText, { className: "w-5 h-5 text-emerald-400" }),
              h("div", null,
                h("h3", { className: "font-bold text-white text-sm" }, "Official Member Deposit Statement"),
                h("p", { className: "text-xs text-slate-400" }, member.name, " · Verified Monthly Ledger")
              )
            ),
            h("div", { className: "flex items-center gap-2" },
              h("button", {
                onClick: handleExportPdf,
                className: "px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer",
                title: "Download or print PDF statement"
              },
                h(IconPrinter, { className: "w-4 h-4" }),
                h("span", null, "Export PDF Statement")
              ),
              h("button", { onClick: onClose, className: "p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer" },
                h(IconX, { className: "w-4 h-4" })
              )
            )
          ),

          // Printable Statement Sheet
          h("div", { id: "printable-member-statement", className: "p-6 sm:p-8 overflow-y-auto flex-1 space-y-6 bg-slate-900" },
            // Statement Top Header
            h("div", { className: "border-b-2 border-emerald-500 pb-5 flex flex-wrap items-start justify-between gap-4" },
              h("div", null,
                h("div", { className: "flex items-center gap-2.5" },
                  h("div", { className: "w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm" }, "A"),
                  h("div", null,
                    h("h1", { className: "text-lg font-bold text-white" }, project.initiativeName),
                    h("span", { className: "text-xs text-emerald-400 font-medium" }, "11-Member Joint Trust Treasury · Sector 27, Purbachal")
                  )
                ),
                h("p", { className: "text-xs text-slate-400 mt-2" },
                  "Deposit Bank: ", h("strong", { className: "text-white" }, project.bankDetails.bankName),
                  " · A/C: ", h("strong", { className: "text-emerald-400 font-mono" }, project.bankDetails.accountNumber)
                )
              ),
              h("div", { className: "text-right text-xs" },
                h("span", { className: "px-2.5 py-1 bg-emerald-950 text-emerald-300 rounded-lg border border-emerald-800 font-mono font-bold block mb-1" }, "MEMBER LEDGER STATEMENT"),
                h("span", { className: "text-slate-400 block" }, "Date: ", formatDate(new Date().toISOString())),
                h("span", { className: "text-[10px] text-slate-500 font-mono block" }, "STMT-", member.id.toUpperCase(), "-2026")
              )
            ),

            // Member Profile & Confidential Details
            h("div", { className: "bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs" },
              h("div", { className: "flex items-center gap-3" },
                h("img", { src: member.avatar, alt: member.name, className: "w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500" }),
                h("div", null,
                  h("span", { className: "text-[10px] uppercase font-semibold text-slate-500 block" }, "Account Holder"),
                  h("span", { className: "font-bold text-white text-sm block" }, member.name),
                  h("span", { className: "text-slate-400 font-mono text-[11px]" }, member.mobile)
                )
              ),
              h("div", { className: "space-y-1 text-right" },
                h("div", null,
                  h("span", { className: "text-[10px] uppercase font-semibold text-slate-500 block" }, "Status"),
                  h("span", { className: "font-bold text-emerald-400" }, "Active Syndicate Contributor")
                ),
                canViewPrivateDetails ? (
                  h("div", null,
                    member.nomineeName && h("div", null,
                      h("span", { className: "text-[10px] uppercase font-semibold text-slate-500 block" }, "Nominee"),
                      h("span", { className: "text-slate-200" }, member.nomineeName, " (", member.nomineeRelation || 'Nominee', ")")
                    ),
                    member.emergencyContactName && h("div", { className: "mt-1" },
                      h("span", { className: "text-[10px] uppercase font-semibold text-slate-500 block" }, "Emergency Contact"),
                      h("span", { className: "text-slate-200" }, member.emergencyContactName, " (", member.emergencyContactRelation || 'Contact', ") · ", member.emergencyContactPhone)
                    )
                  )
                ) : (
                  h("div", null,
                    h("span", { className: "text-[10px] uppercase font-semibold text-slate-500 block" }, "Nominee & Emergency"),
                    h("span", { className: "italic text-slate-500" }, "Confidential (Protected)")
                  )
                )
              )
            ),

            // Transactions Table
            h("div", { className: "space-y-2" },
              h("div", { className: "flex justify-between items-center text-xs" },
                h("h4", { className: "font-bold uppercase tracking-wider text-slate-300" }, "Historical Monthly Installments"),
                h("span", { className: "text-slate-400" }, "Deposits Recorded: ", h("strong", { className: "text-white font-mono" }, memberTxs.length))
              ),
              h("div", { className: "border border-slate-800 rounded-xl overflow-hidden" },
                h("table", { className: "w-full text-left text-xs border-collapse" },
                  h("thead", { className: "bg-slate-950 text-slate-400 border-b border-slate-800" },
                    h("tr", null,
                      h("th", { className: "py-2.5 px-3 font-semibold" }, "Date"),
                      h("th", { className: "py-2.5 px-3 font-semibold" }, "Cycle / Month"),
                      h("th", { className: "py-2.5 px-3 font-semibold" }, "Bank / Method"),
                      h("th", { className: "py-2.5 px-3 font-semibold" }, "Reference"),
                      h("th", { className: "py-2.5 px-3 font-semibold text-right" }, "Credited"),
                      h("th", { className: "py-2.5 px-3 font-semibold" }, "Status")
                    )
                  ),
                  h("tbody", { className: "divide-y divide-slate-800 font-mono text-[11px]" },
                    memberTxs.length === 0 ? (
                      h("tr", null, h("td", { colSpan: 6, className: "py-6 text-center text-slate-500" }, "No verified transactions on record for this member."))
                    ) : (
                      memberTxs.map(tx => (
                        h("tr", { key: tx.id, className: "hover:bg-slate-850" },
                          h("td", { className: "py-2 px-3 text-slate-300" }, formatDate(tx.date)),
                          h("td", { className: "py-2 px-3 text-white font-sans font-medium" }, tx.monthPeriod),
                          h("td", { className: "py-2 px-3 text-slate-400" }, tx.bankOrChannel || tx.method),
                          h("td", { className: "py-2 px-3 text-slate-300 font-mono" }, tx.referenceNumber),
                          h("td", { className: "py-2 px-3 text-right font-bold text-emerald-400" }, formatCurrency(tx.amount, project.symbol)),
                          h("td", { className: "py-2 px-3 text-emerald-400 font-sans" }, tx.status)
                        )
                      ))
                    )
                  ),
                  h("tfoot", { className: "bg-slate-950 font-bold text-xs border-t-2 border-slate-800" },
                    h("tr", null,
                      h("td", { colSpan: 4, className: "py-2.5 px-3 text-slate-300" }, "Total Verified Contributions"),
                      h("td", { className: "py-2.5 px-3 text-right text-emerald-400 font-mono text-sm" }, formatCurrency(summary.totalDeposited, project.symbol)),
                      h("td", null)
                    )
                  )
                )
              )
            ),

            // Due & Clearance Metrics Block
            h("div", { className: "bg-slate-950 p-4 rounded-xl border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs" },
              h("div", null,
                h("span", { className: "text-[10px] text-slate-400 uppercase font-semibold block" }, "Evaluation Period"),
                h("span", { className: "font-bold text-white block mt-0.5" }, "March to October 2026"),
                h("span", { className: "text-[10px] text-slate-500 font-mono" }, summary.totalMonths, " Monthly Cycles")
              ),
              h("div", null,
                h("span", { className: "text-[10px] text-slate-400 uppercase font-semibold block" }, "Required Contribution"),
                h("span", { className: "font-bold text-white font-mono block mt-0.5" }, formatCurrency(summary.totalExpected, project.symbol)),
                h("span", { className: "text-[10px] text-slate-500 font-mono" }, summary.totalMonths, " × ", formatCurrency(member.customMonthlyDeposit || project.monthlyPerMemberExpected))
              ),
              h("div", null,
                h("span", { className: "text-[10px] text-slate-400 uppercase font-semibold block" }, "Verified Deposited"),
                h("span", { className: "font-bold text-emerald-400 font-mono block mt-0.5" }, formatCurrency(summary.totalDeposited, project.symbol)),
                h("span", { className: "text-[10px] text-emerald-400/80" }, summary.clearedCount, " of ", summary.totalMonths, " Cycles Cleared")
              ),
              h("div", null,
                h("span", { className: "text-[10px] text-slate-400 uppercase font-semibold block" }, "Current Due Status"),
                h("span", { className: \`font-bold font-mono block mt-0.5 \${summary.totalDue === 0 ? 'text-emerald-400' : 'text-rose-400'}\` }, formatCurrency(summary.totalDue, project.symbol)),
                h("span", { className: \`text-[10px] font-semibold \${summary.totalDue === 0 ? 'text-emerald-400' : 'text-rose-400'}\` },
                  summary.totalDue === 0 ? "✓ All Cleared (0 Due)" : \`Due: \${summary.dueMonths.join(', ')}\`
                )
              )
            ),

            // Legal & Escrow Certification
            h("div", { className: "p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs" },
              h("div", { className: "flex items-center gap-2" },
                h(IconShieldCheck, { className: "w-4 h-4 text-emerald-400 shrink-0" }),
                h("span", { className: "text-[11px] text-slate-300" }, "Central Escrow Audit: All member deposits credited in full (100%). Bank charges adjusted centrally.")
              ),
              h("span", { className: "px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded font-mono text-[10px] font-bold" }, "AUDITED")
            ),

            // Signatures Section
            h("div", { className: "pt-8 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs" },
              h("div", { className: "text-left" },
                h("div", { className: "border-b border-slate-600 pb-1 mb-1 font-mono font-bold text-white w-48" }, project.leadAdminName),
                h("span", { className: "text-[10px] text-slate-400 block" }, project.leadAdminDesignation),
                h("span", { className: "text-[10px] text-emerald-400 block font-mono" }, project.initiativeName)
              ),
              h("div", { className: "text-center sm:text-left" },
                h("div", { className: "border-b border-slate-600 pb-1 mb-1 font-mono font-bold text-white w-48 mx-auto sm:mx-0" }, project.syndicateAdminName),
                h("span", { className: "text-[10px] text-slate-400 block" }, project.syndicateAdminDesignation),
                h("span", { className: "text-[10px] text-sky-400 block font-mono" }, "Syndicate Treasury Board")
              ),
              h("div", { className: "text-right" },
                h("div", { className: "border-b border-slate-600 pb-1 mb-1 font-mono text-slate-200 w-48 ml-auto" }, member.name),
                h("span", { className: "text-[10px] text-slate-400 block" }, "Participating Contributor"),
                h("span", { className: "text-[10px] text-slate-500 font-mono block" }, "Member ID: ", member.id)
              )
            )
          )
        )
      );
    }

    // --- REQUIREMENT 1: EDIT PROFILE & EMERGENCY CONTACT MODAL ---
    function MemberEditModal({ member, isAdmin, currentMemberId, onClose, onSave }) {
      const [name, setName] = useState(member.name || '');
      const [email, setEmail] = useState(member.email || '');
      const [mobile, setMobile] = useState(member.mobile || '');
      const [nomineeName, setNomineeName] = useState(member.nomineeName || '');
      const [nomineeRelation, setNomineeRelation] = useState(member.nomineeRelation || '');
      const [emergencyContactName, setEmergencyContactName] = useState(member.emergencyContactName || '');
      const [emergencyContactRelation, setEmergencyContactRelation] = useState(member.emergencyContactRelation || '');
      const [emergencyContactPhone, setEmergencyContactPhone] = useState(member.emergencyContactPhone || '');
      const [pin, setPin] = useState(member.pin || '1234');

      const isSelf = currentMemberId === member.id;
      const canEdit = isAdmin || isSelf;

      if (!canEdit) {
        return h("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm" },
          h("div", { className: "w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-xs space-y-3" },
            h("p", { className: "text-slate-300" }, "Privacy Rule: You can only edit your own member profile."),
            h("button", { onClick: onClose, className: "px-4 py-2 bg-slate-800 text-white rounded-xl" }, "Close")
          )
        );
      }

      const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
          ...member,
          name: name.trim(),
          email: email.trim(),
          mobile: mobile.trim(),
          nomineeName: nomineeName.trim(),
          nomineeRelation: nomineeRelation.trim(),
          emergencyContactName: emergencyContactName.trim(),
          emergencyContactRelation: emergencyContactRelation.trim(),
          emergencyContactPhone: emergencyContactPhone.trim(),
          pin: pin.trim()
        });
      };

      return h("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn" },
        h("div", { className: "w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-6 text-xs space-y-4 max-h-[95vh] overflow-y-auto" },
          h("div", { className: "flex justify-between items-center border-b border-slate-800 pb-3" },
            h("div", null,
              h("h3", { className: "font-bold text-white text-sm" }, "Edit Member Profile & Emergency Details"),
              h("span", { className: "text-[11px] text-slate-400" }, member.name, " · Confidential Role Privacy")
            ),
            h("button", { onClick: onClose, className: "p-1 rounded-lg hover:bg-slate-800 cursor-pointer" },
              h(IconX, { className: "w-4 h-4 text-slate-400" })
            )
          ),

          h("form", { onSubmit: handleSubmit, className: "space-y-3.5 text-left" },
            // Basic Info
            h("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3" },
              h("div", null,
                h("label", { className: "text-[11px] text-slate-400 block mb-1" }, "Full Name *"),
                h("input", {
                  type: "text",
                  value: name,
                  onChange: (e) => setName(e.target.value),
                  required: true,
                  className: "w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-base sm:text-xs focus:outline-none focus:border-emerald-500 font-semibold"
                })
              ),
              h("div", null,
                h("label", { className: "text-[11px] text-slate-400 block mb-1" }, "Mobile Contact *"),
                h("input", {
                  type: "text",
                  value: mobile,
                  onChange: (e) => setMobile(e.target.value),
                  required: true,
                  className: "w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-base sm:text-xs focus:outline-none focus:border-emerald-500 font-mono"
                })
              )
            ),

            h("div", null,
              h("label", { className: "text-[11px] text-slate-400 block mb-1" }, "Email Address (Contribution Reminders) *"),
              h("input", {
                type: "email",
                value: email,
                onChange: (e) => setEmail(e.target.value),
                required: true,
                className: "w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-base sm:text-xs focus:outline-none focus:border-emerald-500"
              })
            ),

            // Nominee Details
            h("div", { className: "p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2.5" },
              h("span", { className: "text-[10px] font-bold text-rose-400 uppercase tracking-wider block" }, "Nominee Details (Private)"),
              h("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2.5" },
                h("div", null,
                  h("label", { className: "text-[10px] text-slate-400 block mb-0.5" }, "Nominee Full Name"),
                  h("input", {
                    type: "text",
                    value: nomineeName,
                    onChange: (e) => setNomineeName(e.target.value),
                    placeholder: "e.g. Salma Begum",
                    className: "w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
                  })
                ),
                h("div", null,
                  h("label", { className: "text-[10px] text-slate-400 block mb-0.5" }, "Nominee Relationship"),
                  h("input", {
                    type: "text",
                    value: nomineeRelation,
                    onChange: (e) => setNomineeRelation(e.target.value),
                    placeholder: "e.g. Spouse / Mother / Son",
                    className: "w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
                  })
                )
              )
            ),

            // REQUIREMENT 1: EMERGENCY CONTACT SECTION
            h("div", { className: "p-3 bg-slate-950/80 rounded-xl border border-amber-900/60 space-y-2.5" },
              h("div", { className: "flex items-center gap-1.5 text-amber-400" },
                h(IconAlertTriangle, { className: "w-4 h-4" }),
                h("span", { className: "text-[10px] font-bold uppercase tracking-wider" }, "Emergency Contact (Strictly Confidential)")
              ),
              h("p", { className: "text-[11px] text-slate-400 leading-tight" },
                "Designated contact for urgent syndicate matters, medical or legal notifications. Visible only to you and Lead Admin."
              ),
              h("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-2" },
                h("div", null,
                  h("label", { className: "text-[10px] text-slate-400 block mb-0.5" }, "Contact Name"),
                  h("input", {
                    type: "text",
                    value: emergencyContactName,
                    onChange: (e) => setEmergencyContactName(e.target.value),
                    placeholder: "e.g. Kazi Farhana",
                    className: "w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
                  })
                ),
                h("div", null,
                  h("label", { className: "text-[10px] text-slate-400 block mb-0.5" }, "Relationship"),
                  h("input", {
                    type: "text",
                    value: emergencyContactRelation,
                    onChange: (e) => setEmergencyContactRelation(e.target.value),
                    placeholder: "e.g. Spouse / Brother",
                    className: "w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
                  })
                ),
                h("div", null,
                  h("label", { className: "text-[10px] text-slate-400 block mb-0.5" }, "Phone Number"),
                  h("input", {
                    type: "text",
                    value: emergencyContactPhone,
                    onChange: (e) => setEmergencyContactPhone(e.target.value),
                    placeholder: "+880 1711-XXXXXX",
                    className: "w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs font-mono"
                  })
                )
              )
            ),

            // PIN
            h("div", null,
              h("label", { className: "text-[11px] text-slate-400 block mb-1" }, "4-Digit Login PIN"),
              h("input", {
                type: "password",
                value: pin,
                onChange: (e) => setPin(e.target.value),
                className: "w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-base sm:text-xs font-mono"
              })
            ),

            h("button", {
              type: "submit",
              className: "w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-lg shadow-emerald-950"
            }, "Save Changes to Live Cloud")
          )
        )
      );
    }

    // --- DASHBOARD VIEW ---
    function DashboardView({ project, members, transactions, grossTotal, netTotal, pendingTxs, isAdmin, currentMemberId, onOpenDepositForm, onOpenApprovals, onExportStatement, onUpdateBankCharge }) {
      const currentMonth = "October 2026";
      const currentMonthTxs = transactions.filter(t => t.monthPeriod === currentMonth && t.status === 'Verified');
      const paidMemberIds = new Set(currentMonthTxs.map(t => t.memberId));
      const paidCount = members.filter(m => paidMemberIds.has(m.id)).length;

      return h("div", { className: "space-y-6" },
        // Stats Cards
        h("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" },
          h("div", { className: "bg-slate-900 border border-slate-800 rounded-2xl p-5" },
            h("span", { className: "text-xs font-semibold text-slate-400 uppercase" }, "Total Gross Deposits"),
            h("div", { className: "text-2xl font-bold font-mono text-white mt-1" }, formatCurrency(grossTotal)),
            h("span", { className: "text-[11px] text-slate-400 mt-1 block" }, "8 Active Cycles · 11 Members")
          ),
          h("div", { className: "bg-slate-900 border border-slate-800 rounded-2xl p-5" },
            h("span", { className: "text-xs font-semibold text-slate-400 uppercase" }, "Combined Net Treasury"),
            h("div", { className: "text-2xl font-bold font-mono text-emerald-400 mt-1" }, formatCurrency(netTotal)),
            h("span", { className: "text-[11px] text-emerald-400/80 mt-1 block" }, "100% Verified Escrow Balance")
          ),
          h("div", { className: "bg-slate-900 border border-slate-800 rounded-2xl p-5" },
            h("div", { className: "flex justify-between items-center" },
              h("span", { className: "text-xs font-semibold text-slate-400 uppercase" }, "Combined Bank Charge"),
              isAdmin && h("button", {
                onClick: () => {
                  const val = prompt("Enter manual combined bank charge (BDT):", project.totalCombinedBankCharge || 0);
                  if (val !== null) onUpdateBankCharge(parseFloat(val) || 0);
                },
                className: "text-[10px] text-amber-400 hover:underline cursor-pointer"
              }, "Edit")
            ),
            h("div", { className: "text-2xl font-bold font-mono text-amber-300 mt-1" },
              project.totalCombinedBankCharge ? \`-\${formatCurrency(project.totalCombinedBankCharge)}\` : '৳ 0'
            ),
            h("span", { className: "text-[11px] text-slate-400 mt-1 block truncate" }, "Applied on total treasury")
          ),
          h("div", { className: "bg-slate-900 border border-slate-800 rounded-2xl p-5" },
            h("span", { className: "text-xs font-semibold text-slate-400 uppercase" }, "October 2026 Status"),
            h("div", { className: "text-2xl font-bold font-mono text-white mt-1" }, paidCount, " / ", members.length),
            h("span", { className: "text-[11px] text-emerald-400 mt-1 block" }, Math.round((paidCount / members.length) * 100), "% Cleared")
          )
        ),

        // Action Banner
        h("div", { className: "bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-wrap justify-between items-center gap-4" },
          h("div", null,
            h("h2", { className: "text-base font-bold text-white" }, "Initiative Collaborative Ledger"),
            h("p", { className: "text-xs text-slate-400 mt-0.5" },
              "Target: ", formatCurrency(project.monthlyPerMemberExpected), "/member/month · Bank: ", project.bankDetails.bankName, " (Acc: ", project.bankDetails.accountNumber, ")"
            )
          ),
          h("div", { className: "flex items-center gap-2" },
            h("button", {
              onClick: () => onOpenDepositForm(), // AUTO-SELECTS LOGGED-IN MEMBER!
              className: "px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow"
            },
              h(IconFileSpreadsheet, { className: "w-4 h-4" }),
              h("span", null, "Submit Deposit Form")
            ),
            isAdmin && pendingTxs.length > 0 && h("button", {
              onClick: onOpenApprovals,
              className: "px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow animate-pulse"
            },
              h(IconClock, { className: "w-4 h-4" }),
              h("span", null, "Review Pending (", pendingTxs.length, ")")
            )
          )
        ),

        // 11 Members Quick Summary Grid
        h("div", { className: "bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4" },
          h("div", { className: "flex justify-between items-center" },
            h("h3", { className: "text-sm font-bold text-white" }, "Members Deposit Breakdown & Quick PDF Statements"),
            h("span", { className: "text-xs text-slate-400" }, "March to October 2026")
          ),
          h("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" },
            members.map(m => {
              const summary = calculateMemberSummary(m, transactions, project);
              const isSelf = currentMemberId === m.id;
              return h("div", { key: m.id, className: \`p-3 bg-slate-950 rounded-xl border flex flex-col justify-between \${isSelf ? 'border-emerald-600' : 'border-slate-800'}\` },
                h("div", { className: "flex items-center justify-between gap-2 mb-2" },
                  h("div", { className: "flex items-center gap-2 min-w-0" },
                    h("img", { src: m.avatar, alt: m.name, className: "w-8 h-8 rounded-full object-cover shrink-0" }),
                    h("div", { className: "min-w-0" },
                      h("span", { className: "font-bold text-xs text-white block truncate" }, m.name),
                      h("span", { className: "text-[10px] text-slate-400 block truncate" }, m.mobile)
                    )
                  ),
                  summary.isCleared 
                    ? h("span", { className: "text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded font-bold shrink-0" }, "Cleared")
                    : h("span", { className: "text-[10px] bg-rose-950 text-rose-300 border border-rose-800 px-1.5 py-0.5 rounded font-bold shrink-0" }, "Due")
                ),
                h("div", { className: "grid grid-cols-2 gap-1.5 text-[11px] font-mono bg-slate-900 p-2 rounded-lg" },
                  h("div", null,
                    h("span", { className: "text-[9px] text-slate-400 block font-sans" }, "TOTAL PAID"),
                    h("span", { className: "font-bold text-emerald-400" }, formatCurrency(summary.totalDeposited))
                  ),
                  h("div", null,
                    h("span", { className: "text-[9px] text-slate-400 block font-sans" }, "DUE AMOUNT"),
                    h("span", { className: \`font-bold \${summary.totalDue === 0 ? 'text-slate-400' : 'text-rose-400'}\` }, formatCurrency(summary.totalDue))
                  )
                ),
                h("div", { className: "flex items-center justify-between pt-2 mt-2 border-t border-slate-800 text-[11px]" },
                  h("button", {
                    onClick: () => onOpenDepositForm(m.id),
                    className: "text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 cursor-pointer"
                  },
                    h(IconFileSpreadsheet, { className: "w-3 h-3" }),
                    h("span", null, "Deposit")
                  ),
                  h("button", {
                    onClick: () => onExportStatement(m),
                    className: "text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 cursor-pointer"
                  },
                    h(IconPrinter, { className: "w-3 h-3" }),
                    h("span", null, "PDF Statement")
                  )
                )
              );
            })
          )
        )
      );
    }

    // --- REQUIREMENT 4: MOBILE-RESPONSIVE TRANSACTIONS VIEW ---
    function TransactionsView({ transactions, members, project, isAdmin, onViewReceipt, onApprove, onDelete }) {
      const [filterCycle, setFilterCycle] = useState('All');
      const [filterStatus, setFilterStatus] = useState('All');

      const filtered = useMemo(() => {
        return transactions.filter(t => {
          if (filterCycle !== 'All' && t.monthPeriod !== filterCycle) return false;
          if (filterStatus !== 'All' && t.status !== filterStatus) return false;
          return true;
        });
      }, [transactions, filterCycle, filterStatus]);

      return h("div", { className: "space-y-4" },
        // Filters
        h("div", { className: "bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap justify-between items-center gap-3 text-xs" },
          h("div", { className: "flex flex-wrap items-center gap-2" },
            h("span", { className: "font-semibold text-slate-400" }, "Filter Cycle:"),
            h("select", {
              value: filterCycle,
              onChange: (e) => setFilterCycle(e.target.value),
              className: "bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
            },
              h("option", { value: "All" }, "All Months"),
              INITIATIVE_CYCLES.map(c => h("option", { key: c, value: c }, c))
            ),
            h("span", { className: "font-semibold text-slate-400 ml-2" }, "Status:"),
            h("select", {
              value: filterStatus,
              onChange: (e) => setFilterStatus(e.target.value),
              className: "bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
            },
              h("option", { value: "All" }, "All Statuses"),
              h("option", { value: "Verified" }, "Verified"),
              h("option", { value: "Pending Review" }, "Pending Review"),
              h("option", { value: "Flagged" }, "Flagged")
            )
          ),
          h("div", { className: "font-mono text-slate-400" },
            "Showing ", h("strong", { className: "text-white" }, filtered.length), " of ", transactions.length, " Deposits"
          )
        ),

        // Responsive Container: Mobile Cards (< md) + Desktop Table (>= md)
        h("div", { className: "bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm" },
          // A. MOBILE CARD VIEW (< md)
          h("div", { className: "md:hidden divide-y divide-slate-800" },
            filtered.length === 0 ? (
              h("div", { className: "py-12 text-center text-slate-500 text-xs" }, "No transactions match your filter.")
            ) : (
              filtered.map(t => {
                const member = members.find(m => m.id === t.memberId);
                return h("div", { key: t.id, className: "p-4 space-y-3" },
                  // Member & Status row
                  h("div", { className: "flex items-start justify-between gap-2" },
                    h("div", { className: "flex items-center gap-2.5 min-w-0" },
                      member?.avatar ? h("img", { src: member.avatar, alt: t.memberName, className: "w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-slate-700" }) : null,
                      h("div", { className: "min-w-0" },
                        h("span", { className: "font-bold text-xs text-white block truncate" }, t.memberName),
                        h("span", { className: "text-[10px] text-slate-400 font-mono block" }, formatDate(t.date), " · ", t.monthPeriod)
                      )
                    ),
                    h("span", {
                      className: \`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 \${
                        t.status === 'Verified' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' :
                        t.status === 'Pending Review' ? 'bg-amber-950 text-amber-300 border-amber-800 animate-pulse' :
                        'bg-rose-950 text-rose-300 border-rose-800'
                      }\`
                    }, t.status)
                  ),

                  // Amount and Bank Details
                  h("div", { className: "grid grid-cols-2 gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-mono text-xs" },
                    h("div", null,
                      h("span", { className: "text-[9px] uppercase text-slate-500 block font-sans" }, "DEPOSIT CREDITED"),
                      h("span", { className: "font-bold text-emerald-400 text-sm" }, formatCurrency(t.amount, project.symbol))
                    ),
                    h("div", null,
                      h("span", { className: "text-[9px] uppercase text-slate-500 block font-sans" }, "REFERENCE"),
                      h("span", { className: "text-slate-300 truncate block text-[11px]" }, t.referenceNumber)
                    )
                  ),

                  // Actions row
                  h("div", { className: "flex items-center justify-between pt-1 text-xs" },
                    h("span", { className: "text-[11px] text-slate-400 font-mono" }, t.bankOrChannel || t.method),
                    h("div", { className: "flex items-center gap-2" },
                      h("button", {
                        onClick: () => onViewReceipt(t),
                        className: "px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                      },
                        h(IconEye, { className: "w-3 h-3 text-emerald-400" }),
                        h("span", null, "Voucher")
                      ),
                      t.status === 'Pending Review' && isAdmin && h("button", {
                        onClick: () => onApprove(t),
                        className: "px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[11px] font-bold cursor-pointer"
                      }, "Approve"),
                      isAdmin && h("button", {
                        onClick: () => onDelete(t.id),
                        className: "p-1 text-slate-500 hover:text-rose-400 cursor-pointer",
                        title: "Delete"
                      }, h(IconTrash, { className: "w-3.5 h-3.5" }))
                    )
                  )
                );
              })
            )
          ),

          // B. DESKTOP DATA TABLE (>= md) WITH SMOOTH HORIZONTAL SCROLL & FIXED NAMES
          h("div", { className: "hidden md:block overflow-x-auto whitespace-nowrap" },
            h("table", { className: "w-full text-left text-xs border-collapse" },
              h("thead", { className: "bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-semibold text-[11px]" },
                h("tr", null,
                  h("th", { className: "py-3 px-4" }, "Member"),
                  h("th", { className: "py-3 px-4" }, "Date"),
                  h("th", { className: "py-3 px-4" }, "Cycle / Month"),
                  h("th", { className: "py-3 px-4 text-right" }, "Deposit Amount"),
                  h("th", { className: "py-3 px-4" }, "Channel / Bank"),
                  h("th", { className: "py-3 px-4" }, "Reference / TrxID"),
                  h("th", { className: "py-3 px-4 text-center" }, "Status"),
                  h("th", { className: "py-3 px-4 text-right" }, "Actions")
                )
              ),
              h("tbody", { className: "divide-y divide-slate-800 font-mono text-[11px]" },
                filtered.length === 0 ? (
                  h("tr", null, h("td", { colSpan: 8, className: "py-10 text-center text-slate-500 font-sans" }, "No transactions match your filter."))
                ) : (
                  filtered.map(t => {
                    const member = members.find(m => m.id === t.memberId);
                    return h("tr", { key: t.id, className: "hover:bg-slate-850/60 transition-colors" },
                      h("td", { className: "py-2.5 px-4 font-sans font-bold text-white flex items-center gap-2" },
                        member?.avatar ? h("img", { src: member.avatar, alt: t.memberName, className: "w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-slate-700" }) : null,
                        h("span", null, t.memberName)
                      ),
                      h("td", { className: "py-2.5 px-4 text-slate-300" }, formatDate(t.date)),
                      h("td", { className: "py-2.5 px-4 text-slate-200 font-sans font-medium" }, t.monthPeriod),
                      h("td", { className: "py-2.5 px-4 text-right font-bold text-emerald-400 text-xs" }, formatCurrency(t.amount, project.symbol)),
                      h("td", { className: "py-2.5 px-4 text-slate-300 font-sans" }, t.bankOrChannel || t.method),
                      h("td", { className: "py-2.5 px-4 text-slate-400" }, t.referenceNumber),
                      h("td", { className: "py-2.5 px-4 text-center" },
                        h("span", {
                          className: \`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border \${
                            t.status === 'Verified' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' :
                            t.status === 'Pending Review' ? 'bg-amber-950 text-amber-300 border-amber-800 animate-pulse' :
                            'bg-rose-950 text-rose-300 border-rose-800'
                          }\`
                        }, t.status)
                      ),
                      h("td", { className: "py-2.5 px-4 text-right font-sans" },
                        h("div", { className: "flex items-center justify-end gap-1.5" },
                          t.status === 'Pending Review' && isAdmin && h("button", {
                            onClick: () => onApprove(t),
                            className: "px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg cursor-pointer text-[10px]"
                          }, "Approve"),
                          h("button", {
                            onClick: () => onViewReceipt(t),
                            className: "p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer",
                            title: "View Receipt"
                          }, h(IconEye, { className: "w-3.5 h-3.5 text-emerald-400" })),
                          isAdmin && h("button", {
                            onClick: () => onDelete(t.id),
                            className: "p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 cursor-pointer",
                            title: "Delete Transaction"
                          }, h(IconTrash, { className: "w-3.5 h-3.5" }))
                        )
                      )
                    );
                  })
                )
              )
            )
          )
        )
      );
    }

    // --- REQUIREMENT 3: NOMINEE & PERSONAL PRIVACY PROTECTION IN MEMBERS VIEW ---
    function MembersView({ members, transactions, project, currentMemberId, isAdmin, onOpenDepositForm, onExportStatement, onEditProfile, onUpdateProfile }) {
      return h("div", { className: "space-y-4" },
        h("div", { className: "bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap justify-between items-center gap-3" },
          h("div", { className: "flex items-center gap-2" },
            h(IconUsers, { className: "w-5 h-5 text-emerald-400" }),
            h("h2", { className: "text-base font-bold text-white" }, "11 Syndicate Participating Members")
          ),
          h("div", { className: "flex items-center gap-2" },
            h("span", { className: "text-xs font-mono text-slate-400" }, "Target: 2,000 BDT/month · March to October 2026")
          )
        ),

        h("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" },
          members.map(member => {
            const isSelf = currentMemberId === member.id;
            const canViewPrivateDetails = isAdmin || isSelf;
            const summary = calculateMemberSummary(member, transactions, project);

            return h("div", { key: member.id, className: \`bg-slate-900 border rounded-2xl p-5 flex flex-col justify-between space-y-4 \${isSelf ? 'border-emerald-600 shadow-emerald-950/40 shadow-lg' : 'border-slate-800'}\` },
              // Member Header
              h("div", null,
                h("div", { className: "flex items-center justify-between gap-3 mb-3" },
                  h("div", { className: "flex items-center gap-3 min-w-0" },
                    h("img", { src: member.avatar, alt: member.name, className: "w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500/40 shrink-0" }),
                    h("div", { className: "min-w-0" },
                      h("div", { className: "flex items-center gap-1.5" },
                        h("h3", { className: "font-bold text-white text-sm truncate" }, member.name),
                        member.role === 'admin' ? h("span", { className: "text-[9px] bg-emerald-950 text-emerald-400 font-bold px-1.5 py-0.5 rounded border border-emerald-800 shrink-0" }, "ADMIN") :
                        isSelf ? h("span", { className: "text-[9px] bg-emerald-950 text-emerald-400 font-bold px-1.5 py-0.5 rounded border border-emerald-800 shrink-0" }, "YOU") : null
                      ),
                      h("span", { className: "text-xs text-slate-400 block font-mono" }, member.mobile)
                    )
                  ),
                  summary.isCleared 
                    ? h("span", { className: "text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-bold shrink-0" }, "0 Due")
                    : h("span", { className: "text-[10px] bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded font-bold shrink-0" }, "Due")
                ),

                // Financial Breakdown
                h("div", { className: "grid grid-cols-3 gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs font-mono text-center mb-3" },
                  h("div", null,
                    h("span", { className: "text-[9px] text-slate-500 block font-sans uppercase font-semibold" }, "Total Deposited"),
                    h("span", { className: "font-bold text-emerald-400 text-xs block mt-0.5" }, formatCurrency(summary.totalDeposited))
                  ),
                  h("div", null,
                    h("span", { className: "text-[9px] text-slate-500 block font-sans uppercase font-semibold" }, "Due (Mar-Oct)"),
                    h("span", { className: \`font-bold text-xs block mt-0.5 \${summary.totalDue === 0 ? 'text-slate-400' : 'text-rose-400'}\` }, formatCurrency(summary.totalDue))
                  ),
                  h("div", null,
                    h("span", { className: "text-[9px] text-slate-500 block font-sans uppercase font-semibold" }, "Cycles"),
                    h("span", { className: "font-bold text-white text-xs block mt-0.5" }, summary.clearedCount, " / ", summary.totalMonths)
                  )
                ),

                // REQUIREMENT 3: ROLE PRIVACY PROTECTION FOR NOMINEE & EMERGENCY CONTACT
                h("div", { className: "space-y-1.5 text-xs bg-slate-950/70 p-3 rounded-xl border border-slate-800" },
                  canViewPrivateDetails ? (
                    h("div", { className: "space-y-1.5" },
                      member.nomineeName && h("div", { className: "flex items-center justify-between" },
                        h("span", { className: "text-slate-500 flex items-center gap-1.5 text-[11px]" },
                          h(IconHeart, { className: "w-3.5 h-3.5 text-rose-400" }),
                          h("span", null, "Nominee:")
                        ),
                        h("span", { className: "text-slate-200 font-medium truncate max-w-[170px]" },
                          member.nomineeName, " (", member.nomineeRelation || 'Nominee', ")"
                        )
                      ),
                      // REQUIREMENT 1: EMERGENCY CONTACT SECTION
                      member.emergencyContactName ? (
                        h("div", { className: "flex items-center justify-between pt-1 border-t border-slate-800/60" },
                          h("span", { className: "text-slate-500 flex items-center gap-1.5 text-[11px]" },
                            h(IconAlertTriangle, { className: "w-3.5 h-3.5 text-amber-400" }),
                            h("span", null, "Emergency:")
                          ),
                          h("span", { className: "text-slate-200 font-medium truncate max-w-[170px]" },
                            member.emergencyContactName, " (", member.emergencyContactRelation || 'Contact', ")"
                          )
                        )
                      ) : (
                        h("div", { className: "flex items-center justify-between pt-1 border-t border-slate-800/60 text-slate-500 text-[11px]" },
                          h("span", null, "Emergency Contact:"),
                          h("span", { className: "italic" }, "Not set")
                        )
                      )
                    )
                  ) : (
                    h("div", { className: "flex items-center justify-between text-slate-500 text-[11px]" },
                      h("span", { className: "flex items-center gap-1.5" },
                        h(IconShieldCheck, { className: "w-3.5 h-3.5 text-slate-500" }),
                        h("span", null, "Nominee & Emergency:")
                      ),
                      h("span", { className: "italic" }, "Protected (Member & Admin Only)")
                    )
                  )
                )
              ),

              // Action Buttons
              h("div", { className: "pt-3 border-t border-slate-800 flex items-center justify-between gap-2 text-xs" },
                h("button", {
                  onClick: () => onExportStatement(member),
                  className: "flex-1 py-1.5 px-2 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-xl border border-emerald-500/30 font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer",
                  title: "Export single member PDF statement"
                },
                  h(IconFileText, { className: "w-3.5 h-3.5" }),
                  h("span", null, "PDF Statement")
                ),
                h("button", {
                  onClick: () => onOpenDepositForm(member.id),
                  className: "py-1.5 px-2.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-xl border border-indigo-500/30 font-medium flex items-center gap-1 transition-all cursor-pointer",
                  title: \`Deposit for \${member.name}\`
                },
                  h(IconFileSpreadsheet, { className: "w-3.5 h-3.5" }),
                  h("span", null, "Deposit")
                ),
                canViewPrivateDetails && h("button", {
                  onClick: () => onEditProfile(member),
                  className: "p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors cursor-pointer",
                  title: "Edit profile & emergency details"
                }, h(IconEdit, { className: "w-3.5 h-3.5" }))
              )
            );
          })
        )
      );
    }

    // Initialize Root
    const rootElement = document.getElementById('root');
    const root = ReactDOM.createRoot(rootElement);
    root.render(h(App, null));
  </script>
</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, '..', 'standalone_export', 'index.html'), htmlContent, 'utf8');
console.log('Successfully generated standalone_export/index.html! Length:', htmlContent.length);
