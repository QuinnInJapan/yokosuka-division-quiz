import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SukarinCard } from './SukarinCard';

describe('SukarinCard', () => {
  const props = {
    name: '街のよろず屋',
    desc: '市民に寄り添う万能タイプ。',
    userScores: { A: 1.6, B: 1.2, C: 1.7, D: 1.0, E: 1.4 } as const,
    imageSrc: '/test-sukarin.png',
  };

  it('renders the name with the 型 suffix', () => {
    const html = renderToStaticMarkup(<SukarinCard {...props} />);
    expect(html).toContain('街のよろず屋');
    expect(html).toContain('型');
  });

  it('renders the description text', () => {
    const html = renderToStaticMarkup(<SukarinCard {...props} />);
    expect(html).toContain('市民に寄り添う万能タイプ。');
  });

  it('renders the sukarin image when imageSrc is provided', () => {
    const html = renderToStaticMarkup(<SukarinCard {...props} />);
    expect(html).toMatch(/<img[^>]+src="\/test-sukarin\.png"/);
    expect(html).toMatch(/<img[^>]+alt="街のよろず屋型のスカリン"/);
  });

  it('omits the image when imageSrc is undefined', () => {
    const html = renderToStaticMarkup(<SukarinCard {...props} imageSrc={undefined} />);
    expect(html).not.toContain('<img');
  });
});
