import * as React from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import Collapse from '@mui/material/Collapse';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded';
import CableRoundedIcon from '@mui/icons-material/CableRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';

const agentSubItems = [
    {text: '智能体服务', path: '/agent/service'},
    {text: '任务日志', path: '/agent/task-log'},
];

const memorySubItems = [
    {text: '元记忆', path: '/memory/meta'},
    {text: '会话记忆', path: '/memory/conversation'},
    {text: '工作记忆', path: '/memory/working'},
    {text: '任务记忆', path: '/memory/task'},
    {text: '长期记忆', path: '/memory/long-term'},
];

const settingsSubItems = [
    {text: '模型管理', path: '/settings/model-management'},
];

export default function MenuContent() {
    const location = useLocation();
    const navigate = useNavigate();
    const [memoryOpen, setMemoryOpen] = React.useState(
        location.pathname.startsWith('/memory'),
    );
    const [agentOpen, setAgentOpen] = React.useState(
        location.pathname.startsWith('/agent'),
    );
    const [settingsOpen, setSettingsOpen] = React.useState(
        location.pathname.startsWith('/settings'),
    );

    const isActive = (path: string) => location.pathname === path;

  return (
    <Stack sx={{ flexGrow: 1, p: 1 }}>
      <List dense>
          {/* Chat */}
          <ListItem disablePadding sx={{display: 'block'}}>
              <ListItemButton selected={isActive('/chat')} onClick={() => navigate('/chat')}>
                  <ListItemIcon><ChatRoundedIcon/></ListItemIcon>
                  <ListItemText primary="Chat"/>
              </ListItemButton>
          </ListItem>

          {/* 记忆管理 - expandable */}
          <ListItem disablePadding sx={{display: 'block'}}>
              <ListItemButton
                  selected={location.pathname.startsWith('/memory')}
                  onClick={() => setMemoryOpen((prev) => !prev)}
              >
                  <ListItemIcon><PsychologyRoundedIcon/></ListItemIcon>
                  <ListItemText primary="记忆管理"/>
                  {memoryOpen ? <ExpandLessRoundedIcon/> : <ExpandMoreRoundedIcon/>}
              </ListItemButton>
              <Collapse in={memoryOpen} timeout="auto" unmountOnExit>
                  <List dense sx={{pl: 2}}>
                      {memorySubItems.map((item) => (
                          <ListItem key={item.path} disablePadding sx={{display: 'block'}}>
                              <ListItemButton
                                  selected={isActive(item.path)}
                                  onClick={() => navigate(item.path)}
                              >
                                  <ListItemText primary={item.text}/>
                              </ListItemButton>
                          </ListItem>
                      ))}
                  </List>
              </Collapse>
          </ListItem>

          {/* 智能体管理 - expandable */}
          <ListItem disablePadding sx={{display: 'block'}}>
              <ListItemButton
                  selected={location.pathname.startsWith('/agent')}
                  onClick={() => setAgentOpen((prev) => !prev)}
              >
                  <ListItemIcon><SmartToyRoundedIcon/></ListItemIcon>
                  <ListItemText primary="智能体管理"/>
                  {agentOpen ? <ExpandLessRoundedIcon/> : <ExpandMoreRoundedIcon/>}
              </ListItemButton>
              <Collapse in={agentOpen} timeout="auto" unmountOnExit>
                  <List dense sx={{pl: 2}}>
                      {agentSubItems.map((item) => (
                          <ListItem key={item.path} disablePadding sx={{display: 'block'}}>
                              <ListItemButton
                                  selected={isActive(item.path)}
                                  onClick={() => navigate(item.path)}
                              >
                                  <ListItemText primary={item.text}/>
                              </ListItemButton>
                          </ListItem>
                      ))}
                  </List>
              </Collapse>
          </ListItem>

          {/* MCP */}
          <ListItem disablePadding sx={{display: 'block'}}>
              <ListItemButton selected={isActive('/mcp')} onClick={() => navigate('/mcp')}>
                  <ListItemIcon><CableRoundedIcon/></ListItemIcon>
                  <ListItemText primary="MCP"/>
              </ListItemButton>
          </ListItem>

          {/* Skills */}
          <ListItem disablePadding sx={{display: 'block'}}>
              <ListItemButton selected={isActive('/skills')} onClick={() => navigate('/skills')}>
                  <ListItemIcon><AutoAwesomeRoundedIcon/></ListItemIcon>
                  <ListItemText primary="Skills"/>
              </ListItemButton>
          </ListItem>

          {/* 设置 - expandable */}
          <ListItem disablePadding sx={{display: 'block'}}>
              <ListItemButton
                  selected={location.pathname.startsWith('/settings')}
                  onClick={() => setSettingsOpen((prev) => !prev)}
              >
                  <ListItemIcon><SettingsRoundedIcon/></ListItemIcon>
                  <ListItemText primary="设置"/>
                  {settingsOpen ? <ExpandLessRoundedIcon/> : <ExpandMoreRoundedIcon/>}
              </ListItemButton>
              <Collapse in={settingsOpen} timeout="auto" unmountOnExit>
                  <List dense sx={{pl: 2}}>
                      {settingsSubItems.map((item) => (
                          <ListItem key={item.path} disablePadding sx={{display: 'block'}}>
                              <ListItemButton
                                  selected={isActive(item.path)}
                                  onClick={() => navigate(item.path)}
                              >
                                  <ListItemText primary={item.text}/>
                              </ListItemButton>
                          </ListItem>
                      ))}
                  </List>
              </Collapse>
          </ListItem>
      </List>
    </Stack>
  );
}
