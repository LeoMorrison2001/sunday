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

const API = 'http://localhost:3001/api';
const nativeTheme = createTheme();

interface LookupOption {
    id: number;
    name: string;
}

interface LongTermMemory {
    id: number;
    content: string;
    type: string;
    source_type: string;
    source_id: string | null;
    tags: string | null;
    importance: number;
    emotional_valence: number;
    access_count: number;
    last_accessed_at: string | null;
    context_snapshot: string | null;
    status: string;
    created_at: string;
    updated_at: string;
}

const emptyForm = {type: '', content: ''};

export default function LongTermMemoryPage() {
    const [memories, setMemories] = useState<LongTermMemory[]>([]);
    const [memoryTypes, setMemoryTypes] = useState<LookupOption[]>([]);
    const [sourceTypes, setSourceTypes] = useState<LookupOption[]>([]);
    const [memoryStatuses, setMemoryStatuses] = useState<LookupOption[]>([]);
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [detail, setDetail] = useState<LongTermMemory | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [editForm, setEditForm] = useState({content: '', type: ''});
    const [errors, setErrors] = useState<Record<string, string>>({});

    const fetchMemories = useCallback(async () => {
        const res = await fetch(`${API}/long-term-memories`);
        setMemories(await res.json());
    }, []);

    const fetchMemoryTypes = useCallback(async () => {
        const res = await fetch(`${API}/memory-types`);
        setMemoryTypes(await res.json());
    }, []);

    const fetchSourceTypes = useCallback(async () => {
        const res = await fetch(`${API}/source-types`);
        setSourceTypes(await res.json());
    }, []);

    const fetchMemoryStatuses = useCallback(async () => {
        const res = await fetch(`${API}/memory-statuses`);
        setMemoryStatuses(await res.json());
    }, []);

    useEffect(() => {
        fetchMemories();
        fetchMemoryTypes();
        fetchSourceTypes();
        fetchMemoryStatuses();
    }, [fetchMemories, fetchMemoryTypes, fetchSourceTypes, fetchMemoryStatuses]);

    const openAddDialog = () => {
        setForm(emptyForm);
        setErrors({});
        setAddDialogOpen(true);
    };

    const openEditDialog = (m: LongTermMemory) => {
        setEditingId(m.id);
        setEditForm({content: m.content, type: m.type});
        setErrors({});
        setEditDialogOpen(true);
    };

    const openDetailDialog = (m: LongTermMemory) => {
        setDetail(m);
        setDetailDialogOpen(true);
    };

    const validate = (data: { content: string; type: string }) => {
        const newErrors: Record<string, string> = {};
        if (!data.content) newErrors.content = '请输入记忆内容';
        if (!data.type) newErrors.type = '请选择记忆类型';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAdd = async () => {
        if (!validate(form)) return;
        await fetch(`${API}/long-term-memories`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(form),
        });
        setAddDialogOpen(false);
        fetchMemories();
    };

    const handleEdit = async () => {
        if (!validate(editForm)) return;
        await fetch(`${API}/long-term-memories/${editingId}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(editForm),
        });
        setEditDialogOpen(false);
        fetchMemories();
    };

    const handleDelete = async (id: number) => {
        await fetch(`${API}/long-term-memories/${id}`, {method: 'DELETE'});
        fetchMemories();
    };

    const valenceLabel = (v: number) => {
        if (v < -0.3) return `负面 (${v})`;
        if (v > 0.3) return `正面 (${v})`;
        return `中性 (${v})`;
    };

    return (
        <ThemeProvider theme={nativeTheme}>
            <Box>
                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3}}>
                    <Typography variant="h4">长期记忆</Typography>
                    <Button variant="contained" startIcon={<AddIcon/>} onClick={openAddDialog}>
                        新增记忆
                    </Button>
                </Box>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>记忆类型</TableCell>
                                <TableCell>来源</TableCell>
                                <TableCell>记忆状态</TableCell>
                                <TableCell align="center">重要性</TableCell>
                                <TableCell align="center">情感极性</TableCell>
                                <TableCell align="center">召回次数</TableCell>
                                <TableCell>创建时间</TableCell>
                                <TableCell align="right">操作</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {memories.map((m) => (
                                <TableRow key={m.id}>
                                    <TableCell>{m.type}</TableCell>
                                    <TableCell>{m.source_type}</TableCell>
                                    <TableCell>{m.status}</TableCell>
                                    <TableCell align="center">{m.importance}</TableCell>
                                    <TableCell align="center">{valenceLabel(m.emotional_valence)}</TableCell>
                                    <TableCell align="center">{m.access_count}</TableCell>
                                    <TableCell>{m.created_at}</TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="详情">
                                            <IconButton size="small" onClick={() => openDetailDialog(m)}>
                                                <VisibilityIcon fontSize="small"/>
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="编辑">
                                            <IconButton size="small" onClick={() => openEditDialog(m)}>
                                                <EditIcon fontSize="small"/>
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="删除">
                                            <IconButton size="small" onClick={() => handleDelete(m.id)}>
                                                <DeleteIcon fontSize="small"/>
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {memories.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{py: 6, color: 'text.disabled'}}>
                                        暂无记忆，点击上方按钮添加
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* 新增弹窗 */}
                <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>新增记忆</DialogTitle>
                    <DialogContent sx={{display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important'}}>
                        <TextField
                            select
                            label="记忆类型"
                            value={form.type}
                            onChange={(e) => setForm((f) => ({...f, type: e.target.value}))}
                            error={!!errors.type}
                            helperText={errors.type}
                            fullWidth
                        >
                            {memoryTypes.map((t) => (
                                <MenuItem key={t.id} value={t.name}>{t.name}</MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            label="记忆内容"
                            value={form.content}
                            onChange={(e) => setForm((f) => ({...f, content: e.target.value}))}
                            error={!!errors.content}
                            helperText={errors.content}
                            fullWidth
                            multiline
                            rows={4}
                            placeholder="需要记住的内容"
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setAddDialogOpen(false)}>取消</Button>
                        <Button variant="contained" onClick={handleAdd}>保存</Button>
                    </DialogActions>
                </Dialog>

                {/* 编辑弹窗 */}
                <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>编辑记忆</DialogTitle>
                    <DialogContent sx={{display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important'}}>
                        <TextField
                            select
                            label="记忆类型"
                            value={editForm.type}
                            onChange={(e) => setEditForm((f) => ({...f, type: e.target.value}))}
                            error={!!errors.type}
                            helperText={errors.type}
                            fullWidth
                        >
                            {memoryTypes.map((t) => (
                                <MenuItem key={t.id} value={t.name}>{t.name}</MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            label="记忆内容"
                            value={editForm.content}
                            onChange={(e) => setEditForm((f) => ({...f, content: e.target.value}))}
                            error={!!errors.content}
                            helperText={errors.content}
                            fullWidth
                            multiline
                            rows={4}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setEditDialogOpen(false)}>取消</Button>
                        <Button variant="contained" onClick={handleEdit}>保存</Button>
                    </DialogActions>
                </Dialog>

                {/* 详情弹窗 */}
                <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>记忆详情</DialogTitle>
                    <DialogContent sx={{display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important'}}>
                        {detail && (
                            <>
                                <TextField label="记忆内容" value={detail.content} fullWidth multiline rows={3}
                                           slotProps={{input: {readOnly: true}}}/>
                                <TextField label="记忆类型" value={detail.type} fullWidth
                                           slotProps={{input: {readOnly: true}}}/>
                                <TextField label="来源类型" value={detail.source_type} fullWidth
                                           slotProps={{input: {readOnly: true}}}/>
                                <TextField label="标签" value={detail.tags ?? '-'} fullWidth
                                           slotProps={{input: {readOnly: true}}}/>
                                <Box sx={{display: 'flex', gap: 3}}>
                                    <Box sx={{flex: 1}}>
                                        <Typography variant="body2" color="text.secondary">重要性</Typography>
                                        <Typography variant="body1">{detail.importance}</Typography>
                                    </Box>
                                    <Box sx={{flex: 1}}>
                                        <Typography variant="body2" color="text.secondary">情感极性</Typography>
                                        <Typography
                                            variant="body1">{valenceLabel(detail.emotional_valence)}</Typography>
                                    </Box>
                                </Box>
                                <Box sx={{display: 'flex', gap: 3}}>
                                    <Box sx={{flex: 1}}>
                                        <Typography variant="body2" color="text.secondary">状态</Typography>
                                        <Typography variant="body1">{detail.status}</Typography>
                                    </Box>
                                    <Box sx={{flex: 1}}>
                                        <Typography variant="body2" color="text.secondary">召回次数</Typography>
                                        <Typography variant="body1">{detail.access_count}</Typography>
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
