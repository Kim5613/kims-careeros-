import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 用日期做随机种子，同一天显示同一句
function seededRandom(seed: number): number {
  let s = seed;
  s = (s * 9301 + 49297) % 233280;
  return s / 233280;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get('date') || new Date().toISOString().slice(0, 10);

    // 用日期生成种子
    const seed = dateStr.split('-').reduce((a, c) => a + parseInt(c), 0);

    // 优先取未使用的
    const unused = await prisma.movieQuote.findMany({ where: { used: false } });

    let quote;
    if (unused.length > 0) {
      // 用种子从池子里选一句
      const idx = Math.floor(seededRandom(seed) * unused.length);
      quote = unused[Math.min(idx, unused.length - 1)];
      // 标记已用
      await prisma.movieQuote.update({ where: { id: quote.id }, data: { used: true, usedAt: new Date() } });
    } else {
      // 全部用完了，重置所有
      await prisma.movieQuote.updateMany({ data: { used: false, usedAt: null } });
      const all = await prisma.movieQuote.findMany();
      if (all.length > 0) {
        const idx = Math.floor(seededRandom(seed) * all.length);
        quote = all[Math.min(idx, all.length - 1)];
        await prisma.movieQuote.update({ where: { id: quote.id }, data: { used: true, usedAt: new Date() } });
      }
    }

    if (!quote) {
      return NextResponse.json({ quote: '生活就像一盒巧克力', movie: '《阿甘正传》' });
    }

    return NextResponse.json({
      quote: quote.quote,
      translation: quote.translation || undefined,
      movie: quote.movie,
    });
  } catch (error) {
    console.error('Movie quote error:', error);
    return NextResponse.json({ quote: '生活就像一盒巧克力', movie: '《阿甘正传》' });
  }
}
