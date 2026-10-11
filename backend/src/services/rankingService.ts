/**
 * Trending Score Calculation based on blueprint:
 * Trending Score =
 *   Views * 0.20
 * + Followers * 0.25
 * + Saves * 0.15
 * + Engagement * 0.20
 * + Recent Activity * 0.20
 */
export function calculateTrendingScore(metrics: {
  viewCount: number;
  followerCount: number;
  saveCount: number;
  engagementScore?: number;
  recentActivityScore?: number;
}): number {
  const views = metrics.viewCount || 0;
  const followers = metrics.followerCount || 0;
  const saves = metrics.saveCount || 0;
  const engagement = metrics.engagementScore ?? Math.min(views * 0.1 + followers * 0.5, 100);
  const recent = metrics.recentActivityScore ?? 25;

  const score = views * 0.20 + followers * 0.25 + saves * 0.15 + engagement * 0.20 + recent * 0.20;
  return Number(score.toFixed(1));
}
