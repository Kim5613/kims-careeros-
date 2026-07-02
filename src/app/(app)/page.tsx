'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Card, Typography, Segmented, Button, Input, Checkbox, message, Popconfirm, Modal, DatePicker, TimePicker, Select, Tag, ColorPicker } from 'antd';
import { PlusOutlined, DeleteOutlined, LeftOutlined, RightOutlined, ScheduleOutlined, EnvironmentOutlined, ClockCircleOutlined, ExportOutlined, CopyOutlined } from '@ant-design/icons';
import type { InputRef } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/zh-cn';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(isoWeek);
dayjs.locale('zh-cn');

const { Title, Text } = Typography;

interface Todo {
  id: string; date: string; title: string; time?: string | null;
  color: string; location?: string | null; description?: string | null;
  reminder?: string | null; repeat?: string | null; category?: string | null;
  isTodo: boolean; completed: boolean;
}

const TODO_COLORS = ['#1677ff','#52c41a','#fa8c16','#ff4d4f','#722ed1','#13c2c2','#eb2f96','#faad14','#2f54eb','#a0d911'];

const MOVIE_QUOTES = [
  { quote: '生活就像一盒巧克力，你永远不知道下一颗是什么味道。', movie: '《阿甘正传》' },
  { quote: '希望是好事，也许是世间最好的事，好事永不消逝。', movie: '《肖申克的救赎》' },
  { quote: '要想人前显贵，必得人后受罪。', movie: '《霸王别姬》' },
  { quote: '人生不能像做菜，等所有材料准备好了才下锅。', movie: '《饮食男女》' },
  { quote: '记住，希望是好事，也许是世间最好的事。', movie: '《肖申克的救赎》' },
  { quote: '做人如果没有梦想，那跟咸鱼有什么分别？', movie: '《少林足球》' },
  { quote: '说的是一辈子，差一年一个月一天一个时辰都不算一辈子。', movie: '《霸王别姬》' },
  { quote: 'Carpe diem. Seize the day, boys. Make your lives extraordinary.', translation: '及时行乐，把握今天，让生命非凡。', movie: '《死亡诗社》' },
  { quote: '有些鸟是关不住的，它们的羽毛太鲜亮了。', movie: '《肖申克的救赎》' },
  { quote: '往往都是事情改变人，人改变不了事情。', movie: '《无间道》' },
  { quote: '出来混，迟早要还的。', movie: '《无间道》' },
  { quote: '我猜中了开头，却猜不中这结局。', movie: '《大话西游》' },
  { quote: '曾经有一份真挚的爱情摆在我面前，我没有珍惜。', movie: '《大话西游》' },
  { quote: 'You jump, I jump.', translation: '你跳，我就跳。', movie: '《泰坦尼克号》' },
  { quote: '人生总是这么苦，还是只有童年如此？——总是如此。', movie: '《这个杀手不太冷》' },
  { quote: '能力越大，责任越大。', movie: '《蜘蛛侠》' },
  { quote: '我不做大哥好多年。', movie: '《英雄本色》' },
  { quote: 'To infinity and beyond!', translation: '飞向宇宙，浩瀚无垠！', movie: '《玩具总动员》' },
  { quote: 'Yesterday is history. Tomorrow is a mystery. Today is a gift.', translation: '昨日已成历史，明日尚未可知，今日是份礼物。', movie: '《功夫熊猫》' },
  { quote: '我们一路奋战，不是为了改变世界，而是不让世界改变我们。', movie: '《熔炉》' },
  { quote: '世界上只有一种英雄主义，就是在认清生活真相之后依然热爱生活。', movie: '《闻香识女人》' },
  { quote: '让子弹飞一会儿。', movie: '《让子弹飞》' },
  { quote: '念念不忘，必有回响。', movie: '《一代宗师》' },
  { quote: '人如果没有了理想，那和无忧无虑有什么区别。', movie: '《后会无期》' },
  { quote: 'Keep your friends close, but your enemies closer.', translation: '亲近朋友，更要亲近敌人。', movie: '《教父2》' },
  { quote: '我听别人说这世界上有一种鸟是没有脚的。', movie: '《阿飞正传》' },
  { quote: '有些事现在不做，一辈子都不会做了。', movie: '《练习曲》' },
  { quote: 'Not all who wander are lost.', translation: '并非所有漂泊者都迷失了方向。', movie: '《指环王》' },
  { quote: '决定我们成为什么样的人，不是我们的能力，而是我们的选择。', movie: '《哈利·波特》' },
  { quote: '人最大的烦恼，就是记性太好。', movie: '《东邪西毒》' },
  { quote: 'May the Force be with you.', translation: '愿原力与你同在。', movie: '《星球大战》' },
  { quote: '风往哪个方向吹，草就往哪个方向倒。年轻的时候我以为自己是风，遍体鳞伤后才知道自己是草。', movie: '《艋舺》' },
  { quote: 'I\'ll be back.', translation: '我会回来的。', movie: '《终结者》' },
  { quote: '人生如棋，落子无悔。', movie: '《一代宗师》' },
  { quote: 'Why so serious?', translation: '干嘛那么严肃？', movie: '《蝙蝠侠：黑暗骑士》' },
  { quote: '你保护世界，我保护你。', movie: '《少年的你》' },
  { quote: 'Here\'s looking at you, kid.', translation: '永志不忘，亲爱的。', movie: '《卡萨布兰卡》' },
  { quote: '你越想忘记一个人时，其实你越会记得他。', movie: '《东邪西毒》' },
  { quote: 'My precious.', translation: '我的宝贝。', movie: '《指环王》' },
  { quote: '做人要厚道。', movie: '《手机》' },
];

interface MovieQuote { quote: string; movie: string; translation?: string; }
function getDailyQuote(dateStr: string): MovieQuote {
  const idx = dateStr.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % MOVIE_QUOTES.length;
  return MOVIE_QUOTES[idx] as MovieQuote;
}

type CalendarView = 'week' | 'month' | 'year' | 'day';

export default function DashboardPage() {
  const [view, setView] = useState<CalendarView>('day');
  const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs());
  const [todos, setTodos] = useState<Todo[]>([]);
  const [holidays, setHolidays] = useState<Record<string, string>>({});

  // 快速添加栏
  const [qaTitle, setQaTitle] = useState('');
  const [qaTime, setQaTime] = useState<string | null>(null);
  const [qaColor, setQaColor] = useState('#1677ff');
  const [qaIsTodo, setQaIsTodo] = useState(true);
  const [qaCategory, setQaCategory] = useState<string>('work');
  const qaInputRef = useRef<InputRef>(null);
  const [focusKey, setFocusKey] = useState(0);
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
  const [mDate, setMDate] = useState<Dayjs>(dayjs());
  const [mTitle, setMTitle] = useState('');
  const [mTime, setMTime] = useState<Dayjs | null>(null);
  const [mColor, setMColor] = useState('#1677ff');
  const [mLoc, setMLoc] = useState('');
  const [mDesc, setMDesc] = useState('');
  const [mRemind, setMRemind] = useState<string | null>(null);
  const [mRepeat, setMRepeat] = useState<string | null>(null);
  const [mIsTodo, setMIsTodo] = useState(true);
  const [mCategory, setMCategory] = useState<string | null>(null);

  // 周报弹窗
  const [reportOpen, setReportOpen] = useState(false);
  const [reportText, setReportText] = useState('');

  const todayStr = dayjs().format('YYYY-MM-DD');
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
  }, [view, currentDate]);

  const todosByDate = useMemo(() => {
    const map: Record<string, Todo[]> = {};
    for (const t of todos) { if (!map[t.date]) map[t.date] = []; map[t.date].push(t); }
    return map;
  }, [todos]);

  // ======== 快速添加 ========
  const quickAdd = async () => {
    if (!qaTitle.trim()) return;
    const date = currentDate.format('YYYY-MM-DD');
    try {
      const res = await fetch('/api/todos', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, title: qaTitle.trim(), time: qaTime, color: qaColor, isTodo: qaIsTodo, category: qaCategory }),
      });
      if (res.ok) {
        const nt = await res.json();
        setTodos((p) => [...p, nt]);
        setQaTitle('');
        setQaTime(null);
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
    setMColor(todo.color);
    setMLoc(todo.location || '');
    setMDesc(todo.description || '');
    setMRemind(todo.reminder ?? null);
    setMRepeat(todo.repeat ?? null);
    setMIsTodo(todo.isTodo);
    setMCategory(todo.category ?? null);
    setMOpen(true);
  };

  // ======== 从时间段新建日程 ========
  const openNewAtHour = (hourStr: string) => {
    setEditingTodo(null);
    setMDate(currentDate);
    setMTitle('');
    setMTime(dayjs(`${currentDate.format('YYYY-MM-DD')} ${hourStr}`, 'YYYY-MM-DD HH:mm'));
    setMColor(TODO_COLORS[Math.floor(Math.random() * TODO_COLORS.length)]);
    setMLoc('');
    setMDesc('');
    setMRemind(null);
    setMRepeat(null);
    setMIsTodo(false);
    setMCategory(null);
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
            time: mTime ? mTime.format('HH:mm') : null, color: mColor,
            location: mLoc.trim() || null, description: mDesc.trim() || null,
            reminder: mRemind, repeat: mRepeat, isTodo: mIsTodo, category: mCategory,
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
            time: mTime ? mTime.format('HH:mm') : null, color: mColor,
            location: mLoc.trim() || null, description: mDesc.trim() || null,
            reminder: mRemind, repeat: mRepeat, isTodo: mIsTodo, category: mCategory,
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

  const handleDrop = async (e: React.DragEvent, hourStr: string) => {
    e.preventDefault();
    const todoId = e.dataTransfer.getData('text/plain');
    if (!todoId) return;
    try {
      const res = await fetch(`/api/todos/${todoId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ time: `${hourStr}:00` }),
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
  const dayUntimedTodos = useMemo(() => dayTodos.filter(t => !t.time), [dayTodos]);
  // 按时段拆分
  const morningTodos = useMemo(() => dayTimedTodos.filter(t => parseInt(t.time || '0') < 12), [dayTimedTodos]);
  const afternoonTodos = useMemo(() => dayTimedTodos.filter(t => parseInt(t.time || '0') >= 12), [dayTimedTodos]);
  const morningHours = Array.from({length: 12}, (_, i) => i); // 0-11
  const afternoonHours = Array.from({length: 12}, (_, i) => i + 12); // 12-23
  // 顺延待办：前一天未完成的待办，顺延到今天
  const yesterdayStr = currentDate.subtract(1, 'day').format('YYYY-MM-DD');
  const carriedTodos = useMemo(() =>
    todos.filter((t) => !t.time && !t.completed && t.date === yesterdayStr),
  [todos, yesterdayStr]);
  // 待办列表（置顶优先，引用稳定）
  const sortedIncompleteTodos = useMemo(() =>
    dayUntimedTodos.filter(t => !t.completed).sort((a, b) => (pinnedIds.has(b.id) ? 1 : 0) - (pinnedIds.has(a.id) ? 1 : 0)),
  [dayUntimedTodos, pinnedIds]);
  const sortedCompleteTodos = useMemo(() =>
    dayUntimedTodos.filter(t => t.completed),
  [dayUntimedTodos]);
  const nowHour = dayjs().hour();
  const isTodayDetail = currentDate.isSame(dayjs(), 'day');

  // ======== 切换到日视图 ========
  const goToDay = (d: Dayjs) => {
    setCurrentDate(d);
    setView('day');
    setQaTitle(''); setQaTime(null); setQaColor(TODO_COLORS[Math.floor(Math.random() * TODO_COLORS.length)]); setQaCategory(null);
    setTimeout(() => setFocusKey(k => k + 1), 100);
  };

  // ======== 导出周报 ========
  const exportWeekReport = () => {
    const s = currentDate.startOf('isoWeek');
    const lines: string[] = [
      `📅 周报 | ${s.format('YYYY/M/D')} - ${s.add(6, 'day').format('M/D')}`,
      `生成时间：${dayjs().format('YYYY-MM-DD HH:mm')}`,
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
          <Button size="small" onClick={() => { setCurrentDate(dayjs()); if (view==='day') { setQaTitle(''); setQaTime(null); setQaCategory(null); setFocusKey(k=>k+1); } }} style={{ borderRadius: 20 }}>今天</Button>
          {view === 'week' && (
            <Button size="small" icon={<ExportOutlined />} onClick={exportWeekReport} style={{ borderRadius: 20 }}>导出周报</Button>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Segmented value={view} onChange={(v) => { setView(v as CalendarView); if (v==='day') { setQaTitle(''); setQaTime(null); setQaCategory(null); setTimeout(()=>setFocusKey(k=>k+1),100); } }}
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
  // 时间线列（上午/下午共用的渲染函数）
  const renderHourColumn = (hours: number[], hourTodos: typeof morningTodos, bg: string) => (
    <div style={{ flex: 1, overflowY: 'scroll', paddingRight: 4, overflowAnchor: 'none', background: bg, borderRadius: 16, padding: '6px 10px' }}>
        {hours.map((h) => {
          const hh = String(h).padStart(2, '0');
          const hourStr = `${hh}:00`;
          const todos = hourTodos.filter((t) => t.time && t.time.startsWith(hh));
          const isCurrentHour = isTodayDetail && h === nowHour;
          return (
            <div key={h} style={{
              display: 'flex', gap: 8, padding: '4px 6px',
              borderBottom: '1px solid #f3f1ee', minHeight: 56,
              background: isCurrentHour ? '#f6f3ff' : 'transparent',
              borderRadius: isCurrentHour ? 12 : 8,
              cursor: todos.length === 0 ? 'pointer' : 'default',
              transition: 'background 0.15s',
            }} onClick={() => { if (todos.length === 0) openNewAtHour(hourStr); }}
              onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, hourStr)}>
              <Text type="secondary" style={{
                width: 42, flexShrink: 0, textAlign: 'right', fontSize: 13,
                fontWeight: isCurrentHour ? 600 : 400, color: isCurrentHour ? '#8b7cf0' : '#ccc',
                paddingTop: 2,
              }}>{hourStr}</Text>
              <div style={{ flex: 1, minWidth: 0 }}>
                {todos.map((t) => (
                  <div key={t.id} draggable onDragStart={(e) => handleDragStart(e, t.id)}
                    onClick={(e) => { e.stopPropagation(); openEdit(t); }} style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px',
                    borderRadius: 12, background: `${t.color}16`, borderLeft: `4px solid ${t.color}`,
                    marginBottom: 3, cursor: 'grab', boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                  }}>
                    {t.isTodo && !t.completed && <Checkbox checked={false} onChange={() => toggleTodo(t)} onClick={(e) => e.stopPropagation()} style={{ transform: 'scale(0.85)' }} />}
                    <Text strong delete={t.completed} style={{ flex: 1, fontSize: 13, wordBreak: 'break-word' }}>
                      {t.category === 'work' && <span style={{ marginRight: 2 }}>💼</span>}
                      {t.category === 'personal' && <span style={{ marginRight: 2 }}>🐱</span>}
                      {t.title}
                    </Text>
                    {t.isTodo && <Tag style={{ fontSize: 9, lineHeight: '14px', margin: 0, padding: '0 4px' }}>待办</Tag>}
                    <Button type="text" size="small" danger icon={<DeleteOutlined style={{ fontSize: 10 }} />}
                      onClick={(e) => { e.stopPropagation(); deleteTodo(t.id); }} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
  );

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
            <TimePicker value={qaTime ? dayjs(qaTime, 'HH:mm') : null}
              onChange={(t) => setQaTime(t ? t.format('HH:mm') : null)}
              format="HH:mm" placeholder="时间" size="small" style={{ width: 100 }} />
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
          {renderHourColumn(morningHours, morningTodos, '#fefdfb')}
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
          {renderHourColumn(afternoonHours, afternoonTodos, '#fdfbfa')}
        </div>

        {/* 待办列 */}
        <div style={{ display: 'flex', flexDirection: 'column', overflowY: 'scroll', overflowAnchor: 'none' }}>
          <div style={{
            fontWeight: 600, fontSize: 13, color: '#666', padding: '6px 12px',
            background: '#faf8f6', borderBottom: '1px solid #f0ece8',
            position: 'sticky', top: 0, zIndex: 1, display: 'flex', alignItems: 'center', gap: 6,
          }}>
            📋 待办
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
                <Text type="secondary" style={{ fontSize: 11, marginBottom: 6, display: 'block' }}>顺延</Text>
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
                    <Text type="secondary" style={{ fontSize: 10 }}>{t.date}</Text>
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
        {(() => { const dq = getDailyQuote(todayStr); return (
          <Text type="secondary" style={{ fontSize: 13, fontStyle: 'italic', color: '#bbb', maxWidth: 400, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
            「{dq.quote}」{dq.translation && <span style={{ fontStyle: 'normal' }}>（{dq.translation}）</span>}
            <span style={{ fontStyle: 'normal', marginLeft: 4 }}>— {dq.movie}</span>
          </Text>); })()}
      </div>

      {renderNavBar()}

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
        width={mIsTodo ? 420 : 480}
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
        <div style={{ display: 'flex', gap: 24, marginBottom: 12, alignItems: 'flex-end' }}>
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
                <Text type="secondary">时间</Text>
                <TimePicker value={mTime} onChange={(t) => setMTime(t)} format="HH:mm" placeholder="选填" style={{ width: '100%', marginTop: 4 }} />
              </div>
              <div style={{ flex: 1 }} />
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
    </div>
  );
}
