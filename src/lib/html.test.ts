import { describe, expect, it } from 'vitest';
import { escapeHtml, externalLink, httpsUrl } from './html.ts';

describe('데이터를 안전한 화면 텍스트로 표시', () => {
  it('제품 이름의 태그와 따옴표가 HTML로 실행되지 않는다', () => {
    expect(escapeHtml('<a title="x">&')).toBe('&lt;a title=&quot;x&quot;&gt;&amp;');
  });
  it('HTTPS만 새 탭 링크로 허용하고 안전한 rel을 유지한다', () => {
    expect(httpsUrl('javascript:alert(1)')).toBeNull();
    expect(httpsUrl('https://name:secret@example.com')).toBeNull();
    expect(externalLink('https://www.daisomall.co.kr/', '<구매>')).toContain('rel="noopener noreferrer"');
    expect(externalLink('javascript:alert(1)', '구매')).not.toContain('<a');
  });
});
