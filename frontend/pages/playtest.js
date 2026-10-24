import { playtestSection, cancellationForm } from '../components/playtest.js';
export function playtest() {
  return `<div class="container"><header class="page-heading"><a class="back-link" href="/">← Kembali ke beranda</a><h1>Ikut bikin<br><span>Ndobol makin seru.</span></h1><p>Daftar minat untuk sesi pengujian bersama tim DeEs.</p></header></div>${playtestSection()}${cancellationForm()}`;
}
