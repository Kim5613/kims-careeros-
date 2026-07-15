'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useDataSync } from '@/lib/hooks/useDataSync';
import { Card, Typography, Segmented, Button, Input, Checkbox, Switch, message, Popconfirm, Modal, DatePicker, TimePicker, Select, Tag, ColorPicker } from 'antd';
import { PlusOutlined, DeleteOutlined, LeftOutlined, RightOutlined, ScheduleOutlined, EnvironmentOutlined, ClockCircleOutlined, ExportOutlined, CopyOutlined } from '@ant-design/icons';
import type { InputRef } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/zh-cn';
import isoWeek from 'dayjs/plugin/isoWeek';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(isoWeek);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('zh-cn');

// 服务器 UTC 时区修正：统一用北京时间
const nowShanghai = () => dayjs().tz('Asia/Shanghai');


const { Title, Text } = Typography;

interface Todo {
  id: string; date: string; title: string; time?: string | null;
  endTime?: string | null;
  color: string; location?: string | null; description?: string | null;
  reminder?: string | null; repeat?: string | null; category?: string | null;
  isTodo: boolean; mustAttend: boolean; completed: boolean;
}

const TODO_COLORS = ['#1677ff','#52c41a','#fa8c16','#ff4d4f','#722ed1','#13c2c2','#eb2f96','#faad14','#2f54eb','#a0d911'];


type CalendarView = 'week' | 'month' | 'year' | 'day';

export default function DashboardPage() {
  const [view, setView] = useState<CalendarView>('day');
  const [currentDate, setCurrentDate] = useState<Dayjs>(nowShanghai());
  const [todos, setTodos] = useState<Todo[]>([]);
  const [holidays, setHolidays] = useState<Record<string, string>>({});

  // 快速添加栏
  const [qaTitle, setQaTitle] = useState('');
  const [qaTime, setQaTime] = useState<string | null>(null);
  const [qaEndTime, setQaEndTime] = useState<string | null>(null);
  const [qaColor, setQaColor] = useState('#1677ff');
  const [qaIsTodo, setQaIsTodo] = useState(true);
  const [qaCategory, setQaCategory] = useState<string>('work');
  const qaInputRef = useRef<InputRef>(null);
  const [focusKey, setFocusKey] = useState(0);
  // 隐私模式
  const [workMode, setWorkMode] = useState(false); // true=仅工作内容
  // 本周重点
  const [weeklyWork, setWeeklyWork] = useState('');
  const [weeklyPersonal, setWeeklyPersonal] = useState('');
  const [wfModalOpen, setWfModalOpen] = useState(false);

  // 桌宠数据同步：当芝士通过 /api/chat 修改数据后，自动重新拉取
  const [dataVersion, setDataVersion] = useState(0);
  useDataSync(() => setDataVersion((v) => v + 1));

  const weekMonday = useMemo(() => {
    const d = currentDate.toDate();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return d.toISOString().slice(0, 10);
  }, [currentDate]);
  const fetchWeeklyFocus = async () => {
    try {
      const res = await fetch(`/api/weekly-focus?week=${weekMonday}`);
      const data = await res.json();
      setWeeklyWork(data.workContent || '');
      setWeeklyPersonal(data.personalContent || '');
    } catch { /* ignore */ }
  };
  useEffect(() => { fetchWeeklyFocus(); }, [weekMonday]);
  const saveWeeklyWork = async (v: string) => {
    setWeeklyWork(v);
    fetch('/api/weekly-focus', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ weekStart: weekMonday, workContent: v }) }).catch(()=>{});
  };
  const saveWeeklyPersonal = async (v: string) => {
    setWeeklyPersonal(v);
    fetch('/api/weekly-focus', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ weekStart: weekMonday, personalContent: v }) }).catch(()=>{});
  };
  // 过滤：工作模式隐藏个人待办
  const visibleTodos = useMemo(() => workMode ? todos.filter(t => t.category !== 'personal') : todos, [todos, workMode]);
  const visibleWeeklyContent = workMode ? weeklyWork : [weeklyWork, weeklyPersonal].filter(Boolean).join('\n');
  // 置顶
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set<string>();
    try { return new Set<string>(JSON.parse(localStorage.getItem('careeros-pinned') || '[]')); } catch { return new Set<string>(); }
  });

  const togglePin = (id: string) => {
    setPinnedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      localStorage.setItem('careeros-pinned', JSON.stringify(Array.from(next)));
      return next;
    });
  };

  useEffect(() => {
    if (focusKey > 0) {
      // 强制聚焦：先 blur 再 focus
      setTimeout(() => {
        qaInputRef.current?.focus();
      }, 50);
    }
  }, [focusKey]);

  // 编辑弹窗
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [mOpen, setMOpen] = useState(false);
  const [mDate, setMDate] = useState<Dayjs>(nowShanghai());
  const [mTitle, setMTitle] = useState('');
  const [mTime, setMTime] = useState<Dayjs | null>(null);
  const [mEndTime, setMEndTime] = useState<Dayjs | null>(null);
  const [mColor, setMColor] = useState('#1677ff');
  const [mLoc, setMLoc] = useState('');
  const [mDesc, setMDesc] = useState('');
  const [mRemind, setMRemind] = useState<string | null>(null);
  const [mRepeat, setMRepeat] = useState<string | null>(null);
  const [mIsTodo, setMIsTodo] = useState(true);
  const [mCategory, setMCategory] = useState<string | null>(null);
  const [mMustAttend, setMMustAttend] = useState(false);

  // 周报弹窗
  const [reportOpen, setReportOpen] = useState(false);
  const [reportText, setReportText] = useState('');

  const todayStr = nowShanghai().format('YYYY-MM-DD');
  const [dailyQuote, setDailyQuote] = useState<{ quote: string; movie: string; translation?: string } | null>(null);
  useEffect(() => {
    fetch(`/api/movie-quote?date=${todayStr}`).then(r => r.json()).then(setDailyQuote).catch(() => {});
  }, [todayStr]);
  const isTodayDetail = currentDate.isSame(nowShanghai(), 'day');
  const yearStr = currentDate.format('YYYY');

  // 加载法定节假日
  useEffect(() => {
    fetch(`https://timor.tech/api/holiday/year/${yearStr}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.code === 0 && d.holiday) {
          const map: Record<string, string> = {};
          for (const [k, v] of Object.entries(d.holiday) as [string, any][]) {
            if (v.holiday) map[k] = v.name || '假期';
          }
          setHolidays(map);
        }
      })
      .catch(() => {});
  }, [yearStr]);

  // 加载日程（拉取前/当/后三个月，确保周视图跨月和顺延待办都有数据）
  useEffect(() => {
    if (view === 'year') {
      fetch(`/api/todos?year=${currentDate.format('YYYY')}`).then(r => r.json()).then((d) => { if (Array.isArray(d)) setTodos(d); }).catch(() => {});
      return;
    }
    const curr = currentDate.format('YYYY-MM');
    const prev = currentDate.subtract(1, 'month').format('YYYY-MM');
    const next = currentDate.add(1, 'month').format('YYYY-MM');
    Promise.all([
      fetch(`/api/todos?month=${prev}`).then(r => r.json()).catch(() => []),
      fetch(`/api/todos?month=${curr}`).then(r => r.json()).catch(() => []),
      fetch(`/api/todos?month=${next}`).then(r => r.json()).catch(() => []),
    ]).then((results) => {
      const seen = new Set<string>();
      const merged: Todo[] = [];
      for (const arr of results) {
        if (!Array.isArray(arr)) continue;
        for (const t of arr) {
          if (!seen.has(t.id)) { seen.add(t.id); merged.push(t); }
        }
      }
      setTodos(merged);
    }).catch(() => {});
  }, [view, currentDate, dataVersion]);

  const todosByDate = useMemo(() => {
    const map: Record<string, Todo[]> = {};
    const source = workMode ? todos.filter(t => t.category !== 'personal') : todos;
    for (const t of source) { if (!map[t.date]) map[t.date] = []; map[t.date].push(t); }
    return map;
  }, [todos, workMode]);

  // ======== 快速添加 ========
  const quickAdd = async () => {
    if (!qaTitle.trim()) return;
    const date = currentDate.format('YYYY-MM-DD');
    try {
      const res = await fetch('/api/todos', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, title: qaTitle.trim(), time: qaTime, endTime: qaEndTime, color: qaColor, isTodo: qaIsTodo, category: qaCategory }),
      });
      if (res.ok) {
        const nt = await res.json();
        setTodos((p) => [...p, nt]);
        setQaTitle('');
        setQaTime(null);
        setQaEndTime(null);
        setQaColor(TODO_COLORS[Math.floor(Math.random() * TODO_COLORS.length)]);
      }
    } catch { message.error('添加失败'); }
  };

  // ======== 编辑（打开完整弹窗） ========
  const openEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setMDate(dayjs(todo.date));
    setMTitle(todo.title);
    setMTime(todo.time ? dayjs(`${todo.date} ${todo.time}`, 'YYYY-MM-DD HH:mm') : null);
    setMEndTime(todo.endTime ? dayjs(`${todo.date} ${todo.endTime}`, 'YYYY-MM-DD HH:mm') : null);
    setMColor(todo.color);
    setMLoc(todo.location || '');
    setMDesc(todo.description || '');
    setMRemind(todo.reminder ?? null);
    setMRepeat(todo.repeat ?? null);
    setMIsTodo(todo.isTodo);
    setMCategory(todo.category ?? null);
    setMMustAttend(todo.mustAttend || false);
    setMOpen(true);
  };

  // ======== 从时间段新建日程 ========
  const openNewAtHour = (hourStr: string) => {
    setEditingTodo(null);
    setMDate(currentDate);
    setMTitle('');
    setMTime(dayjs(`${currentDate.format('YYYY-MM-DD')} ${hourStr}`, 'YYYY-MM-DD HH:mm'));
    setMEndTime(null);
    setMColor(TODO_COLORS[Math.floor(Math.random() * TODO_COLORS.length)]);
    setMLoc('');
    setMDesc('');
    setMRemind(null);
    setMRepeat(null);
    setMIsTodo(false);
    setMCategory(null);
    setMMustAttend(false);
    setMOpen(true);
  };

  const submitEdit = async () => {
    if (!mTitle.trim()) return;
    try {
      if (editingTodo) {
        // 编辑已有
        const res = await fetch(`/api/todos/${editingTodo.id}`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: mDate.format('YYYY-MM-DD'), title: mTitle.trim(),
            time: mTime ? mTime.format('HH:mm') : null,
            endTime: mEndTime ? mEndTime.format('HH:mm') : null,
            color: mColor,
            location: mLoc.trim() || null, description: mDesc.trim() || null,
            reminder: mRemind, repeat: mRepeat, isTodo: mIsTodo, category: mCategory,
            mustAttend: mMustAttend,
          }),
        });
        if (res.ok) {
          const updated = await res.json();
          setTodos((p) => p.map((t) => (t.id === editingTodo.id ? { ...t, ...updated } : t)));
        }
      } else {
        // 新建
        const res = await fetch('/api/todos', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: mDate.format('YYYY-MM-DD'), title: mTitle.trim(),
            time: mTime ? mTime.format('HH:mm') : null,
            endTime: mEndTime ? mEndTime.format('HH:mm') : null,
            color: mColor,
            location: mLoc.trim() || null, description: mDesc.trim() || null,
            reminder: mRemind, repeat: mRepeat, isTodo: mIsTodo, category: mCategory,
            mustAttend: mMustAttend,
          }),
        });
        if (res.ok) {
          const nt = await res.json();
          setTodos((p) => [...p, nt]);
        }
      }
      setMOpen(false); setEditingTodo(null);
    } catch { message.error('保存失败'); }
  };

  const deleteEdit = async () => {
    if (!editingTodo) return;
    try {
      await fetch(`/api/todos/${editingTodo.id}`, { method: 'DELETE' });
      setTodos((p) => p.filter((t) => t.id !== editingTodo.id));
      setMOpen(false); setEditingTodo(null);
    } catch { message.error('删除失败'); }
  };

  // ======== 切换完成 ========
  const toggleTodo = async (todo: Todo) => {
    try {
      const completing = !todo.completed;
      const dateChanged = completing && todo.date !== todayStr;
      const body: Record<string, any> = { completed: completing };
      if (dateChanged) body.date = todayStr;
      await fetch(`/api/todos/${todo.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      setTodos((p) => p.map((t) => {
        if (t.id !== todo.id) return t;
        const updated = { ...t, completed: completing };
        if (dateChanged) (updated as any).date = todayStr;
        return updated;
      }));
    } catch { message.error('操作失败'); }
  };

  // ======== 删除 ========
  const deleteTodo = async (id: string) => {
    try { await fetch(`/api/todos/${id}`, { method: 'DELETE' }); setTodos((p) => p.filter((t) => t.id !== id)); } catch { message.error('删除失败'); }
  };

  // ======== 拖拽日程到时间段 ========
  const handleDragStart = (e: React.DragEvent, todoId: string) => {
    e.dataTransfer.setData('text/plain', todoId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, timeStr: string) => {
    e.preventDefault();
    const todoId = e.dataTransfer.getData('text/plain');
    if (!todoId) return;
    try {
      const res = await fetch(`/api/todos/${todoId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ time: timeStr }),
      });
      if (res.ok) {
        const updated = await res.json();
        setTodos((p) => p.map((t) => (t.id === todoId ? { ...t, time: updated.time } : t)));
      }
    } catch { message.error('移动失败'); }
  };

  // ======== 导航 ========
  const goPrev = () => {
    if (view==='day') setCurrentDate((d)=>d.subtract(1,'day'));
    else if (view==='week') setCurrentDate((d)=>d.subtract(1,'week'));
    else if (view==='month') setCurrentDate((d)=>d.subtract(1,'month'));
    else setCurrentDate((d)=>d.subtract(1,'year'));
  };
  const goNext = () => {
    if (view==='day') setCurrentDate((d)=>d.add(1,'day'));
    else if (view==='week') setCurrentDate((d)=>d.add(1,'week'));
    else if (view==='month') setCurrentDate((d)=>d.add(1,'month'));
    else setCurrentDate((d)=>d.add(1,'year'));
  };

  const navLabel = useMemo(() => {
    if (view === 'day') return currentDate.format('M月D日 dddd');
    if (view === 'week') { const s = currentDate.startOf('isoWeek'); return `${s.format('M/D')} - ${s.add(6,'day').format('M/D')}`; }
    if (view === 'month') return currentDate.format('YYYY年M月');
    return currentDate.format('YYYY年');
  }, [view, currentDate]);

  const weekDays = ['一','二','三','四','五','六','日'];
  const weekDates = useMemo(() => { const s = currentDate.startOf('isoWeek'); return Array.from({length:7},(_,i)=>s.add(i,'day')); }, [currentDate]);
  const monthGrid = useMemo(() => { const s = currentDate.startOf('month').startOf('isoWeek'); return Array.from({length:42},(_,i)=>s.add(i,'day')); }, [currentDate]);
  const yearMonths = useMemo(() => Array.from({length:12},(_,i)=>currentDate.month(i).startOf('month')), [currentDate]);

  // ======== 日视图数据 ========
  const dayDateStr = currentDate.format('YYYY-MM-DD');
  const dayTodos = useMemo(() =>
    (todosByDate[dayDateStr] || []).slice().sort((a,b)=>(a.time||'99')>(b.time||'99')?1:-1),
  [todosByDate, dayDateStr]);
  const dayTimedTodos = useMemo(() => dayTodos.filter(t => t.time), [dayTodos]);
  const dayUntimedTodos = useMemo(() => {
    const untimed = dayTodos.filter(t => !t.time);
    return workMode ? untimed.filter(t => t.category !== 'personal') : untimed;
  }, [dayTodos, workMode]);
  // 按时段拆分
  const morningTodos = useMemo(() => dayTimedTodos.filter(t => parseInt(t.time || '0') < 12), [dayTimedTodos]);
  const afternoonTodos = useMemo(() => dayTimedTodos.filter(t => parseInt(t.time || '0') >= 12), [dayTimedTodos]);
  const morningHours = Array.from({length: 12}, (_, i) => i); // 0-11
  const afternoonHours = Array.from({length: 12}, (_, i) => i + 12); // 12-23
  // 顺延待办：所有过去日期未完成的待办，持续顺延直到确认，仅今天视图显示
  const carriedTodos = useMemo(() => {
    if (!isTodayDetail) return [];
    const carried = todos.filter((t) => !t.time && !t.completed && t.date < todayStr);
    return workMode ? carried.filter(t => t.category !== 'personal') : carried;
  }, [todos, todayStr, isTodayDetail, workMode]);
  // 待办列表（置顶优先，引用稳定）
  // 过往日期不显示未完成待办——它们已顺延到今天的 carriedTodos 区域
  const isPastDay = dayDateStr < todayStr;
  const sortedIncompleteTodos = useMemo(() =>
    isPastDay ? [] : dayUntimedTodos.filter(t => !t.completed).sort((a, b) => (pinnedIds.has(b.id) ? 1 : 0) - (pinnedIds.has(a.id) ? 1 : 0)),
  [dayUntimedTodos, pinnedIds, isPastDay]);
  const sortedCompleteTodos = useMemo(() =>
    dayUntimedTodos.filter(t => t.completed),
  [dayUntimedTodos]);
  const nowHour = nowShanghai().hour();

  // ======== 切换到日视图 ========
  const goToDay = (d: Dayjs) => {
    setCurrentDate(d);
    setView('day');
    setQaTitle(''); setQaTime(null); setQaColor(TODO_COLORS[Math.floor(Math.random() * TODO_COLORS.length)]); setQaCategory('work');
    setTimeout(() => setFocusKey(k => k + 1), 100);
  };

  // ======== 导出周报 ========
  const exportWeekReport = () => {
    const s = currentDate.startOf('isoWeek');
    const lines: string[] = [
      `📅 周报 | ${s.format('YYYY/M/D')} - ${s.add(6, 'day').format('M/D')}`,
      `生成时间：${nowShanghai().format('YYYY-MM-DD HH:mm')}`,
      ``,
    ];
    let totalTasks = 0, doneTasks = 0;
    for (let i = 0; i < 7; i++) {
      const d = s.add(i, 'day');
      const ds = d.format('YYYY-MM-DD');
      const list = (todosByDate[ds] || []).sort((a, b) => (a.time || '99') > (b.time || '99') ? 1 : -1);
      if (list.length === 0) continue;
      lines.push(`## ${d.format('M/D ddd')}`);
      for (const t of list) {
        totalTasks++;
        if (t.completed) doneTasks++;
        const check = t.completed ? '✅' : '⬜';
        const timeStr = t.time ? `${t.time} ` : '';
        const catTag = t.category === 'work' ? '💼' : t.category === 'personal' ? '🐱' : '';
        lines.push(`- ${check} ${timeStr}${t.title} ${catTag}`);
        if (t.description) lines.push(`  _${t.description}_`);
      }
      lines.push('');
    }
    lines.push(`---`);
    lines.push(`完成率：${doneTasks}/${totalTasks} (${totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0}%)`);
    const text = lines.join('\n');
    setReportText(text);
    setReportOpen(true);
  };

  const copyReport = () => {
    navigator.clipboard.writeText(reportText).then(() => message.success('已复制到剪贴板'));
  };

  // 导航栏（共用）
  const renderNavBar = () => (
    <div style={{ marginBottom: 4 }}>
      {/* 第一行：导航 + 视图切换 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Button icon={<LeftOutlined />} size="small" onClick={goPrev} style={{ borderRadius: 20 }} />
          <Text strong style={{ fontSize: 15, minWidth: 170, textAlign: 'center', color: '#444' }}>{navLabel}</Text>
          <Button icon={<RightOutlined />} size="small" onClick={goNext} style={{ borderRadius: 20 }} />
          <Button size="small" onClick={() => { setCurrentDate(nowShanghai()); if (view==='day') { setQaTitle(''); setQaTime(null); setQaCategory('work'); setFocusKey(k=>k+1); } }} style={{ borderRadius: 20 }}>今天</Button>
          {view === 'week' && (
            <Button size="small" icon={<ExportOutlined />} onClick={exportWeekReport} style={{ borderRadius: 20 }}>导出周报</Button>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Segmented value={view} onChange={(v) => { setView(v as CalendarView); if (v==='day') { setQaTitle(''); setQaTime(null); setQaCategory('work'); setTimeout(()=>setFocusKey(k=>k+1),100); } }}
            style={{ borderRadius: 24 }}
            options={[
              { label: '日', value: 'day' },
              { label: '周', value: 'week' },
              { label: '月', value: 'month' },
              { label: '年', value: 'year' },
            ]} />
        </div>
      </div>
    </div>
  );

  // ======== 日视图 ========
  const BLOCK_H = 16; // 每15分钟块的高度(px)

  // 时间线列（上午/下午共用）
  // colStartHour: 0=上午, 12=下午
  const renderHourColumn = (hours: number[], hourTodos: Todo[], bg: string, colStartHour: number) => {
    const colStartMin = colStartHour * 60;
    const colEndMin = colStartMin + 12 * 60;
    const nowMin = nowShanghai().hour() * 60 + nowShanghai().minute();

    // 筛选本列日程
    const colTodos = hourTodos.filter(t => {
      if (!t.time) return false;
      const [h, m] = t.time.split(':').map(Number);
      const sm = h * 60 + m;
      return sm >= colStartMin && sm < colEndMin;
    });

    // 计算每个日程位置
    interface PosEv {
      todo: Todo; top: number; height: number;
      column: number; totalColumns: number;
      startMin: number; endMin: number;
    }
    const positioned: PosEv[] = colTodos.map(t => {
      const [sh, sm] = t.time!.split(':').map(Number);
      const startMin = sh * 60 + sm;
      let endMin: number;
      if (t.endTime) {
        const [eh, em] = t.endTime.split(':').map(Number);
        endMin = eh * 60 + em;
      } else {
        endMin = Math.min(startMin + 60, colEndMin);
      }
      if (endMin <= startMin) endMin = startMin + 15;
      return {
        todo: t,
        top: ((startMin - colStartMin) / 15) * BLOCK_H,
        height: Math.max(BLOCK_H, ((endMin - startMin) / 15) * BLOCK_H),
        column: 0, totalColumns: 1, startMin, endMin,
      };
    });

    // 排序：必须参加优先 → 开始时间 → 时长长的优先
    positioned.sort((a, b) =>
      (b.todo.mustAttend ? 1 : 0) - (a.todo.mustAttend ? 1 : 0) ||
      a.startMin - b.startMin ||
      (b.endMin - b.startMin) - (a.endMin - a.startMin)
    );
    const groups: PosEv[][] = [];
    for (const ev of positioned) {
      let placed = false;
      for (const group of groups) {
        if (group.some(g => ev.startMin < g.endMin && ev.endMin > g.startMin)) {
          group.push(ev); placed = true; break;
        }
      }
      if (!placed) groups.push([ev]);
    }
    for (const group of groups) {
      const cols: number[] = [];
      for (const ev of group) {
        let col = 0;
        while (col < cols.length && cols[col] > ev.startMin) col++;
        if (col === cols.length) cols.push(ev.endMin);
        else cols[col] = ev.endMin;
        ev.column = col;
      }
      for (const ev of group) ev.totalColumns = cols.length;
    }

    const totalH = 48 * BLOCK_H;

    return (
      <div style={{ flex: 1, overflowY: 'scroll', overflowAnchor: 'none', background: bg, borderRadius: 16 }}>
        <div style={{ display: 'flex', minHeight: totalH }}>
          {/* 时间标签列 */}
          <div style={{ width: 48, flexShrink: 0 }}>
            {Array.from({ length: 12 }, (_, i) => {
              const h = colStartHour + i;
              const hh = String(h).padStart(2, '0');
              const isCurrent = isTodayDetail && h === nowHour;
              return (
                <div key={i} style={{ height: BLOCK_H * 4, display: 'flex', alignItems: 'flex-start', boxSizing: 'border-box' }}>
                  <Text style={{
                    fontSize: 11, color: isCurrent ? '#8b7cf0' : '#bbb',
                    fontWeight: isCurrent ? 600 : 400, width: '100%', textAlign: 'right',
                  }}>{`${hh}:00`}</Text>
                </div>
              );
            })}
          </div>

          {/* 网格 + 日程 */}
          <div style={{ flex: 1, position: 'relative' }}>
            {/* 网格背景层 — 纯 div，不用 Grid */}
            {Array.from({ length: 48 }, (_, i) => {
              const totalMin = colStartMin + i * 15;
              const m = totalMin % 60;
              const h = Math.floor(totalMin / 60);
              const hh = String(h).padStart(2, '0');
              const mm = String(m).padStart(2, '0');
              const timeStr = `${hh}:${mm}`;
              const isHourStart = m === 0;
              const isCurrentBlock = isTodayDetail && totalMin === Math.floor(nowMin / 15) * 15;
              return (
                <div key={i} style={{
                  height: BLOCK_H, boxSizing: 'border-box',
                  borderBottom: isHourStart ? '1px solid #e8e4e0' : 'none',
                  background: isCurrentBlock ? '#f6f3ff' : 'transparent',
                  cursor: 'pointer', transition: 'background 0.15s',
                }}
                  onClick={() => openNewAtHour(timeStr)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, timeStr)}
                />
              );
            })}

            {/* 日程卡片叠加层 */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: totalH, pointerEvents: 'none' }}>
              {positioned.map(ev => {
                const t = ev.todo;
                const wp = 100 / ev.totalColumns;
                const lp = ev.column * wp;
                const startRow = ((ev.startMin - colStartMin) / 15) + 1;
                const endRow = ((ev.endMin - colStartMin) / 15) + 1;
                const topPx = (startRow - 1) * BLOCK_H;
                const heightPx = (endRow - startRow + 1) * BLOCK_H;
                return (
                  <div key={t.id} draggable onDragStart={(e) => handleDragStart(e, t.id)}
                    onClick={(e) => { e.stopPropagation(); openEdit(t); }}
                    style={{
                      position: 'absolute', top: topPx, left: `${lp}%`,
                      width: `calc(${wp}% - 4px)`, height: heightPx,
                      boxSizing: 'border-box', pointerEvents: 'auto',
                      padding: '1px 6px', borderRadius: 6,
                      background: t.mustAttend ? `${t.color}28` : `${t.color}14`,
                      borderLeft: t.mustAttend ? `5px solid ${t.color}` : `3px solid ${t.color}`,
                      cursor: 'pointer', zIndex: t.mustAttend ? 3 : 2,
                      boxShadow: t.mustAttend ? '0 1px 4px rgba(0,0,0,0.1)' : '0 1px 2px rgba(0,0,0,0.04)',
                      overflow: 'hidden',
                    }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
                      {t.mustAttend && <span style={{ fontSize: 9, flexShrink: 0 }}>🔴</span>}
                      {t.category === 'work' && <span style={{ flexShrink: 0, fontSize: 10 }}>💼</span>}
                      {t.category === 'personal' && <span style={{ flexShrink: 0, fontSize: 10 }}>🐱</span>}
                      <Text strong delete={t.completed} style={{
                        flex: 1, fontSize: 10, color: t.mustAttend ? '#222' : '#555',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        lineHeight: '14px',
                      }}>{t.title}</Text>
                      {t.isTodo && <Tag style={{ fontSize: 7, lineHeight: '10px', margin: 0, padding: '0 2px', flexShrink: 0 }}>待办</Tag>}
                    </div>
                    {heightPx > 24 && (
                      <div style={{ fontSize: 8, color: '#aaa', marginTop: 0, lineHeight: '12px' }}>
                        {t.time}{t.endTime ? `-${t.endTime}` : ''}{t.location ? ` 📍${t.location}` : ''}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 当前时间红线 — 浮在最上层 */}
            {(() => {
              const nowTotalMin = nowShanghai().hour() * 60 + nowShanghai().minute();
              if (isTodayDetail && nowTotalMin >= colStartMin && nowTotalMin < colEndMin) {
                const lineTop = ((nowTotalMin - colStartMin) / 15) * BLOCK_H;
                return (
                  <div style={{
                    position: 'absolute', top: lineTop, left: 0, right: 0, zIndex: 10,
                    pointerEvents: 'none',
                  }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%', background: '#ff4d4f',
                      marginLeft: -4, position: 'absolute', top: -3,
                    }} />
                    <div style={{
                      height: 2, background: '#ff4d4f',
                    }} />
                  </div>
                );
              }
              return null;
            })()}
          </div>
        </div>
      </div>
    );
  };

  const renderDayView = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 170px)' }}>
      {/* 快速添加栏 */}
      <div style={{
        padding: '10px 20px', background: '#fff', borderRadius: 28,
        marginBottom: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <ColorPicker value={qaColor} onChange={(c) => setQaColor(c.toHexString())}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%', background: qaColor,
              border: '2px solid #fff', boxShadow: '0 0 0 1px #d9d9d9',
              cursor: 'pointer', flexShrink: 0,
            }} />
          </ColorPicker>
          <Input
            ref={qaInputRef}
            value={qaTitle}
            onChange={(e) => setQaTitle(e.target.value)}
            onPressEnter={quickAdd}
            placeholder={qaIsTodo ? '输入待办，回车添加…' : '输入日程标题，回车添加…'}
            autoFocus
            style={{ flex: 1, minWidth: 140 }}
            prefix={<span onClick={() => setQaCategory(qaCategory === 'work' ? 'personal' : 'work')}
              style={{ cursor: 'pointer', userSelect: 'none' }}>
              {qaCategory === 'work' ? '💼' : '🐱'}
            </span>}
          />
          {!qaIsTodo && (
            <>
              <TimePicker value={qaTime ? dayjs(qaTime, 'HH:mm') : null}
                onChange={(t) => setQaTime(t ? t.format('HH:mm') : null)}
                format="HH:mm" placeholder="开始" size="small" style={{ width: 90 }} />
              <TimePicker value={qaEndTime ? dayjs(qaEndTime, 'HH:mm') : null}
                onChange={(t) => setQaEndTime(t ? t.format('HH:mm') : null)}
                format="HH:mm" placeholder="结束" size="small" style={{ width: 90 }} />
            </>
          )}
          <Segmented size="small" value={qaIsTodo ? 'todo' : 'schedule'}
            onChange={(v) => setQaIsTodo(v === 'todo')}
            options={[{ label: '日程', value: 'schedule' }, { label: '待办', value: 'todo' }]} />
          <Button type="primary" size="small" icon={<PlusOutlined />} onClick={quickAdd} disabled={!qaTitle.trim()} style={{ borderRadius: 20 }}>添加</Button>
        </div>
      </div>

      {/* 三栏布局：上午 | 下午 | 待办 */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 0.5fr', gap: 10, minHeight: 0 }}>
        {/* 上午列 */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{
            fontWeight: 600, fontSize: 13, color: '#8b7cf0', padding: '6px 12px',
            background: '#fefdfb', borderRadius: '14px 14px 0 0', borderBottom: '1px solid #f0ece8',
            position: 'sticky', top: 0, zIndex: 1, display: 'flex', alignItems: 'center', gap: 6,
          }}>
            ☀️ 上午 <span style={{ fontWeight: 400, fontSize: 11, color: '#bbb', marginLeft: 'auto' }}>00:00–12:00</span>
          </div>
          {renderHourColumn(morningHours, morningTodos, '#fefdfb', 0)}
        </div>

        {/* 下午列 */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{
            fontWeight: 600, fontSize: 13, color: '#7c6ff0', padding: '6px 12px',
            background: '#fdfbfa', borderRadius: '14px 14px 0 0', borderBottom: '1px solid #f0ece8',
            position: 'sticky', top: 0, zIndex: 1, display: 'flex', alignItems: 'center', gap: 6,
          }}>
            🌙 下午 <span style={{ fontWeight: 400, fontSize: 11, color: '#bbb', marginLeft: 'auto' }}>12:00–24:00</span>
          </div>
          {renderHourColumn(afternoonHours, afternoonTodos, '#fdfbfa', 12)}
        </div>

        {/* 待办列 */}
        <div style={{ display: 'flex', flexDirection: 'column', overflowY: 'scroll', overflowAnchor: 'none' }}>
          {/* 本周重点 */}
          <div
            onClick={() => setWfModalOpen(true)}
            style={{
              margin: '6px 8px 4px',
              padding: '10px 12px',
              borderRadius: 12,
              background: (weeklyWork || weeklyPersonal) ? '#fffdf5' : '#fafafa',
              border: (weeklyWork || weeklyPersonal) ? '1px solid #f5e6b8' : '1px dashed #e8e8e8',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ fontSize: 12, color: '#b8860b', fontWeight: 500, marginBottom: (weeklyWork || weeklyPersonal) ? 4 : 0 }}>
              📌 本周重点
            </div>
            {/* 工作重点 */}
            {weeklyWork ? (
              <div style={{ fontSize: 12, color: '#666', lineHeight: 1.7, whiteSpace: 'pre-wrap', marginBottom: 2 }}>
                <span style={{ fontSize: 11, color: '#8b7cf0', fontWeight: 600 }}>工作</span> {weeklyWork}
              </div>
            ) : null}
            {/* 个人重点 — 仅非工作模式显示 */}
            {!workMode && weeklyPersonal ? (
              <div style={{ fontSize: 12, color: '#999', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                <span style={{ fontSize: 11, color: '#f0a060', fontWeight: 600 }}>个人</span> {weeklyPersonal}
              </div>
            ) : null}
            {!weeklyWork && !weeklyPersonal ? (
              <div style={{ fontSize: 12, color: '#ccc' }}>点击设置…</div>
            ) : null}
          </div>
          {/* 待办标题 */}
          <div style={{
            fontWeight: 600, fontSize: 13, color: '#666', padding: '16px 12px 6px',
            background: '#faf8f6', borderTop: '1px solid #f0ece8',
            position: 'sticky', top: 0, zIndex: 1, display: 'flex', alignItems: 'center', gap: 6,
            marginTop: 12,
          }}>
            📋 待办
            <span
              onClick={(e) => { e.stopPropagation(); setWorkMode(!workMode); }}
              title={workMode ? '显示全部' : '仅工作'}
              style={{
                marginLeft: 'auto', fontSize: 16, cursor: 'pointer', userSelect: 'none',
                opacity: workMode ? 0.4 : 1, transition: 'opacity 0.2s',
              }}
            >⭐</span>
          </div>
          <div style={{ padding: '4px 4px' }}>
            {/* 未完成（置顶优先） */}
            {sortedIncompleteTodos.map((t) => (
              <div key={t.id} onClick={() => openEdit(t)}
                onContextMenu={(e) => { e.preventDefault(); togglePin(t.id); }}
                style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', marginBottom: 6,
                borderRadius: 12, background: pinnedIds.has(t.id) ? '#fef9e7' : `${t.color}12`,
                borderLeft: `4px solid ${pinnedIds.has(t.id) ? '#f0c040' : t.color}`,
                cursor: 'pointer',
              }}>
                {pinnedIds.has(t.id) && <span style={{ fontSize: 11 }}>📌</span>}
                <Checkbox checked={false} onChange={() => toggleTodo(t)} onClick={(e) => e.stopPropagation()} style={{ transform: 'scale(0.85)' }} />
                <Text style={{ flex: 1, fontSize: 13 }}>
                  {t.category === 'work' && <span style={{ marginRight: 3 }}>💼</span>}
                  {t.category === 'personal' && <span style={{ marginRight: 3 }}>🐱</span>}
                  {t.title}
                </Text>
                <Button type="text" size="small" danger icon={<DeleteOutlined style={{ fontSize: 10 }} />}
                  onClick={(e) => { e.stopPropagation(); deleteTodo(t.id); }} />
              </div>
            ))}
            {/* 已完成 */}
            {sortedCompleteTodos.map((t) => (
              <div key={t.id} onClick={() => openEdit(t)} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px', marginBottom: 3,
                borderRadius: 8, background: '#f5f5f5', cursor: 'pointer', opacity: 0.55,
              }}>
                <Text delete style={{ flex: 1, fontSize: 12, color: '#bbb' }}>{t.title}</Text>
                <Button type="text" size="small" danger icon={<DeleteOutlined style={{ fontSize: 10 }} />}
                  onClick={(e) => { e.stopPropagation(); deleteTodo(t.id); }} />
              </div>
            ))}
            {/* 顺延待办 */}
            {carriedTodos.length > 0 && (
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px dashed #eee' }}>
                {carriedTodos.map((t) => (
                  <div key={t.id} onClick={() => openEdit(t)} style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', marginBottom: 5,
                    borderRadius: 10, background: '#fff3f0', borderLeft: '3px solid #ff8c75',
                    cursor: 'pointer', opacity: 0.85,
                  }}>
                    <Checkbox checked={false} onChange={() => toggleTodo(t)} onClick={(e) => e.stopPropagation()} style={{ transform: 'scale(0.85)' }} />
                    <Text style={{ flex: 1, fontSize: 13 }}>
                      {t.category === 'work' && <span style={{ marginRight: 3 }}>💼</span>}
                      {t.category === 'personal' && <span style={{ marginRight: 3 }}>🐱</span>}
                      {t.title}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 10 }}>{t.date.slice(5)}</Text>
                    <Button type="text" size="small" danger icon={<DeleteOutlined style={{ fontSize: 10 }} />}
                      onClick={(e) => { e.stopPropagation(); deleteTodo(t.id); }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // ======== 周视图 ========
  const renderWeekView = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 12 }}>
      {weekDates.map((d) => {
        const ds = d.format('YYYY-MM-DD'); const isToday = ds === todayStr;
        const isWeekend = d.day() === 0 || d.day() === 6;
        const holiday = holidays[ds];
        const list = todosByDate[ds] || [];
        return (
          <div key={ds} onClick={() => goToDay(d)} style={{
            cursor: 'pointer', borderRadius: 20, padding: '16px 14px',
            background: isToday ? '#f3f0ff' : isWeekend ? '#faf8f6' : '#fff',
            boxShadow: isToday ? '0 0 0 2px #8b7cf0, 0 4px 16px rgba(139,124,240,0.12)' : '0 0 0 1px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.03)',
            transition: 'all 0.2s',
            display: 'flex', flexDirection: 'column', height: 440, overflow: 'hidden',
          }} onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = isToday ? '0 0 0 2px #8b7cf0, 0 4px 16px rgba(139,124,240,0.12)' : '0 0 0 1px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.03)'; }}>
            <div style={{ textAlign: 'center', marginBottom: 8, flexShrink: 0 }}>
              <Text type="secondary" style={{ fontSize: 11 }}>{weekDays[d.isoWeekday() - 1]}</Text>
              <div>
                <Text strong style={{ fontSize: isToday ? 20 : 15, color: isToday ? '#8b7cf0' : isWeekend ? '#e8887a' : '#444' }}>{d.date()}</Text>
                {holiday && <Tag color="red" style={{ fontSize: 9, padding: '0 3px', lineHeight: '16px', marginLeft: 2 }}>{holiday}</Tag>}
              </div>
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
            {list.map((t) => (
              <div key={t.id} onClick={(e) => { e.stopPropagation(); openEdit(t); }} style={{
                fontSize: 11, padding: '3px 6px', marginBottom: 3, borderRadius: 6,
                background: `${t.color}18`, overflow: 'hidden', whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                cursor: 'pointer', opacity: t.completed ? 0.45 : 1,
              }}>
                {t.time && <span style={{ color: '#999', marginRight: 2 }}>{t.time}</span>}
                {t.category === 'work' ? '💼' : t.category === 'personal' ? '🐱' : ''}{t.title}
              </div>
            ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  // ======== 月视图 ========
  const renderMonthView = () => (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
        {weekDays.map((w) => <Text key={w} type="secondary" style={{ textAlign: 'center', fontSize: 13 }}>{w}</Text>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {monthGrid.map((d) => {
          const ds = d.format('YYYY-MM-DD'); const isToday = ds === todayStr; const isOther = d.month() !== currentDate.month();
          const holiday = holidays[ds]; const list = todosByDate[ds] || [];
          return (
            <div key={ds} onClick={() => goToDay(d)} style={{
              cursor: 'pointer', borderRadius: 12, padding: '7px 6px',
              background: isToday ? '#f3f0ff' : isOther ? '#faf8f6' : '#fff',
              boxShadow: isToday ? '0 0 0 2px #8b7cf0' : '0 0 0 1px rgba(0,0,0,0.04)',
              opacity: isOther ? 0.45 : 1, minHeight: 88,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Text style={{ fontSize: 12, fontWeight: isToday ? 700 : 400, color: isToday ? '#8b7cf0' : isOther ? '#ccc' : '#666' }}>{d.date()}</Text>
                {holiday && <Tag color="red" style={{ fontSize: 8, padding: '0 2px', lineHeight: '14px' }}>{holiday.slice(0, 2)}</Tag>}
              </div>
              {list.slice(0, 3).map((t) => (
                <div key={t.id} onClick={(e) => { e.stopPropagation(); openEdit(t); }} style={{
                  fontSize: 10, lineHeight: 1.4, overflow: 'hidden', whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis', color: t.completed ? '#ccc' : '#555', cursor: 'pointer',
                }}>
                  {t.time && <span style={{ color: '#999' }}>{t.time} </span>}
                  {t.category === 'work' ? '💼' : t.category === 'personal' ? '🐱' : ''}{t.title}
                </div>
              ))}
              {list.length > 3 && <Text style={{ fontSize: 9, color: '#bbb' }}>+{list.length - 3}</Text>}
            </div>
          );
        })}
      </div>
    </div>
  );

  // ======== 年视图 ========
  const renderYearView = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
      {yearMonths.map((m) => {
        const mk = m.format('YYYY-MM');
        const monthStart = m.startOf('month');
        const monthEnd = m.endOf('month');
        const totalDays = monthEnd.date();
        const startDow = monthStart.isoWeekday(); // 1=Mon
        const daysInMonth: Dayjs[] = [];
        // padding before first day
        for (let i = 1; i < startDow; i++) daysInMonth.push(monthStart.subtract(startDow - i, 'day'));
        // actual days
        for (let d = 1; d <= totalDays; d++) daysInMonth.push(monthStart.date(d));
        // fill to complete last row
        while (daysInMonth.length % 7 !== 0) daysInMonth.push(daysInMonth[daysInMonth.length - 1].add(1, 'day'));
        return (
          <Card key={mk} size="small" hoverable style={{ borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }} styles={{ body: { padding: '12px 14px' } }}
            onClick={() => { setCurrentDate(m); setView('month'); }}>
            <Text strong style={{ fontSize: 14, marginBottom: 6, display: 'block' }}>{m.format('M月')}</Text>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, textAlign: 'center' }}>
              {['一','二','三','四','五','六','日'].map(w => (
                <Text key={w} style={{ fontSize: 9, color: '#bbb' }}>{w}</Text>
              ))}
              {daysInMonth.map((d, i) => {
                const ds = d.format('YYYY-MM-DD');
                const isOther = d.month() !== m.month();
                const hasItems = (todosByDate[ds] || []).length > 0;
                const isToday = ds === todayStr;
                return (
                  <div key={i} onClick={(e) => { e.stopPropagation(); goToDay(d); }} style={{
                    fontSize: 10, padding: '1px 0', cursor: 'pointer', borderRadius: 2,
                    color: isOther ? '#ddd' : isToday ? '#1677ff' : '#666',
                    background: isToday ? '#e6f7ff' : hasItems ? `${TODO_COLORS[0]}18` : 'transparent',
                    fontWeight: isToday ? 700 : hasItems ? 500 : 400,
                  }}>
                    {d.date()}
                  </div>
                );
              })}
            </div>
          </Card>
        );
      })}
    </div>
  );

  return (
    <div style={{
      padding: '20px 32px 12px', background: '#faf8f6', minHeight: '100vh',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0, fontWeight: 600, fontSize: 22, letterSpacing: 1 }}>
          今天的Kim依旧光芒万丈
        </Title>
        {dailyQuote && (
          <div style={{ fontSize: 13, color: '#bbb', maxWidth: 420, textAlign: 'right', lineHeight: 1.7 }}>
            <div style={{ fontStyle: 'italic' }}>
              「{dailyQuote.quote}」
              {dailyQuote.translation && <div style={{ fontStyle: 'normal', marginTop: 2 }}>{dailyQuote.translation}</div>}
            </div>
            <div style={{ fontStyle: 'normal', fontSize: 12, color: '#ccc' }}>— {dailyQuote.movie}</div>
          </div>)}
      </div>

      {renderNavBar()}

      {/* 本周重点 — 日视图和周视图显示 */}
      {/* 本周重点 — 仅周视图显示整行卡片 */}
      {view === 'week' && (
        <div
          onClick={() => setWfModalOpen(true)}
          style={{
            marginTop: 12,
            padding: '14px 20px',
            borderRadius: 16,
            background: '#fff',
            border: '1px solid #eee',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            transition: 'box-shadow 0.2s',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; }}
        >
          <span style={{ fontSize: 16 }}>📌</span>
          <span style={{ fontSize: 13, color: '#999', fontWeight: 500 }}>本周重点</span>
          <span style={{
            flex: 1, fontSize: 14, color: visibleWeeklyContent ? '#444' : '#ccc',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {visibleWeeklyContent || '点击添加本周重点事项…'}
          </span>
        </div>
      )}

      <div style={{
        marginTop: 8, padding: view === 'day' ? '16px 24px' : '16px 20px',
        background: 'transparent',
        borderRadius: 0,
        boxShadow: 'none',
        maxHeight: 'calc(100vh - 155px)', overflowY: view === 'day' ? 'hidden' : 'auto',
      }}>
        {view === 'day' && renderDayView()}
        {view === 'week' && renderWeekView()}
        {view === 'month' && renderMonthView()}
        {view === 'year' && renderYearView()}
      </div>

      {/* 编辑弹窗 */}
      <Modal
        title={editingTodo ? (editingTodo.isTodo ? '编辑待办' : '编辑日程') : (mIsTodo ? '新建待办' : '新建日程')}
        open={mOpen}
        onOk={submitEdit}
        onCancel={() => { setMOpen(false); setEditingTodo(null); }}
        okText={editingTodo ? '保存' : '创建'} cancelText="取消"
        okButtonProps={{ disabled: !mTitle.trim() }}
        width={mIsTodo ? 420 : 520}
        footer={(_, { OkBtn, CancelBtn }) => (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {editingTodo ? (
              <Popconfirm title="确认删除？" onConfirm={deleteEdit} okText="删" cancelText="否">
                <Button danger icon={<DeleteOutlined />}>删除</Button>
              </Popconfirm>
            ) : <div />}
            <div style={{ display: 'flex', gap: 8 }}>
              <CancelBtn />
              <OkBtn />
            </div>
          </div>
        )}
      >
        <div style={{ display: 'flex', gap: 24, marginBottom: 12 }}>
          <div>
            <Text type="secondary">分类</Text>
            <div style={{ marginTop: 4 }}>
              <Segmented value={mCategory || 'none'}
                onChange={(v) => setMCategory(v === 'none' ? null : v as string)}
                options={[{ label: '💼 工作', value: 'work' }, { label: '🐱 个人', value: 'personal' }, { label: '无', value: 'none' }]} />
            </div>
          </div>
          <div>
            <Text type="secondary">颜色</Text>
            <div style={{ marginTop: 4 }}>
              <ColorPicker value={mColor} onChange={(c) => setMColor(c.toHexString())}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', background: mColor,
                  border: '2px solid #fff', boxShadow: '0 0 0 1px #d9d9d9',
                  cursor: 'pointer',
                }} />
              </ColorPicker>
            </div>
          </div>
          {!mIsTodo && (
            <div>
              <Text type="secondary">必须本人参加</Text>
              <div style={{ marginTop: 4 }}>
                <Switch checked={mMustAttend} onChange={setMMustAttend} />
              </div>
            </div>
          )}
        </div>
        <div style={{ marginBottom: 12 }}>
          <Text type="secondary">事项</Text>
          <Input value={mTitle} onChange={(e) => setMTitle(e.target.value)} autoFocus style={{ marginTop: 4 }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <Text type="secondary">日期</Text>
          <DatePicker value={mDate} onChange={(d) => d && setMDate(d)} style={{ width: '100%', marginTop: 4 }} />
        </div>
        {/* 日程模式才显示额外字段 */}
        {!mIsTodo && (
          <>
            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <Text type="secondary">开始时间</Text>
                <TimePicker value={mTime} onChange={(t) => setMTime(t)} format="HH:mm" placeholder="选填" style={{ width: '100%', marginTop: 4 }} />
              </div>
              <div style={{ flex: 1 }}>
                <Text type="secondary">结束时间</Text>
                <TimePicker value={mEndTime} onChange={(t) => setMEndTime(t)} format="HH:mm" placeholder="选填" style={{ width: '100%', marginTop: 4 }} />
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <Text type="secondary">地点</Text>
              <Input value={mLoc} onChange={(e) => setMLoc(e.target.value)} placeholder="选填" style={{ marginTop: 4 }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <Text type="secondary">描述</Text>
              <Input.TextArea rows={2} value={mDesc} onChange={(e) => setMDesc(e.target.value)} placeholder="选填" style={{ marginTop: 4 }} />
            </div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <Text type="secondary">提醒</Text>
                <Select value={mRemind} onChange={setMRemind} allowClear placeholder="不提醒" style={{ width: '100%', marginTop: 4 }}
                  options={[{ label: '提前15分钟', value: '15min' }, { label: '提前30分钟', value: '30min' }, { label: '提前1小时', value: '1hour' }]} />
              </div>
              <div style={{ flex: 1 }}>
                <Text type="secondary">重复</Text>
                <Select value={mRepeat} onChange={setMRepeat} allowClear placeholder="不重复" style={{ width: '100%', marginTop: 4 }}
                  options={[{ label: '每天', value: 'daily' }, { label: '每周', value: 'weekly' }, { label: '每月', value: 'monthly' }]} />
              </div>
            </div>
          </>
        )}
      </Modal>

      {/* 周报弹窗 */}
      <Modal
        title="📅 周报预览"
        open={reportOpen}
        onCancel={() => setReportOpen(false)}
        footer={[
          <Button key="copy" type="primary" icon={<CopyOutlined />} onClick={copyReport}>复制到剪贴板</Button>,
          <Button key="close" onClick={() => setReportOpen(false)}>关闭</Button>,
        ]}
        width={600}
        styles={{ body: { maxHeight: '70vh', overflowY: 'auto', padding: '16px 24px' } }}
      >
        <pre style={{
          whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: 13,
          lineHeight: 1.8, background: '#fafafa', padding: 16, borderRadius: 8,
          margin: 0,
        }}>{reportText}</pre>
      </Modal>

      {/* 本周重点便签弹窗 */}
      <Modal
        open={wfModalOpen}
        onCancel={() => setWfModalOpen(false)}
        footer={null}
        width={520}
        closable={false}
        maskStyle={{ background: 'rgba(0,0,0,0.3)' }}
        styles={{ body: { padding: 0 } }}
      >
        <div style={{ padding: '24px 28px 28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 16, fontWeight: 600, color: '#333' }}>📌 本周重点</span>
            <span
              onClick={() => { setWfModalOpen(false); }}
              style={{ fontSize: 20, color: '#bbb', cursor: 'pointer', lineHeight: 1 }}
            >×</span>
          </div>
          {/* 工作重点 */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, color: '#8b7cf0', fontWeight: 500, marginBottom: 6 }}>💼 工作</div>
            <Input.TextArea
              value={weeklyWork}
              onChange={(e) => saveWeeklyWork(e.target.value)}
              placeholder="这周工作上的重点…"
              rows={3}
              style={{
                fontSize: 14, border: '1px solid #eee', background: '#fafafa',
                borderRadius: 10, padding: 12, resize: 'none', lineHeight: 1.8,
              }}
            />
          </div>
          {/* 个人重点 */}
          <div>
            <div style={{ fontSize: 13, color: '#f0a060', fontWeight: 500, marginBottom: 6 }}>🐱 个人</div>
            <Input.TextArea
              value={weeklyPersonal}
              onChange={(e) => saveWeeklyPersonal(e.target.value)}
              placeholder="这周个人的事…"
              rows={3}
              style={{
                fontSize: 14, border: '1px solid #eee', background: '#fafafa',
                borderRadius: 10, padding: 12, resize: 'none', lineHeight: 1.8,
              }}
            />
          </div>
          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <Button onClick={() => setWfModalOpen(false)} style={{ borderRadius: 20 }}>完成</Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
