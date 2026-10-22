export function escapeHtml(value: string | number): string {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char]!);
}

export function httpsUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
}

export function externalLink(url: string, label: string, className = ''): string {
  const safeUrl = httpsUrl(url);
  return safeUrl
    ? `<a class="${escapeHtml(className)}" href="${escapeHtml(safeUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}<span class="sr-only"> (새 탭)</span><span aria-hidden="true"> ↗</span></a>`
    : `<span>${escapeHtml(label)} · 링크 확인 필요</span>`;
}
