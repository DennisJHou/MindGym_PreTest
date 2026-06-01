// 學校合作版：當網址帶有 ?edu 參數時，隱藏 PSY by PSY 商業品牌
// （測驗頁面不顯示商業團隊 logo）。
// 一般網址（不帶參數）維持原樣，分享出去的版本仍保有 logo。
//
// 學校版網址範例： https://你的網站/?edu
export const HIDE_LOGO =
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).has('edu')
