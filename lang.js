// 소개·테스트 페이지 한·영 전환. <head> 에서 바로 실행해 첫 화면부터 고른 언어로 그린다.
// 글은 두 언어를 나란히 둔다: <span lang="ko">…</span><span lang="en">…</span>. <html lang> 과 다른 쪽을 페이지 CSS 가 숨긴다.
// 언어: 주소의 ?lang=ko|en → 저장된 선택 → 브라우저 언어 (ko 로 시작하면 한국어, 그 밖은 영어. 게임과 같은 규칙)
// CSS 로 못 바꾸는 것: 페이지 제목·설명은 <html data-title-en data-desc-en> (없으면 그대로), 나머지 속성 글자는 langchange 이벤트로.
(() => {
  const KEY = 'enlevel-site-lang';
  const root = document.documentElement;
  const meta = document.querySelector('meta[name="description"]');
  const ko = { title: document.title, desc: meta?.content };

  const valid = (lang) => (lang === 'ko' || lang === 'en' ? lang : null);
  const stored = () => {
    try {
      return valid(localStorage.getItem(KEY));
    } catch {
      return null;
    }
  };
  const save = (lang) => {
    try {
      localStorage.setItem(KEY, lang);
    } catch {
      /* 저장을 못 해도 이 페이지에서는 바뀐다 */
    }
  };
  const markButtons = () => {
    for (const b of document.querySelectorAll('[data-set-lang]')) b.setAttribute('aria-pressed', String(b.dataset.setLang === root.lang));
  };
  const apply = (lang) => {
    root.lang = lang;
    document.title = lang === 'en' ? (root.dataset.titleEn ?? ko.title) : ko.title;
    if (meta) meta.content = lang === 'en' ? (root.dataset.descEn ?? ko.desc) : ko.desc;
    markButtons();
    document.dispatchEvent(new Event('langchange'));
  };

  const fromUrl = valid(new URLSearchParams(location.search).get('lang'));
  if (fromUrl) save(fromUrl);
  apply(fromUrl ?? stored() ?? (navigator.language?.toLowerCase().startsWith('ko') ? 'ko' : 'en'));

  document.addEventListener('DOMContentLoaded', markButtons);
  document.addEventListener('click', (e) => {
    const lang = e.target.closest?.('[data-set-lang]')?.dataset.setLang;
    if (!lang) return;
    save(lang);
    // 주소에 남은 ?lang= 이 새로 고침 때 선택을 되돌리지 않게
    const url = new URL(location.href);
    url.searchParams.delete('lang');
    history.replaceState(null, '', url);
    apply(lang);
  });
  // 다른 페이지에서 언어를 바꾸고 뒤로 왔을 때 (뒤로 가기 캐시는 스크립트를 다시 돌리지 않는다)
  addEventListener('pageshow', (e) => {
    const lang = e.persisted && stored();
    if (lang && lang !== root.lang) apply(lang);
  });
})();
