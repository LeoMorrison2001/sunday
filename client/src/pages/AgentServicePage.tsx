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
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const API = 'http://localhost:3001/api';
const nativeTheme = createTheme();

interface Agent {
    id: number;
    agent_key: string;
    name: string;
    type: string;
    description: string;
    instance_count: number;
}

interface AgentTypeOption {
    id: number;
    name: string;
}

const emptyForm = {agent_key: '', name: '', type: '', description: ''};

export default function AgentServicePage() {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [agentTypes, setAgentTypes] = useState<AgentTypeOption[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const fetchAgents = useCallback(async () => {
        const res = await fetch(`${API}/agents`);
        setAgents(await res.json());
    }, []);

    const fetchAgentTypes = useCallback(async () => {
        const res = await fetch(`${API}/agent-types`);
        setAgentTypes(await res.json());
    }, []);

    useEffect(() => {
        fetchAgents();
        fetchAgentTypes();
    }, [fetchAgents, fetchAgentTypes]);

    const openAddDialog = () => {
        setEditingId(null);
        setForm(emptyForm);
        setErrors({});
        setDialogOpen(true);
    };

    const openEditDialog = (agent: Agent) => {
        setEditingId(agent.id);
        setForm({
            agent_key: agent.agent_key,
            name: agent.name,
            type: agent.type,
            description: agent.description,
        });
        setErrors({});
        setDialogOpen(true);
    };

    const handleDelete = async (id: number) => {
        await fetch(`${API}/agents/${id}`, {method: 'DELETE'});
        fetchAgents();
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!form.agent_key) {
            newErrors.agent_key = '请输入智能体KEY';
        } else if (!/^[a-z_][a-z0-9_]*$/.test(form.agent_key)) {
            newErrors.agent_key = '仅允许小写字母、数字、下划线，且不能以数字开头';
        }
        if (!form.name) newErrors.name = '请输入名称';
        if (!form.type) newErrors.type = '请选择类型';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;
        if (editingId !== null) {
            await fetch(`${API}/agents/${editingId}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(form),
            });
        } else {
            const res = await fetch(`${API}/agents`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(form),
            });
            if (res.status === 409) {
                const data = await res.json();
                setErrors({agent_key: data.error});
                return;
            }
        }
        setDialogOpen(false);
        fetchAgents();
    };

    return (
        <ThemeProvider theme={nativeTheme}>
            <Box>
                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3}}>
                    <Typography variant="h4">智能体服务</Typography>
                    <Button variant="contained" startIcon={<AddIcon/>} onClick={openAddDialog}>
                        新增智能体
                    </Button>
                </Box>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>智能体KEY</TableCell>
                                <TableCell>名称</TableCell>
                                <TableCell>类型</TableCell>
                                <TableCell>描述</TableCell>
                                <TableCell align="center">实例数量</TableCell>
                                <TableCell align="right">操作</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {agents.map((agent) => (
                                <TableRow key={agent.id}>
                                    <TableCell sx={{fontFamily: 'monospace', fontSize: '0.85rem'}}>
                                        {agent.agent_key}
                                    </TableCell>
                                    <TableCell>{agent.name}</TableCell>
                                    <TableCell>{agent.type}</TableCell>
                                    <TableCell>{agent.description}</TableCell>
                                    <TableCell align="center">{agent.instance_count}</TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="编辑">
                                            <IconButton size="small" onClick={() => openEditDialog(agent)}>
                                                <EditIcon fontSize="small"/>
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="删除">
                                            <IconButton size="small" onClick={() => handleDelete(agent.id)}>
                                                <DeleteIcon fontSize="small"/>
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {agents.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{py: 6, color: 'text.disabled'}}>
                                        暂无智能体，点击上方按钮添加
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>{editingId !== null ? '编辑智能体' : '新增智能体'}</DialogTitle>
                    <DialogContent sx={{display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important'}}>
                        <TextField
                            label="智能体KEY"
                            value={form.agent_key}
                            onChange={(e) => setForm((f) => ({...f, agent_key: e.target.value}))}
                            onBlur={validate}
                            error={!!errors.agent_key}
                            helperText={errors.agent_key}
                            fullWidth
                            placeholder="例如: agent_chat_01"
                        />
                        <TextField
                            label="名称"
                            value={form.name}
                            onChange={(e) => setForm((f) => ({...f, name: e.target.value}))}
                            onBlur={validate}
                            error={!!errors.name}
                            helperText={errors.name}
                            fullWidth
                            placeholder="例如: 通用对话助手"
                        />
                        <TextField
                            select
                            label="类型"
                            value={form.type}
                            onChange={(e) => setForm((f) => ({...f, type: e.target.value}))}
                            onBlur={validate}
                            error={!!errors.type}
                            helperText={errors.type}
                            fullWidth
                        >
                            {agentTypes.map((t) => (
                                <MenuItem key={t.id} value={t.name}>{t.name}</MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            label="描述"
                            value={form.description}
                            onChange={(e) => setForm((f) => ({...f, description: e.target.value}))}
                            fullWidth
                            multiline
                            rows={2}
                            placeholder="智能体功能描述"
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDialogOpen(false)}>取消</Button>
                        <Button variant="contained" onClick={handleSave}>
                            保存
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </ThemeProvider>
    );
}
