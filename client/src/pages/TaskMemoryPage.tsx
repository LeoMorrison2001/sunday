import {useCallback, useEffect, useState} from 'react';
import {createTheme, ThemeProvider} from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Switch from '@mui/material/Switch';

const API = 'http://localhost:3001/api';
const nativeTheme = createTheme();

interface LookupOption {
    id: number;
    name: string;
}

interface TaskMemory {
    id: number;
    content: string;
    cron_expression: string;
    status: string;
    execution_count: number;
    created_at: string;
    updated_at: string;
}

// ---- Cron 可视化构建器 ----

type FrequencyType = 'daily' | 'weekly' | 'monthly' | 'interval';

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
const HOURS = Array.from({length: 24}, (_, i) => i);
const MINUTES = Array.from({length: 60}, (_, i) => i);

function parseCron(expr: string): {
    type: FrequencyType;
    hour: number;
    minute: number;
    dayOfWeek: number;
    dayOfMonth: number;
    interval: number
} {
    const parts = expr.trim().split(/\s+/);
    if (parts.length !== 5) return {type: 'daily', hour: 9, minute: 0, dayOfWeek: 1, dayOfMonth: 1, interval: 30};
    const [min, hour, dom, , dow] = parts;
    if (min.startsWith('*/')) return {
        type: 'interval',
        hour: 0,
        minute: 0,
        dayOfWeek: 1,
        dayOfMonth: 1,
        interval: Number(min.slice(2))
    };
    if (dow !== '*') return {
        type: 'weekly',
        hour: Number(hour),
        minute: Number(min),
        dayOfWeek: Number(dow),
        dayOfMonth: 1,
        interval: 30
    };
    if (dom !== '*') return {
        type: 'monthly',
        hour: Number(hour),
        minute: Number(min),
        dayOfWeek: 1,
        dayOfMonth: Number(dom),
        interval: 30
    };
    return {type: 'daily', hour: Number(hour), minute: Number(min), dayOfWeek: 1, dayOfMonth: 1, interval: 30};
}

function buildCron(type: FrequencyType, hour: number, minute: number, dayOfWeek: number, dayOfMonth: number, interval: number): string {
    switch (type) {
        case 'daily':
            return `${minute} ${hour} * * *`;
        case 'weekly':
            return `${minute} ${hour} * * ${dayOfWeek}`;
        case 'monthly':
            return `${minute} ${hour} ${dayOfMonth} * *`;
        case 'interval':
            return `*/${interval} * * * *`;
    }
}

function cronToLabel(expr: string): string {
    const p = parseCron(expr);
    switch (p.type) {
        case 'daily':
            return `每天 ${String(p.hour).padStart(2, '0')}:${String(p.minute).padStart(2, '0')}`;
        case 'weekly':
            return `每${WEEKDAYS[p.dayOfWeek]} ${String(p.hour).padStart(2, '0')}:${String(p.minute).padStart(2, '0')}`;
        case 'monthly':
            return `每月 ${p.dayOfMonth} 号 ${String(p.hour).padStart(2, '0')}:${String(p.minute).padStart(2, '0')}`;
        case 'interval':
            return `每 ${p.interval} 分钟`;
    }
}

function CronBuilder({value, onChange}: { value: string; onChange: (v: string) => void }) {
    const parsed = parseCron(value);
    const [type, setType] = useState<FrequencyType>(parsed.type);
    const [hour, setHour] = useState(parsed.hour);
    const [minute, setMinute] = useState(parsed.minute);
    const [dayOfWeek, setDayOfWeek] = useState(parsed.dayOfWeek);
    const [dayOfMonth, setDayOfMonth] = useState(parsed.dayOfMonth);
    const [interval, setInterval_] = useState(parsed.interval);

    const emit = (t: FrequencyType, h: number, m: number, dow: number, dom: number, iv: number) => {
        onChange(buildCron(t, h, m, dow, dom, iv));
    };

    const cron = buildCron(type, hour, minute, dayOfWeek, dayOfMonth, interval);

    return (
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
            <TextField select label="频率" value={type} fullWidth
                       onChange={(e) => {
                           const t = e.target.value as FrequencyType;
                           setType(t);
                           emit(t, hour, minute, dayOfWeek, dayOfMonth, interval);
                       }}>
                <MenuItem value="daily">每天</MenuItem>
                <MenuItem value="weekly">每周</MenuItem>
                <MenuItem value="monthly">每月</MenuItem>
                <MenuItem value="interval">每隔N分钟</MenuItem>
            </TextField>

            {type === 'weekly' && (
                <TextField select label="星期" value={dayOfWeek} fullWidth
                           onChange={(e) => {
                               const v = Number(e.target.value);
                               setDayOfWeek(v);
                               emit(type, hour, minute, v, dayOfMonth, interval);
                           }}>
                    {WEEKDAYS.map((d, i) => <MenuItem key={i} value={i}>{d}</MenuItem>)}
                </TextField>
            )}

            {type === 'monthly' && (
                <TextField select label="日期" value={dayOfMonth} fullWidth
                           onChange={(e) => {
                               const v = Number(e.target.value);
                               setDayOfMonth(v);
                               emit(type, hour, minute, dayOfWeek, v, interval);
                           }}>
                    {Array.from({length: 31}, (_, i) => i + 1).map(d => <MenuItem key={d} value={d}>{d} 号</MenuItem>)}
                </TextField>
            )}

            {type === 'interval' ? (
                <TextField label="间隔（分钟）" type="number" value={interval} fullWidth
                           inputProps={{min: 1}}
                           onChange={(e) => {
                               const v = Math.max(1, Number(e.target.value));
                               setInterval_(v);
                               emit(type, hour, minute, dayOfWeek, dayOfMonth, v);
                           }}/>
            ) : (
                <Box sx={{display: 'flex', gap: 1.5}}>
                    <TextField select label="小时" value={hour} fullWidth
                               onChange={(e) => {
                                   const v = Number(e.target.value);
                                   setHour(v);
                                   emit(type, v, minute, dayOfWeek, dayOfMonth, interval);
                               }}>
                        {HOURS.map(h => <MenuItem key={h} value={h}>{String(h).padStart(2, '0')} 时</MenuItem>)}
                    </TextField>
                    <TextField select label="分钟" value={minute} fullWidth
                               onChange={(e) => {
                                   const v = Number(e.target.value);
                                   setMinute(v);
                                   emit(type, hour, v, dayOfWeek, dayOfMonth, interval);
                               }}>
                        {MINUTES.map(m => <MenuItem key={m} value={m}>{String(m).padStart(2, '0')} 分</MenuItem>)}
                    </TextField>
                </Box>
            )}

            <Box sx={{display: 'flex', gap: 2, alignItems: 'center', mt: 0.5}}>
                <Typography variant="body2" sx={{fontFamily: 'monospace', color: 'text.secondary'}}>
                    {cron}
                </Typography>
                <Typography variant="body2" color="primary">
                    {cronToLabel(cron)}
                </Typography>
            </Box>
        </Box>
    );
}

// ---- 主页面 ----

export default function TaskMemoryPage() {
    const [tasks, setTasks] = useState<TaskMemory[]>([]);
    const [taskStatuses, setTaskStatuses] = useState<LookupOption[]>([]);
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [detail, setDetail] = useState<TaskMemory | null>(null);
    const [form, setForm] = useState({content: '', cron_expression: '0 9 * * *'});
    const [editForm, setEditForm] = useState({content: '', cron_expression: '', status: ''});
    const [errors, setErrors] = useState<Record<string, string>>({});

    const fetchTasks = useCallback(async () => {
        const res = await fetch(`${API}/task-memories`);
        setTasks(await res.json());
    }, []);

    const fetchTaskStatuses = useCallback(async () => {
        const res = await fetch(`${API}/task-statuses`);
        setTaskStatuses(await res.json());
    }, []);

    useEffect(() => {
        fetchTasks();
        fetchTaskStatuses();
    }, [fetchTasks, fetchTaskStatuses]);

    const openAddDialog = () => {
        setForm({content: '', cron_expression: '0 9 * * *'});
        setErrors({});
        setAddDialogOpen(true);
    };

    const openEditDialog = (t: TaskMemory) => {
        setEditingId(t.id);
        setEditForm({content: t.content, cron_expression: t.cron_expression, status: t.status});
        setErrors({});
        setEditDialogOpen(true);
    };

    const openDetailDialog = (t: TaskMemory) => {
        setDetail(t);
        setDetailDialogOpen(true);
    };

    const validate = (data: { content: string; cron_expression: string }) => {
        const newErrors: Record<string, string> = {};
        if (!data.content) newErrors.content = '请输入任务内容';
        if (!data.cron_expression) newErrors.cron_expression = '请设置执行频率';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAdd = async () => {
        if (!validate(form)) return;
        await fetch(`${API}/task-memories`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(form),
        });
        setAddDialogOpen(false);
        fetchTasks();
    };

    const handleEdit = async () => {
        if (!validate(editForm)) return;
        await fetch(`${API}/task-memories/${editingId}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(editForm),
        });
        setEditDialogOpen(false);
        fetchTasks();
    };

    const handleDelete = async (id: number) => {
        await fetch(`${API}/task-memories/${id}`, {method: 'DELETE'});
        fetchTasks();
    };

    const handleToggleStatus = async (t: TaskMemory) => {
        const newStatus = t.status === '启用' ? '关闭' : '启用';
        await fetch(`${API}/task-memories/${t.id}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({status: newStatus}),
        });
        fetchTasks();
    };

    return (
        <ThemeProvider theme={nativeTheme}>
            <Box>
                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3}}>
                    <Typography variant="h4">任务记忆</Typography>
                    <Button variant="contained" startIcon={<AddIcon/>} onClick={openAddDialog}>
                        新增任务
                    </Button>
                </Box>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>任务内容</TableCell>
                                <TableCell>执行频率</TableCell>
                                <TableCell>状态</TableCell>
                                <TableCell align="center">已执行次数</TableCell>
                                <TableCell>创建时间</TableCell>
                                <TableCell align="right">操作</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {tasks.map((t) => (
                                <TableRow key={t.id}>
                                    <TableCell>{t.content}</TableCell>
                                    <TableCell>{cronToLabel(t.cron_expression)}</TableCell>
                                    <TableCell>{t.status}</TableCell>
                                    <TableCell align="center">{t.execution_count}</TableCell>
                                    <TableCell>{t.created_at}</TableCell>
                                    <TableCell align="right">
                                        <Tooltip title={t.status === '启用' ? '点击关闭' : '点击启用'}>
                                            <Switch checked={t.status === '启用'} size="small"
                                                    onChange={() => handleToggleStatus(t)}/>
                                        </Tooltip>
                                        <Tooltip title="详情">
                                            <IconButton size="small" onClick={() => openDetailDialog(t)}>
                                                <VisibilityIcon fontSize="small"/>
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="编辑">
                                            <IconButton size="small" onClick={() => openEditDialog(t)}>
                                                <EditIcon fontSize="small"/>
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="删除">
                                            <IconButton size="small" onClick={() => handleDelete(t.id)}>
                                                <DeleteIcon fontSize="small"/>
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {tasks.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{py: 6, color: 'text.disabled'}}>
                                        暂无任务，点击上方按钮添加
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* 新增弹窗 */}
                <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>新增任务</DialogTitle>
                    <DialogContent sx={{display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important'}}>
                        <TextField
                            label="任务内容"
                            value={form.content}
                            onChange={(e) => setForm((f) => ({...f, content: e.target.value}))}
                            error={!!errors.content}
                            helperText={errors.content}
                            fullWidth
                            multiline
                            rows={3}
                            placeholder="例如：每天提醒我健身并记录当天情况"
                        />
                        <CronBuilder value={form.cron_expression}
                                     onChange={(v) => setForm((f) => ({...f, cron_expression: v}))}/>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setAddDialogOpen(false)}>取消</Button>
                        <Button variant="contained" onClick={handleAdd}>保存</Button>
                    </DialogActions>
                </Dialog>

                {/* 编辑弹窗 */}
                <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>编辑任务</DialogTitle>
                    <DialogContent sx={{display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important'}}>
                        <TextField
                            label="任务内容"
                            value={editForm.content}
                            onChange={(e) => setEditForm((f) => ({...f, content: e.target.value}))}
                            error={!!errors.content}
                            helperText={errors.content}
                            fullWidth
                            multiline
                            rows={3}
                        />
                        <CronBuilder value={editForm.cron_expression}
                                     onChange={(v) => setEditForm((f) => ({...f, cron_expression: v}))}/>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setEditDialogOpen(false)}>取消</Button>
                        <Button variant="contained" onClick={handleEdit}>保存</Button>
                    </DialogActions>
                </Dialog>

                {/* 详情弹窗 */}
                <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>任务详情</DialogTitle>
                    <DialogContent sx={{display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important'}}>
                        {detail && (
                            <>
                                <TextField label="任务内容" value={detail.content} fullWidth multiline rows={3}
                                           slotProps={{input: {readOnly: true}}}/>
                                <Box sx={{display: 'flex', gap: 2, alignItems: 'center'}}>
                                    <Typography variant="body2" sx={{fontFamily: 'monospace', color: 'text.secondary'}}>
                                        {detail.cron_expression}
                                    </Typography>
                                    <Typography variant="body1" color="primary">
                                        {cronToLabel(detail.cron_expression)}
                                    </Typography>
                                </Box>
                                <Box sx={{display: 'flex', gap: 3}}>
                                    <Box sx={{flex: 1}}>
                                        <Typography variant="body2" color="text.secondary">状态</Typography>
                                        <Typography variant="body1">{detail.status}</Typography>
                                    </Box>
                                    <Box sx={{flex: 1}}>
                                        <Typography variant="body2" color="text.secondary">已执行次数</Typography>
                                        <Typography variant="body1">{detail.execution_count}</Typography>
                                    </Box>
                                </Box>
                                <Box sx={{display: 'flex', gap: 3}}>
                                    <Box sx={{flex: 1}}>
                                        <Typography variant="body2" color="text.secondary">创建时间</Typography>
                                        <Typography variant="body1">{detail.created_at}</Typography>
                                    </Box>
                                    <Box sx={{flex: 1}}>
                                        <Typography variant="body2" color="text.secondary">更新时间</Typography>
                                        <Typography variant="body1">{detail.updated_at}</Typography>
                                    </Box>
                                </Box>
                            </>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDetailDialogOpen(false)}>关闭</Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </ThemeProvider>
    );
}
