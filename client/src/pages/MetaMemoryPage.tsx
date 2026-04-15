import * as React from 'react';
import {createTheme, ThemeProvider} from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import Divider from '@mui/material/Divider';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import {DateTimePicker} from '@mui/x-date-pickers/DateTimePicker';
import dayjs, {Dayjs} from 'dayjs';
import 'dayjs/locale/zh-cn';
import {zhCN} from '@mui/x-date-pickers/locales';

const nativeTheme = createTheme({
  palette: {
    mode: 'light',
  },
});

interface LlmModel {
  id: number;
  provider: string;
  model_identifier: string;
  api_key: string;
}

interface OptionItem {
  id: number;
  name: string;
}

export default function MetaMemoryPage() {
  const [models, setModels] = React.useState<LlmModel[]>([]);
  const [mbtiTypes, setMbtiTypes] = React.useState<OptionItem[]>([]);
  const [relationships, setRelationships] = React.useState<OptionItem[]>([]);
  const [imprint, setImprint] = React.useState('');
  const [selectedModel, setModelId] = React.useState('');
  const [personality, setPersonality] = React.useState('');
  const [birthDateTime, setBirthDateTime] = React.useState<Dayjs | null>(null);
  const [relationship, setRelationship] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [snack, setSnack] = React.useState<{ open: boolean; severity: 'success' | 'error'; message: string }>({
    open: false,
    severity: 'success',
    message: '',
  });

  React.useEffect(() => {
    fetch('http://localhost:3001/api/llm-models')
        .then((res) => res.json())
        .then((data) => setModels(data))
        .catch(() => {
        });
    fetch('http://localhost:3001/api/mbti-types')
        .then((res) => res.json())
        .then((data) => setMbtiTypes(data))
        .catch(() => {
        });
    fetch('http://localhost:3001/api/relationships')
        .then((res) => res.json())
        .then((data) => setRelationships(data))
        .catch(() => {
        });
    fetch('http://localhost:3001/api/meta-memory')
        .then((res) => res.json())
        .then((data) => {
          if (data && data.id) {
            setImprint(data.imprint ?? '');
            setModelId(data.model_id ? String(data.model_id) : '');
            setPersonality(data.personality ?? '');
            setBirthDateTime(data.birth_date_time ? dayjs(data.birth_date_time) : null);
            setRelationship(data.relationship ?? '');
          }
        })
        .catch(() => {
        });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      imprint,
      model_id: selectedModel ? Number(selectedModel) : null,
      personality,
      birth_date_time: birthDateTime ? birthDateTime.format('YYYY-MM-DD HH:mm:ss') : null,
      relationship,
    };
    try {
      const res = await fetch('http://localhost:3001/api/meta-memory', {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setSnack({open: true, severity: 'success', message: '保存成功'});
      } else {
        setSnack({open: true, severity: 'error', message: '保存失败'});
      }
    } catch {
      setSnack({open: true, severity: 'error', message: '网络错误'});
    } finally {
      setSaving(false);
    }
  };

  return (
      <ThemeProvider theme={nativeTheme}>
        <Stack spacing={3}>
          {/* Section Title */}
          <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <Typography variant="h4" sx={{fontWeight: 600}}>
              元记忆
            </Typography>
            <Button
                variant="contained"
                startIcon={<SaveRoundedIcon/>}
                onClick={handleSave}
                loading={saving}
            >
              保存
            </Button>
          </Box>

          {/* 1. 思想钢印 */}
          <Stack spacing={1}>
            <Typography variant="h6" sx={{fontWeight: 600}}>
              思想钢印
            </Typography>
            <Typography variant="body2" color="text.secondary">
              定义 Sunday 的核心系统提示词，这些指令将始终贯穿于每一次对话。
            </Typography>
            <TextField
                multiline
                minRows={4}
                maxRows={10}
                fullWidth
                value={imprint}
                onChange={(e) => setImprint(e.target.value)}
                placeholder="输入 Sunday 的核心指令..."
            />
          </Stack>

          <Divider/>

          {/* 2. 模型连接选择 */}
          <Stack spacing={1}>
            <Typography variant="h6" sx={{fontWeight: 600}}>
              模型连接
            </Typography>
            <Typography variant="body2" color="text.secondary">
              选择 Sunday 使用的 AI 模型。可在「设置 → 模型管理」中添加新模型。
            </Typography>
            <TextField
                select
                fullWidth
                label="选择模型"
                value={selectedModel}
                onChange={(e) => setModelId(e.target.value)}
            >
              <MenuItem value="">
                <em>未选择</em>
              </MenuItem>
              {models.map((model) => (
                  <MenuItem key={model.id} value={String(model.id)}>
                    {model.model_identifier}
                  </MenuItem>
              ))}
            </TextField>
          </Stack>

          <Divider/>

          {/* 3. Sunday 性格 */}
          <Stack spacing={1}>
            <Typography variant="h6" sx={{fontWeight: 600}}>
              Sunday 性格
            </Typography>
            <Typography variant="body2" color="text.secondary">
              选择 Sunday 的 MBTI 人格类型，这将影响它的沟通风格和思维方式。
            </Typography>
            <TextField
                select
                fullWidth
                label="MBTI 性格类型"
                value={personality}
                onChange={(e) => setPersonality(e.target.value)}
            >
              {mbtiTypes.map((type) => (
                  <MenuItem key={type.id} value={type.name}>
                    {type.name}
                  </MenuItem>
              ))}
            </TextField>
          </Stack>

          <Divider/>

          {/* 4. 出生日期 */}
          <Stack spacing={1}>
            <Typography variant="h6" sx={{fontWeight: 600}}>
              出生日期
            </Typography>
            <Typography variant="body2" color="text.secondary">
              设置 Sunday 的出生时间，精确到秒。
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="zh-cn"
                                  localeText={zhCN.components.MuiLocalizationProvider.defaultProps.localeText}>
              <DateTimePicker
                  label="出生日期时间"
                  value={birthDateTime}
                  onChange={(newValue) => setBirthDateTime(newValue)}
                  views={['year', 'month', 'day', 'hours', 'minutes', 'seconds']}
                  format="YYYY-MM-DD HH:mm:ss"
                  sx={{width: '100%'}}
              />
            </LocalizationProvider>
          </Stack>

          <Divider/>

          {/* 5. 与用户的关系 */}
          <Stack spacing={1}>
            <Typography variant="h6" sx={{fontWeight: 600}}>
              与用户的关系
            </Typography>
            <Typography variant="body2" color="text.secondary">
              定义 Sunday 与用户之间的关系角色。
            </Typography>
            <TextField
                select
                fullWidth
                label="关系角色"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
            >
              {relationships.map((rel) => (
                  <MenuItem key={rel.id} value={rel.name}>
                    {rel.name}
                  </MenuItem>
              ))}
            </TextField>
          </Stack>

          <Snackbar
              open={snack.open}
              autoHideDuration={3000}
              onClose={() => setSnack((s) => ({...s, open: false}))}
              anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
          >
            <Alert
                onClose={() => setSnack((s) => ({...s, open: false}))}
                severity={snack.severity}
                variant="filled"
            >
              {snack.message}
            </Alert>
          </Snackbar>
        </Stack>
      </ThemeProvider>
  );
}
