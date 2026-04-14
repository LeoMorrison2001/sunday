import {useLocation} from 'react-router-dom';
import {styled} from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Breadcrumbs, {breadcrumbsClasses} from '@mui/material/Breadcrumbs';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';

const StyledBreadcrumbs = styled(Breadcrumbs)(({ theme }) => ({
  margin: theme.spacing(1, 0),
  [`& .${breadcrumbsClasses.separator}`]: {
    color: (theme.vars || theme).palette.action.disabled,
    margin: 1,
  },
  [`& .${breadcrumbsClasses.ol}`]: {
    alignItems: 'center',
  },
}));

const breadcrumbMap: Record<string, string> = {
    '/chat': 'Chat',
    '/memory/meta': '元记忆',
    '/memory/conversation': '会话记忆',
    '/memory/working': '工作记忆',
    '/memory/task': '任务记忆',
    '/memory/long-term': '长期记忆',
    '/agent/service': '智能体服务',
    '/agent/task-log': '任务日志',
    '/mcp': 'MCP',
    '/skills': 'Skills',
    '/settings': '设置',
};

export default function NavbarBreadcrumbs() {
    const location = useLocation();
    const isMemory = location.pathname.startsWith('/memory');
    const isAgent = location.pathname.startsWith('/agent');
    const currentPage = breadcrumbMap[location.pathname] || 'Chat';

  return (
    <StyledBreadcrumbs
      aria-label="breadcrumb"
      separator={<NavigateNextRoundedIcon fontSize="small" />}
    >
        {isMemory && (
            <Typography variant="body1">记忆管理</Typography>
        )}
        {isAgent && (
            <Typography variant="body1">智能体管理</Typography>
        )}
      <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 600 }}>
          {currentPage}
      </Typography>
    </StyledBreadcrumbs>
  );
}
