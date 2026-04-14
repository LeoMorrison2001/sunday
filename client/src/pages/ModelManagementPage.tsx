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

interface LlmModel {
    id: number;
    provider: string;
    model_identifier: string;
    api_key: string;
}

interface Provider {
    id: number;
    provider: string;
}

const emptyForm = {provider: '', model_identifier: '', api_key: ''};

export default function ModelManagementPage() {
    const [models, setModels] = useState<LlmModel[]>([]);
    const [providers, setProviders] = useState<Provider[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const fetchModels = useCallback(async () => {
        const res = await fetch(`${API}/llm-models`);
        setModels(await res.json());
    }, []);

    const fetchProviders = useCallback(async () => {
        const res = await fetch(`${API}/providers`);
        setProviders(await res.json());
    }, []);

    useEffect(() => {
        fetchModels();
        fetchProviders();
    }, [fetchModels, fetchProviders]);

    const openAddDialog = () => {
        setEditingId(null);
        setForm(emptyForm);
        setErrors({});
        setDialogOpen(true);
    };

    const openEditDialog = (model: LlmModel) => {
        setEditingId(model.id);
        setForm({
            provider: model.provider,
            model_identifier: model.model_identifier,
            api_key: model.api_key,
        });
        setErrors({});
        setDialogOpen(true);
    };

    const handleDelete = async (id: number) => {
        await fetch(`${API}/llm-models/${id}`, {method: 'DELETE'});
        fetchModels();
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!form.provider) newErrors.provider = '请选择厂商';
        if (!form.model_identifier) newErrors.model_identifier = '请输入模型标识';
        if (!form.api_key) newErrors.api_key = '请输入 API Key';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;
        if (editingId !== null) {
            await fetch(`${API}/llm-models/${editingId}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(form),
            });
        } else {
            const res = await fetch(`${API}/llm-models`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(form),
            });
            if (res.status === 409) {
                const data = await res.json();
                setErrors({model_identifier: data.error});
                return;
            }
        }
        setDialogOpen(false);
        fetchModels();
    };

    const maskApiKey = (key: string) => {
        if (key.length <= 8) return '****';
        return key.slice(0, 4) + '****' + key.slice(-4);
    };

    return (
        <ThemeProvider theme={nativeTheme}>
            <Box>
                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3}}>
                    <Typography variant="h4">模型管理</Typography>
                    <Button variant="contained" startIcon={<AddIcon/>} onClick={openAddDialog}>
                        新增模型
                    </Button>
                </Box>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>厂商标识</TableCell>
                                <TableCell>模型</TableCell>
                                <TableCell>ApiKey</TableCell>
                                <TableCell align="right">操作</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {models.map((model) => (
                                <TableRow key={model.id}>
                                    <TableCell>{model.provider}</TableCell>
                                    <TableCell>{model.model_identifier}</TableCell>
                                    <TableCell sx={{fontFamily: 'monospace', fontSize: '0.85rem'}}>
                                        {maskApiKey(model.api_key)}
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="编辑">
                                            <IconButton size="small" onClick={() => openEditDialog(model)}>
                                                <EditIcon fontSize="small"/>
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="删除">
                                            <IconButton size="small" onClick={() => handleDelete(model.id)}>
                                                <DeleteIcon fontSize="small"/>
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {models.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{py: 6, color: 'text.disabled'}}>
                                        暂无模型，点击上方按钮添加
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>{editingId !== null ? '编辑模型' : '新增模型'}</DialogTitle>
                    <DialogContent sx={{display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important'}}>
                        <TextField
                            select
                            label="厂商标识"
                            value={form.provider}
                            onChange={(e) => setForm((f) => ({...f, provider: e.target.value}))}
                            error={!!errors.provider}
                            helperText={errors.provider}
                            fullWidth
                        >
                            {providers.map((p) => (
                                <MenuItem key={p.id} value={p.provider}>
                                    {p.provider}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            label="模型标识"
                            value={form.model_identifier}
                            onChange={(e) => setForm((f) => ({...f, model_identifier: e.target.value}))}
                            error={!!errors.model_identifier}
                            helperText={errors.model_identifier}
                            fullWidth
                            placeholder="例如: gpt-4o"
                        />
                        <TextField
                            label="API Key"
                            value={form.api_key}
                            onChange={(e) => setForm((f) => ({...f, api_key: e.target.value}))}
                            error={!!errors.api_key}
                            helperText={errors.api_key}
                            fullWidth
                            type="password"
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
