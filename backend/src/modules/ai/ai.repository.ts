import { prisma } from '../../prisma/client.js';

export interface AiInsightRecord {
  id: string;
  userId: string;
  type: string;
  title: string;
  content: string;
  action: string | null;
  impactScore: number;
  dismissed: boolean;
  createdAt: Date;
}

const memoryAiInsights = new Map<string, AiInsightRecord>();

export class AiRepository {
  private isTestMode(): boolean {
    return process.env.NODE_ENV === 'test';
  }

  async createMany(
    userId: string,
    insights: Array<{
      type: string;
      title: string;
      content: string;
      action?: string | null;
      impactScore: number;
    }>
  ): Promise<AiInsightRecord[]> {
    const results: AiInsightRecord[] = [];

    for (const item of insights) {
      const meta = {
        title: item.title,
        action: item.action || null,
        impactScore: item.impactScore,
        dismissed: false,
      };

      if (!this.isTestMode()) {
        try {
          const created = await prisma.aiInsight.create({
            data: {
              userId,
              type: item.type,
              content: item.content,
              metadata: JSON.stringify(meta),
            },
          });
          results.push({
            id: created.id,
            userId: created.userId,
            type: created.type,
            title: item.title,
            content: created.content,
            action: item.action || null,
            impactScore: item.impactScore,
            dismissed: false,
            createdAt: created.createdAt,
          });
          continue;
        } catch {
          // Fallback
        }
      }

      const id = `ai_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const record: AiInsightRecord = {
        id,
        userId,
        type: item.type,
        title: item.title,
        content: item.content,
        action: item.action || null,
        impactScore: item.impactScore,
        dismissed: false,
        createdAt: new Date(),
      };
      memoryAiInsights.set(id, record);
      results.push(record);
    }

    return results;
  }

  async findByUserId(
    userId: string,
    params?: { limit?: number; dismissed?: boolean }
  ): Promise<AiInsightRecord[]> {
    const limit = params?.limit || 10;

    if (!this.isTestMode()) {
      try {
        const found = await prisma.aiInsight.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: limit,
        });

        const records: AiInsightRecord[] = found.map(item => {
          let meta: any = {};
          try {
            if (item.metadata) meta = JSON.parse(item.metadata);
          } catch {
            // Ignore parse error
          }

          return {
            id: item.id,
            userId: item.userId,
            type: item.type,
            title: meta.title || 'Financial Insight',
            content: item.content,
            action: meta.action || null,
            impactScore: meta.impactScore || 5,
            dismissed: meta.dismissed ?? false,
            createdAt: item.createdAt,
          };
        });

        if (params?.dismissed !== undefined) {
          return records.filter(r => r.dismissed === params.dismissed);
        }
        return records;
      } catch {
        // Fallback
      }
    }

    return Array.from(memoryAiInsights.values())
      .filter(i => {
        if (i.userId !== userId) return false;
        if (params?.dismissed !== undefined && i.dismissed !== params.dismissed) return false;
        return true;
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async dismiss(id: string, userId: string): Promise<boolean> {
    if (!this.isTestMode()) {
      try {
        const item = await prisma.aiInsight.findUnique({ where: { id } });
        if (item && item.userId === userId) {
          let meta: any = {};
          try {
            if (item.metadata) meta = JSON.parse(item.metadata);
          } catch {}
          meta.dismissed = true;
          await prisma.aiInsight.update({
            where: { id },
            data: { metadata: JSON.stringify(meta) },
          });
          return true;
        }
      } catch {
        // Fallback
      }
    }

    const item = memoryAiInsights.get(id);
    if (!item || item.userId !== userId) return false;

    memoryAiInsights.set(id, { ...item, dismissed: true });
    return true;
  }

  clearMemory(): void {
    memoryAiInsights.clear();
  }
}

export const aiRepository = new AiRepository();
