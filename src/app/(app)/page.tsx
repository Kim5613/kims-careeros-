'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, Typography, Segmented, Button, Input, Checkbox, message, Popconfirm, Modal, DatePicker, TimePicker, Select, Switch, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined, LeftOutlined, RightOutlined, ScheduleOutlined, EnvironmentOutlined, ClockCircleOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/zh-cn';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(isoWeek);
dayjs.locale('zh-cn');

const { Title, Text } = Typography;

interface Todo {
  id: string; date: string; title: string; time?: string | null;
  color: string; location?: string | null; description?: string | null;
  reminder?: string | null; repeat?: string | null; isTodo: boolean; completed: boolean;
}

const TODO_COLORS = ['#1677ff','#52c41a','#fa8c16','#ff4d4f','#722ed1','#13c2c2','#eb2f96','#faad14','#2f54eb','#a0d911'];
type CalendarView = 'week' | 'month' | 'year';

export default function DashboardPage() {
  const [view, setView] = useState<CalendarView>('week');
  const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs());
  const [todos, setTodos] = useState<Todo[]>([]);
  const [holidays, setHolidays] = useState<Record<string, string>>({});

  // 新增日程
  const [mOpen, setMOpen] = useState(false);
  const [mMode, setMMode] = useState<'full' | 'simple'>('full');
  const [mDate, setMDate] = useState<Dayjs>(dayjs());
  const [mTitle, setMTitle] = useState('');
  const [mTime, setMTime] = useState<Dayjs | null>(null);
  const [mColor, setMColor] = useState('#1677ff');
  const [mLoc, setMLoc] = useState('');
  const [mDesc, setMDesc] = useState('');
  const [mRemind, setMRemind] = useState<string | null>(null);
  const [mRepeat, setMRepeat] = useState<string | null>(null);
  const [mIsTodo, setMIsTodo] = useState(true);

  // 日详情
  const [dayOpen, setDayOpen] = useState(false);
  const [dayDate, setDayDate] = useState<Dayjs>(dayjs());

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

  // 加载日程
  useEffect(() => {
    const param = view === 'year' ? 'year' : 'month';
    const val = view === 'year' ? currentDate.format('YYYY') : currentDate.format('YYYY-MM');
    fetch(`/api/todos?${param}=${val}`).then((r) => r.json()).then((d) => { if (Array.isArray(d)) setTodos(d); }).catch(() => {});
  }, [view, currentDate]);

  const todosByDate = useMemo(() => {
    const map: Record<string, Todo[]> = {};
    for (const t of todos) { if (!map[t.date]) map[t.date] = []; map[t.date].push(t); }
    return map;
  }, [todos]);

  const todayTodos = (todosByDate[todayStr] || []).filter((t) => t.isTodo);
  const incompleteTodos = useMemo(() =>
    todos.filter((t) => t.isTodo && !t.completed && t.date <= todayStr).sort((a, b) => b.date.localeCompare(a.date)),
  [todos]);

  const openModal = (date: Dayjs, mode: 'full' | 'simple' = 'full') => {
    setMMode(mode); setMDate(date); setMTitle(''); setMTime(null);
    setMColor(TODO_COLORS[Math.floor(Math.random() * TODO_COLORS.length)]);
    setMLoc(''); setMDesc(''); setMRemind(null); setMRepeat(null); setMIsTodo(mode === 'simple');
    setMOpen(true);
  };

  const submitTodo = async () => {
    if (!mTitle.trim()) return;
    try {
      const res = await fetch('/api/todos', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: mDate.format('YYYY-MM-DD'), title: mTitle.trim(), time: mTime ? mTime.format('HH:mm') : null, color: mColor, location: mLoc.trim() || null, description: mDesc.trim() || null, reminder: mRemind, repeat: mRepeat, isTodo: mIsTodo }),
      });
      if (res.ok) { const nt = await res.json(); setTodos((p) => [...p, nt]); setMOpen(false); }
    } catch { message.error('添加失败'); }
  };

  const toggleTodo = async (todo: Todo) => {
    try {
      await fetch(`/api/todos/${todo.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ completed: !todo.completed }) });
      setTodos((p) => p.map((t) => (t.id === todo.id ? { ...t, completed: !t.completed } : t)));
    } catch { message.error('操作失败'); }
  };

  const deleteTodo = async (id: string) => {
    try { await fetch(`/api/todos/${id}`, { method: 'DELETE' }); setTodos((p) => p.filter((t) => t.id !== id)); } catch { message.error('删除失败'); }
  };

  const navLabel = useMemo(() => {
    if (view === 'week') { const s = currentDate.startOf('isoWeek'); return `${s.format('M/D')} - ${s.add(6,'day').format('M/D')}`; }
    if (view === 'month') return currentDate.format('YYYY年M月');
    return currentDate.format('YYYY年');
  }, [view, currentDate]);
  const goPrev = () => { if (view==='week') setCurrentDate((d)=>d.subtract(1,'week')); else if (view==='month') setCurrentDate((d)=>d.subtract(1,'month')); else setCurrentDate((d)=>d.subtract(1,'year')); };
  const goNext = () => { if (view==='week') setCurrentDate((d)=>d.add(1,'week')); else if (view==='month') setCurrentDate((d)=>d.add(1,'month')); else setCurrentDate((d)=>d.add(1,'year')); };
  const weekDays = ['一','二','三','四','五','六','日'];
  const weekDates = useMemo(() => { const s = currentDate.startOf('isoWeek'); return Array.from({length:7},(_,i)=>s.add(i,'day')); }, [currentDate]);
  const monthGrid = useMemo(() => { const s = currentDate.startOf('month').startOf('isoWeek'); return Array.from({length:42},(_,i)=>s.add(i,'day')); }, [currentDate]);
  const yearMonths = useMemo(() => Array.from({length:12},(_,i)=>currentDate.month(i).startOf('month')), [currentDate]);

  const dayHours = Array.from({length:24},(_,i)=>i);
  const dayTodos = (todosByDate[dayDate.format('YYYY-MM-DD')] || []).sort((a,b)=>(a.time||'99')>(b.time||'99')?1:-1);

  const renderTodoItem = (todo: Todo, compact = false) => (
    <div key={todo.id} style={{ display:'flex',alignItems:'flex-start',gap:4,padding:'2px 6px',marginBottom:2,borderRadius:4,background:`${todo.color}14`,borderLeft:`3px solid ${todo.color}` }}>
      <Checkbox checked={todo.completed} onChange={()=>toggleTodo(todo)} style={{marginTop:1,fontSize:compact?11:13}} />
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:'flex',alignItems:'center',gap:4}}>
          <Text delete={todo.completed} style={{fontSize:compact?11:13,fontWeight:500,color:todo.completed?'#ccc':'#333'}}>{todo.title}</Text>
          {todo.time && <Text style={{fontSize:10,color:'#999'}}>{todo.time}</Text>}
        </div>
        {!compact && todo.location && <Text style={{fontSize:10,color:'#999',display:'block'}}>📍 {todo.location}</Text>}
      </div>
      <Popconfirm title="删除？" onConfirm={()=>deleteTodo(todo.id)} okText="删" cancelText="否">
        <Button type="text" size="small" danger icon={<DeleteOutlined style={{fontSize:10}}/>}/>
      </Popconfirm>
    </div>
  );

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0, fontWeight: 500 }}>今天的Kim依旧光芒万丈</Title>
        <Text type="secondary">{dayjs().format('YYYY年M月D日 dddd')}</Text>
      </div>

      <div style={{ display: 'flex', gap: 16, alignItems: 'stretch' }}>

        {/* 左侧：日历 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <Card style={{ borderRadius: 12 }} styles={{ body: { padding: '16px 24px', maxHeight: 'calc(100vh - 140px)', overflowY: 'auto' } }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Button icon={<LeftOutlined />} size="small" onClick={goPrev} />
                <Text strong style={{ fontSize: 16, minWidth: 180, textAlign: 'center' }}>{navLabel}</Text>
                <Button icon={<RightOutlined />} size="small" onClick={goNext} />
                <Button size="small" onClick={() => setCurrentDate(dayjs())}>今天</Button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal(dayjs())}>新建日程</Button>
                <Segmented value={view} onChange={(v) => { setView(v as CalendarView); }}
                  options={[{ label: '周', value: 'week' }, { label: '月', value: 'month' }, { label: '年', value: 'year' }]} />
              </div>
            </div>

            {view === 'week' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
                {weekDates.map((d) => {
                  const ds = d.format('YYYY-MM-DD'); const isToday = ds === todayStr;
                  const isWeekend = d.day() === 0 || d.day() === 6;
                  const holiday = holidays[ds];
                  const list = todosByDate[ds] || [];
                  return (
                    <div key={ds} style={{ cursor:'pointer', border: isToday?'2px solid #1677ff':'1px solid #f0f0f0', borderRadius:8, padding:'10px 10px', minHeight: 340, background: isToday?'#f0f5ff':isWeekend?'#fafafa':'#fff' }}
                      onClick={(e) => { if ((e.target as HTMLElement).tagName !== 'LABEL' && !(e.target as HTMLElement).closest('button')) { setDayDate(d); setDayOpen(true); } }}>
                      <div style={{textAlign:'center',marginBottom:4}}>
                        <Text type="secondary" style={{fontSize:11}}>{weekDays[d.isoWeekday()-1]}</Text>
                        <div>
                          <Text strong style={{fontSize:isToday?18:14,color:isToday?'#1677ff':isWeekend?'#ff4d4f':'#333'}}>{d.date()}</Text>
                          {holiday && <Tag color="red" style={{fontSize:9,padding:'0 3px',lineHeight:'16px',marginLeft:2}}>{holiday}</Tag>}
                        </div>
                      </div>
                      {list.slice(0, 3).map((t) => (
                        <div key={t.id} style={{fontSize:10,padding:'1px 3px',marginBottom:1,borderRadius:2,background:`${t.color}20`,overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}}>
                          {t.time && <span style={{color:'#999',marginRight:2}}>{t.time}</span>}
                          {t.title}
                        </div>
                      ))}
                      {list.length > 3 && <Text style={{fontSize:10,color:'#999'}}>+{list.length-3} 更多</Text>}
                    </div>
                  );
                })}
              </div>
            )}

            {view === 'month' && (
              <div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:4,marginBottom:8}}>
                  {weekDays.map((w)=><Text key={w} type="secondary" style={{textAlign:'center',fontSize:13}}>{w}</Text>)}
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:4}}>
                  {monthGrid.map((d) => {
                    const ds = d.format('YYYY-MM-DD'); const isToday = ds === todayStr; const isOther = d.month() !== currentDate.month();
                    const holiday = holidays[ds]; const list = todosByDate[ds] || [];
                    return (
                      <div key={ds} onClick={() => { setDayDate(d); setDayOpen(true); }} style={{cursor:'pointer',border:isToday?'2px solid #1677ff':'1px solid #f0f0f0',borderRadius:6,padding:'4px 6px',background:isToday?'#f0f5ff':isOther?'#fafafa':'#fff',opacity:isOther?0.5:1}}>
                        <div style={{display:'flex',alignItems:'center',gap:2}}>
                          <Text style={{fontSize:11,fontWeight:isToday?700:400,color:isToday?'#1677ff':isOther?'#ccc':'#666'}}>{d.date()}</Text>
                          {holiday && <Tag color="red" style={{fontSize:8,padding:'0 2px',lineHeight:'14px'}}>{holiday.slice(0,2)}</Tag>}
                        </div>
                        {list.slice(0,2).map((t)=>(
                          <div key={t.id} style={{fontSize:9,lineHeight:1.3,overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis',color:t.completed?'#ccc':'#333'}}>
                            {t.time && <span style={{color:'#999'}}>{t.time} </span>}{t.title}
                          </div>
                        ))}
                        {list.length>2 && <Text style={{fontSize:9,color:'#999'}}>+{list.length-2}</Text>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {view === 'year' && (
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
                {yearMonths.map((m) => {
                  const mk = m.format('YYYY-MM'); const mt = todos.filter((t)=>t.date.startsWith(mk));
                  const done = mt.filter((t)=>t.completed).length;
                  return (
                    <Card key={mk} size="small" hoverable style={{borderRadius:8}} styles={{body:{padding:'12px 16px'}}} onClick={()=>{setCurrentDate(m);setView('month');}}>
                      <Text strong>{m.format('M月')}</Text>
                      <div style={{marginTop:4}}><Text style={{fontSize:12,color:'#999'}}>{mt.length>0?`${done}/${mt.length} 已完成`:'暂无日程'}</Text></div>
                      {mt.length>0&&<div style={{marginTop:4,height:3,background:'#f0f0f0',borderRadius:2}}><div style={{height:3,width:`${(done/mt.length)*100}%`,background:'#52c41a',borderRadius:2}}/></div>}
                    </Card>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* 右侧：待办面板 */}
        <Card
          title={<span><ScheduleOutlined /> 今日待办</span>}
          style={{ width: 360, borderRadius: 12, flexShrink: 0 }}
          styles={{ body: { padding: '12px 16px', maxHeight: 'calc(100vh - 140px)', overflowY: 'auto' } }}
          extra={<Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => openModal(dayjs(), 'simple')}>新增</Button>}
        >
          <Text type="secondary" style={{ fontSize: 12, marginBottom: 8, display: 'block' }}>未完成 ({incompleteTodos.filter(t=>!t.completed).length})</Text>
          {incompleteTodos.filter(t=>!t.completed).length === 0 ? (
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 16 }}>🎉 全部完成</Text>
          ) : (
            <div style={{ marginBottom: 16 }}>
              {incompleteTodos.filter(t=>!t.completed).map((t) => (
                <div key={t.id} style={{ display:'flex',alignItems:'flex-start',gap:4,padding:'3px 8px',marginBottom:4,borderRadius:4,background:`${t.color}14`,borderLeft:`3px solid ${t.color}` }}>
                  <Checkbox checked={false} onChange={()=>toggleTodo(t)} style={{marginTop:2}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',alignItems:'center',gap:6}}>
                      <Text style={{fontSize:13,fontWeight:500}}>{t.title}</Text>
                      {t.time && <Text style={{fontSize:11,color:'#999'}}><ClockCircleOutlined /> {t.time}</Text>}
                    </div>
                    {t.location && <Text style={{fontSize:10,color:'#999',display:'block'}}><EnvironmentOutlined /> {t.location}</Text>}
                    {!t.date.startsWith(todayStr) && <Text style={{fontSize:10,color:'#ff4d4f'}}>⏰ 逾期</Text>}
                  </div>
                  <Popconfirm title="删除？" onConfirm={()=>deleteTodo(t.id)} okText="删" cancelText="否">
                    <Button type="text" size="small" danger icon={<DeleteOutlined style={{fontSize:10}}/>}/>
                  </Popconfirm>
                </div>
              ))}
            </div>
          )}

          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 12 }} />
          <Text type="secondary" style={{ fontSize: 12, marginBottom: 8, display: 'block' }}>今日新建</Text>
          {todayTodos.length === 0 ? (
            <Text type="secondary" style={{ fontSize: 12 }}>暂无</Text>
          ) : (
            todayTodos.map((t) => renderTodoItem(t, true))
          )}
        </Card>
      </div>

      {/* 新建弹窗 — 日程(完整) / 待办(简易) */}
      <Modal
        title={<span><ScheduleOutlined /> {mMode === 'simple' ? '新建待办' : '新建日程'}</span>}
        open={mOpen} onOk={submitTodo} onCancel={()=>setMOpen(false)} okText="保存" cancelText="取消"
        okButtonProps={{disabled:!mTitle.trim()}} width={480}
      >
        <div style={{marginBottom:12}}>
          <Text type="secondary">颜色</Text>
          <div style={{display:'flex',gap:6,marginTop:4}}>
            {TODO_COLORS.map((c)=><div key={c} onClick={()=>setMColor(c)} style={{width:24,height:24,borderRadius:12,background:c,cursor:'pointer',border:mColor===c?'3px solid #333':'3px solid transparent',transition:'all 0.15s'}}/>)}
          </div>
        </div>
        <div style={{marginBottom:12}}><Text type="secondary">标题</Text><Input value={mTitle} onChange={(e)=>setMTitle(e.target.value)} placeholder={mMode==='simple'?'待办事项':'日程标题'} autoFocus style={{marginTop:4}}/></div>

        {mMode === 'full' && (
          <>
            <div style={{display:'flex',gap:12,marginBottom:12}}>
              <div style={{flex:1}}><Text type="secondary">日期</Text><DatePicker value={mDate} onChange={(d)=>d&&setMDate(d)} style={{width:'100%',marginTop:4}}/></div>
              <div style={{flex:1}}><Text type="secondary">时间</Text><TimePicker value={mTime} onChange={(t)=>setMTime(t)} format="HH:mm" placeholder="选填" style={{width:'100%',marginTop:4}}/></div>
            </div>
            <div style={{marginBottom:12}}><Text type="secondary">地点</Text><Input value={mLoc} onChange={(e)=>setMLoc(e.target.value)} placeholder="选填" style={{marginTop:4}}/></div>
          </>
        )}

        {mMode === 'simple' && (
          <div style={{marginBottom:12}}>
            <Text type="secondary">日期</Text>
            <DatePicker value={mDate} onChange={(d)=>d&&setMDate(d)} style={{width:'100%',marginTop:4}}/>
          </div>
        )}

        <div style={{marginBottom:12}}><Text type="secondary">描述</Text><Input.TextArea rows={2} value={mDesc} onChange={(e)=>setMDesc(e.target.value)} placeholder="选填" style={{marginTop:4}}/></div>

        {mMode === 'full' && (
          <>
            <div style={{display:'flex',gap:12,marginBottom:12}}>
              <div style={{flex:1}}><Text type="secondary">提醒</Text><Select value={mRemind} onChange={setMRemind} allowClear placeholder="不提醒" style={{width:'100%',marginTop:4}} options={[{label:'提前15分钟',value:'15min'},{label:'提前30分钟',value:'30min'},{label:'提前1小时',value:'1hour'}]}/></div>
              <div style={{flex:1}}><Text type="secondary">重复</Text><Select value={mRepeat} onChange={setMRepeat} allowClear placeholder="不重复" style={{width:'100%',marginTop:4}} options={[{label:'每天',value:'daily'},{label:'每周',value:'weekly'},{label:'每月',value:'monthly'}]}/></div>
            </div>
            <div style={{borderTop:'1px solid #f0f0f0',paddingTop:12,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <Text>设为待办</Text>
              <Switch checked={mIsTodo} onChange={setMIsTodo} />
            </div>
            <Text type="secondary" style={{fontSize:11}}>{mIsTodo ? '开启后将同步到右侧待办面板' : '关闭后仅显示在日历中，不进入待办列表'}</Text>
          </>
        )}
      </Modal>

      {/* 日详情弹窗 — 24小时，覆盖大部分屏幕 */}
      <Modal title={<span style={{fontSize:20}}>{dayDate.format('YYYY年M月D日 dddd')}</span>} open={dayOpen} onCancel={()=>setDayOpen(false)} footer={null} width="85vw" style={{top:12}}>
        <div style={{ maxHeight: 'calc(85vh - 180px)', overflowY: 'auto', paddingRight: 8 }}>
          {dayHours.map((h) => {
            const hh = String(h).padStart(2,'0');
            const hourStr = `${hh}:00`;
            const hourTodos = dayTodos.filter((t)=>t.time && t.time.startsWith(hh));
            return (
              <div key={h} style={{ display:'flex',gap:16,padding:'10px 8px',borderBottom:'1px solid #f5f5f5',minHeight:60 }}
                onClick={() => { if (hourTodos.length === 0) { setDayOpen(false); const d = dayDate.hour(h).minute(0); setMTime(d); openModal(dayDate); } }}>
                <Text type="secondary" style={{width:64,fontSize:16,textAlign:'right',flexShrink:0,paddingTop:4}}>{hourStr}</Text>
                <div style={{flex:1}}>
                  {hourTodos.map((t) => (
                    <div key={t.id} style={{display:'flex',alignItems:'center',gap:12,padding:'8px 14px',borderRadius:8,background:`${t.color}20`,borderLeft:`5px solid ${t.color}`,marginBottom:4}}>
                      <Text strong style={{fontSize:15}}>{t.title}</Text>
                      {t.location && <Text style={{fontSize:13,color:'#999'}}>📍 {t.location}</Text>}
                      {t.description && <Text style={{fontSize:12,color:'#999',maxWidth:200}} ellipsis>{t.description}</Text>}
                      <div style={{flex:1}}/>
                      <Checkbox checked={t.completed} onChange={()=>toggleTodo(t)}/>
                      <Popconfirm title="删除？" onConfirm={()=>deleteTodo(t.id)} okText="删" cancelText="否">
                        <Button type="text" danger icon={<DeleteOutlined />}/>
                      </Popconfirm>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{marginTop:20}}>
          <Button size="large" icon={<PlusOutlined />} onClick={() => { setDayOpen(false); openModal(dayDate); }}>在此日新增</Button>
        </div>
      </Modal>
    </div>
  );
}
