import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SukarinCard } from './SukarinCard';

describe('SukarinCard', () => {
  const props = {
    code: 'DASCG',
    name: '街のよろず屋',
    desc: '市民に寄り添う万能タイプ。',
    userScores: { A: 1.6, B: 1.2, C: 1.7, D: 1.0, E: 1.4 } as const,
    imageSrc: '/test-sukarin.png',
  };

  it('renders code, name (with quoted format), and description', () => {
    const html = renderToStaticMarkup(<SukarinCard {...props} />);
    expect(html).toContain('DASCG');
    expect(html).toContain('「街のよろず屋」型');
    expect(html).toContain('市民に寄り添う万能タイプ。');
  });

  it('renders five chips with kanji per axis', () => {
    const html = renderToStaticMarkup(<SukarinCard {...props} />);
    // positive scores → kanji_plus for A=人, B=動, C=援, D=守, E=幅
    for (const k of ['人', '動', '援', '守', '幅']) {
      expect(html, `missing chip kanji ${k}`).toContain(k);
    }
  });

  it('renders the eyebrow label', () => {
    const html = renderToStaticMarkup(<SukarinCard {...props} />);
    expect(html).toContain('あなたのスカリン');
  });

  it('renders the image when imageSrc is provided', () => {
    const html = renderToStaticMarkup(<SukarinCard {...props} />);
    expect(html).toMatch(/<img[^>]+src="\/test-sukarin\.png"/);
  });

  it('omits the image when imageSrc is undefined', () => {
    const html = renderToStaticMarkup(<SukarinCard {...props} imageSrc={undefined} />);
    expect(html).not.toContain('<img');
  });
});
