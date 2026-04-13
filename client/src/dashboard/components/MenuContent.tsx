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

const menuItems = [
  { text: 'Chat', icon: <ChatRoundedIcon /> },
  { text: '记忆管理', icon: <PsychologyRoundedIcon /> },
  { text: '智能体管理', icon: <SmartToyRoundedIcon /> },
  { text: 'MCP', icon: <CableRoundedIcon /> },
  { text: 'Skills', icon: <AutoAwesomeRoundedIcon /> },
  { text: '设置', icon: <SettingsRoundedIcon /> },
];

export default function MenuContent() {
  return (
    <Stack sx={{ flexGrow: 1, p: 1 }}>
      <List dense>
        {menuItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            <ListItemButton selected={index === 0}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}
