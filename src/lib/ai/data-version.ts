/**
 * 数据版本追踪器 — 确保桌宠与 CareerOS 数据一致性
 *
 * 芝士通过 /api/chat 修改数据时 bump 版本号
 * CareerOS 前端轮询版本号 → 发现变化 → 自动重新拉取数据
 *
 * 单进程内存存储，进程重启后版本重置（不影响功能——重启后前端首次拉取会拿到新数据）
 */

// 全局版本号，每次写操作 +1
let globalVersion = 0;

// 记录最近一次修改的表（帮助前端选择性 refetch）
let dirtyTables: Set<string> = new Set();

export type DirtyTable = 'todos' | 'companies' | 'contacts' | 'applications' | 'interviews' | 'knowledge' | 'insights';

export function bumpVersion(table: DirtyTable): number {
  globalVersion++;
  dirtyTables.add(table);
  return globalVersion;
}

export function getVersion(): { version: number; dirtyTables: string[] } {
  return {
    version: globalVersion,
    dirtyTables: Array.from(dirtyTables),
  };
}

/** 前端消费后调用，清空脏表标记 */
export function clearDirty(): void {
  dirtyTables.clear();
}
