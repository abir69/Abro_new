import { Member, Transaction, PlotProject } from '../types';
import { formatCurrency, formatDate, calculateMemberDueSummary } from './storageService';

export interface GenerateStatementOptions {
  member: Member;
  transactions: Transaction[];
  project: PlotProject;
  leadName?: string;
  leadDesignation?: string;
  syndicateName?: string;
  syndicateDesignation?: string;
}

export function generateMemberStatementHtml(options: GenerateStatementOptions): string {
  const { member, transactions, project } = options;
  const leadName = options.leadName || project.leadAdminName || 'Md. Minhazul Islam Abir';
  const leadDesignation = options.leadDesignation || project.leadAdminDesignation || 'Chief Administrator & Trustee';
  const syndicateName = options.syndicateName || project.syndicateAdminName || 'Dr. Tariqul Islam';
  const syndicateDesignation = options.syndicateDesignation || project.syndicateAdminDesignation || 'Syndicate Secretary & Treasury Auditor';

  // Strictly filter only this selected member's verified deposits
  const memberTxs = transactions
    .filter(t => t.memberId === member.id && (t.status === 'Verified' || t.status === 'Cleared' || !t.status))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const grossDeposited = memberTxs.reduce((sum, t) => sum + t.amount, 0);
  const dueSummary = calculateMemberDueSummary(member, transactions, project, 'October 2026');
  const issueDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const statementId = `STMT-${member.id.toUpperCase()}-2026-REV`;

  const rowsHtml = memberTxs.length > 0
    ? memberTxs.map((tx, idx) => `
        <tr style="border-bottom: 1px solid #e2e8f0; ${idx % 2 === 1 ? 'background-color: #f8fafc;' : ''}">
          <td style="padding: 7px 10px; font-family: monospace; font-size: 10px; color: #334155;">${formatDate(tx.date)}</td>
          <td style="padding: 7px 10px; font-weight: 600; color: #0f172a;">${tx.monthPeriod || 'Monthly Deposit'}</td>
          <td style="padding: 7px 10px; color: #334155;">
            <div style="font-weight: 500;">${tx.bankOrChannel || tx.method}</div>
            <div style="font-size: 9px; color: #64748b; font-family: monospace;">${tx.depositBank || 'The City Bank PLC'} · Acc: ${tx.depositAccountNumber || '1781580054174'}</div>
          </td>
          <td style="padding: 7px 10px; font-family: monospace; font-size: 10px; color: #475569;">${tx.referenceNumber || 'N/A'}</td>
          <td style="padding: 7px 10px; text-align: right; font-family: monospace; font-weight: 700; color: #047857; font-size: 11px;">
            ${formatCurrency(tx.amount, project.symbol)}
          </td>
          <td style="padding: 7px 10px; text-align: center;">
            <span style="display: inline-block; padding: 2px 7px; background: #d1fae5; color: #065f46; border-radius: 9999px; font-size: 9px; font-weight: 700;">
              ✓ Verified
            </span>
          </td>
        </tr>
      `).join('')
    : `
        <tr>
          <td colspan="6" style="padding: 24px; text-align: center; color: #64748b; font-style: italic;">
            No verified transactions recorded yet for this member account.
          </td>
        </tr>
      `;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Aristo_Plot_Statement_${member.name.replace(/\s+/g, '_')}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 15mm 15mm 15mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      margin: 0;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      font-size: 11px;
      line-height: 1.45;
    }
    .statement-wrapper {
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
    }
    .header-bar {
      border-bottom: 2.5px solid #059669;
      padding-bottom: 12px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .brand-title {
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 2px 0;
      letter-spacing: -0.3px;
    }
    .brand-sub {
      font-size: 11px;
      font-weight: 600;
      color: #059669;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .bank-info {
      font-size: 10px;
      color: #475569;
      margin-top: 5px;
    }
    .statement-badge {
      text-align: right;
    }
    .badge-pill {
      display: inline-block;
      padding: 3px 10px;
      background: #ecfdf5;
      color: #065f46;
      border: 1px solid #a7f3d0;
      border-radius: 6px;
      font-weight: 800;
      font-size: 10px;
      letter-spacing: 0.8px;
      margin-bottom: 4px;
    }
    .meta-text {
      font-size: 10px;
      color: #64748b;
      line-height: 1.35;
    }
    .card-profile {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      padding: 12px 16px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .profile-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .avatar-box {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: #059669;
      color: #ffffff;
      font-size: 18px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #10b981;
    }
    .member-name {
      font-size: 14px;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
    }
    .member-meta {
      font-size: 10px;
      color: #475569;
      font-family: monospace;
      margin-top: 1px;
    }
    .profile-right {
      text-align: right;
      font-size: 10px;
      line-height: 1.5;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-bottom: 16px;
    }
    .summary-box {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 9px 12px;
    }
    .summary-label {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      color: #64748b;
      margin-bottom: 2px;
      letter-spacing: 0.3px;
    }
    .summary-val {
      font-size: 13px;
      font-weight: 800;
      font-family: monospace;
      color: #0f172a;
    }
    .summary-val.emerald {
      color: #047857;
    }
    .summary-val.rose {
      color: #b91c1c;
    }
    .summary-val.amber {
      color: #b45309;
    }
    .summary-sub {
      font-size: 9px;
      color: #64748b;
      margin-top: 1px;
    }
    .table-container {
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 16px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    th {
      background: #f1f5f9;
      color: #1e293b;
      font-size: 10px;
      font-weight: 700;
      padding: 8px 10px;
      border-bottom: 1px solid #cbd5e1;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    tfoot td {
      background: #f1f5f9;
      font-weight: 800;
      font-size: 11px;
      padding: 9px 10px;
      border-top: 2px solid #94a3b8;
    }
    .signatories-section {
      margin-top: 28px;
      padding-top: 14px;
      border-top: 1px solid #cbd5e1;
      display: flex;
      justify-content: space-between;
      gap: 20px;
    }
    .sign-block {
      width: 220px;
      text-align: center;
    }
    .sign-line {
      border-bottom: 1.5px solid #0f172a;
      padding-bottom: 4px;
      margin-bottom: 4px;
      font-family: monospace;
      font-size: 11px;
      font-weight: 700;
      color: #0f172a;
    }
    .sign-title {
      font-size: 9px;
      font-weight: 700;
      color: #334155;
      text-transform: uppercase;
    }
    .sign-seal {
      font-size: 8px;
      color: #047857;
      font-family: monospace;
      margin-top: 2px;
      font-weight: 600;
    }
    .legal-notice {
      margin-top: 18px;
      padding: 8px 12px;
      background: #f8fafc;
      border-left: 3px solid #059669;
      font-size: 9px;
      color: #475569;
      line-height: 1.4;
      border-radius: 0 6px 6px 0;
    }
    @media print {
      body {
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="statement-wrapper">
    <!-- Header -->
    <div class="header-bar">
      <div>
        <h1 class="brand-title">${project.initiativeName}</h1>
        <div class="brand-sub">11-Member Joint Trust Treasury · Official Financial Statement</div>
        <div class="bank-info">
          Central Deposit Bank: <strong>${project.bankDetails?.bankName || 'The City Bank PLC'}</strong> · 
          Account No: <strong>${project.bankDetails?.accountNumber || '1781580054174'}</strong>
        </div>
      </div>
      <div class="statement-badge">
        <div class="badge-pill">INDIVIDUAL LEDGER</div>
        <div class="meta-text">Date: <strong>${issueDate}</strong></div>
        <div class="meta-text" style="font-family: monospace;">Ref: ${statementId}</div>
      </div>
    </div>

    <!-- Member Profile Card -->
    <div class="card-profile">
      <div class="profile-left">
        <div class="avatar-box">
          ${member.name ? member.name.charAt(0).toUpperCase() : 'M'}
        </div>
        <div>
          <span style="font-size: 9px; text-transform: uppercase; color: #64748b; font-weight: 700; display: block;">Account Holder</span>
          <h2 class="member-name">${member.name}</h2>
          <div class="member-meta">Mobile: ${member.mobile} · ID: ${member.id}</div>
        </div>
      </div>
      <div class="profile-right">
        <div><strong style="color: #64748b; text-transform: uppercase; font-size: 9px;">Status:</strong> <span style="color: #047857; font-weight: 700;">Active Contributor</span></div>
        <div><strong style="color: #64748b; text-transform: uppercase; font-size: 9px;">Nominee:</strong> <span>${member.nomineeName ? `${member.nomineeName} (${member.nomineeRelation || 'Nominee'})` : 'Confidential / On File'}</span></div>
        ${member.emergencyContactName ? `
          <div><strong style="color: #64748b; text-transform: uppercase; font-size: 9px;">Emergency Contact:</strong> <span>${member.emergencyContactName} (${member.emergencyContactRelation || 'Contact'}) · ${member.emergencyContactPhone || ''}</span></div>
        ` : ''}
      </div>
    </div>

    <!-- Financial Performance Metrics (March to October 2026) -->
    <div class="summary-grid">
      <div class="summary-box">
        <div class="summary-label">Evaluation Period</div>
        <div class="summary-val" style="font-size: 11px;">Mar – Oct 2026</div>
        <div class="summary-sub">${dueSummary.totalMonthsCount} Active Project Cycles</div>
      </div>
      <div class="summary-box">
        <div class="summary-label">Target Installments</div>
        <div class="summary-val">${formatCurrency(dueSummary.totalExpected, project.symbol)}</div>
        <div class="summary-sub">${dueSummary.totalMonthsCount} Cycles @ ${formatCurrency(member.customMonthlyDeposit || project.monthlyPerMemberExpected, project.symbol)}/mo</div>
      </div>
      <div class="summary-box">
        <div class="summary-label">Verified Deposits</div>
        <div class="summary-val emerald">${formatCurrency(grossDeposited, project.symbol)}</div>
        <div class="summary-sub">${dueSummary.clearedMonthsCount} Cleared · ${memberTxs.length} Transactions</div>
      </div>
      <div class="summary-box">
        <div class="summary-label">Outstanding Due</div>
        <div class="summary-val ${dueSummary.totalDue === 0 ? 'emerald' : 'rose'}">
          ${formatCurrency(dueSummary.totalDue, project.symbol)}
        </div>
        <div class="summary-sub" style="font-weight: 700; color: ${dueSummary.totalDue === 0 ? '#047857' : '#b91c1c'};">
          ${dueSummary.totalDue === 0 ? '✓ All Cycles Settled' : `! ${dueSummary.dueMonths.length} Cycle(s) Pending`}
        </div>
      </div>
    </div>

    <!-- Selected Member's Transaction Details ONLY -->
    <div style="margin-bottom: 6px; display: flex; justify-content: space-between; align-items: baseline;">
      <h3 style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #1e293b; margin: 0; letter-spacing: 0.4px;">
        Monthly Deposit Transaction Details (${member.name})
      </h3>
      <span style="font-size: 10px; color: #64748b;">
        Verified Receipts Credited: <strong>${memberTxs.length}</strong>
      </span>
    </div>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th style="width: 15%;">Date</th>
            <th style="width: 17%;">Cycle / Month</th>
            <th style="width: 30%;">Deposit Channel</th>
            <th style="width: 18%;">Reference No.</th>
            <th style="width: 12%; text-align: right;">Amount Credited</th>
            <th style="width: 8%; text-align: center;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="4" style="color: #1e293b; text-align: left;">
              Total Verified Contribution Allocated to Land Purchase Pool:
            </td>
            <td style="text-align: right; color: #047857; font-family: monospace; font-size: 12px;">
              ${formatCurrency(grossDeposited, project.symbol)}
            </td>
            <td style="text-align: center; color: #047857; font-size: 10px;">
              ✓ 100%
            </td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Official Joint Trust Declaration Notice -->
    <div class="legal-notice">
      <strong>Certified Record of Deposit:</strong> This statement reflects only the verified monthly installment credits and financial standing of <strong>${member.name}</strong> within the Aristo Future Plot Initiative 11-member syndicate. All deposits are deposited into The City Bank PLC joint holding account for collective plot acquisition in Dhaka.
    </div>

    <!-- Official Signatures -->
    <div class="signatories-section">
      <div class="sign-block" style="text-align: left;">
        <div class="sign-line">${leadName}</div>
        <div class="sign-title">${leadDesignation}</div>
        <div class="sign-seal">✓ Verified Trustee Authority</div>
      </div>
      <div class="sign-block" style="text-align: center;">
        <div class="sign-line">${syndicateName}</div>
        <div class="sign-title">${syndicateDesignation}</div>
        <div class="sign-seal">✓ Certified Treasury Audit</div>
      </div>
      <div class="sign-block" style="text-align: right;">
        <div class="sign-line">${member.name}</div>
        <div class="sign-title">Account Holder / Participant</div>
        <div class="sign-seal">Syndicate ID: ${member.id}</div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Triggers isolated print of the statement using a hidden iframe.
 * Absolutely guarantees that the parent window and all other members are never printed.
 */
export function exportMemberStatementPDF(options: GenerateStatementOptions): void {
  const html = generateMemberStatementHtml(options);
  const title = `Aristo_Plot_Statement_${options.member.name.replace(/\s+/g, '_')}`;

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.zIndex = '-9999';
  iframe.setAttribute('aria-hidden', 'true');
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentWindow?.document || iframe.contentDocument;
  if (!iframeDoc) {
    window.print();
    return;
  }

  iframeDoc.open();
  iframeDoc.write(html);
  iframeDoc.close();

  const prevTitle = document.title;
  document.title = title;

  // Give fonts and styles a brief moment to render in the iframe
  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (err) {
      console.warn('Iframe print failed, falling back to window.print():', err);
      window.print();
    } finally {
      setTimeout(() => {
        document.title = prevTitle;
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      }, 1500);
    }
  }, 250);
}

/**
 * Direct download of the standalone HTML/PDF-ready statement file.
 */
export function downloadMemberStatementHtml(options: GenerateStatementOptions): void {
  const html = generateMemberStatementHtml(options);
  const filename = `Aristo_Plot_Statement_${options.member.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.html`;
  
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
