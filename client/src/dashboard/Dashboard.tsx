import {alpha} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import AppNavbar from './components/AppNavbar';
import Header from './components/Header';
import SideMenu from './components/SideMenu';
import AppTheme from '../shared-theme/AppTheme';
import {
    chartsCustomizations,
    dataGridCustomizations,
    datePickersCustomizations,
    treeViewCustomizations,
} from './theme/customizations';
import {Navigate, Route, Routes} from 'react-router-dom';
import ChatPage from '../pages/ChatPage';
import MetaMemoryPage from '../pages/MetaMemoryPage';
import ConversationMemoryPage from '../pages/ConversationMemoryPage';
import WorkingMemoryPage from '../pages/WorkingMemoryPage';
import TaskMemoryPage from '../pages/TaskMemoryPage';
import LongTermMemoryPage from '../pages/LongTermMemoryPage';
import AgentServicePage from '../pages/AgentServicePage';
import TaskLogPage from '../pages/TaskLogPage';
import MCPPage from '../pages/McpPage';
import SkillsPage from '../pages/SkillsPage';
import SettingsPage from '../pages/SettingsPage';

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

export default function Dashboard(props: { disableCustomTheme?: boolean }) {
  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: 'flex' }}>
        <SideMenu />
        <AppNavbar />
        {/* Main content */}
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
              : alpha(theme.palette.background.default, 1),
            overflow: 'auto',
          })}
        >
          <Stack
            spacing={2}
            sx={{
              alignItems: 'center',
              mx: 3,
              pb: 5,
              mt: { xs: 8, md: 0 },
            }}
          >
            <Header />
              <Box sx={{width: '100%', maxWidth: {sm: '100%', md: '1700px'}}}>
                  <Routes>
                      <Route path="/" element={<Navigate to="/chat" replace/>}/>
                      <Route path="/chat" element={<ChatPage/>}/>
                      <Route path="/memory/meta" element={<MetaMemoryPage/>}/>
                      <Route path="/memory/conversation" element={<ConversationMemoryPage/>}/>
                      <Route path="/memory/working" element={<WorkingMemoryPage/>}/>
                      <Route path="/memory/task" element={<TaskMemoryPage/>}/>
                      <Route path="/memory/long-term" element={<LongTermMemoryPage/>}/>
                      <Route path="/agent/service" element={<AgentServicePage/>}/>
                      <Route path="/agent/task-log" element={<TaskLogPage/>}/>
                      <Route path="/mcp" element={<MCPPage/>}/>
                      <Route path="/skills" element={<SkillsPage/>}/>
                      <Route path="/settings" element={<SettingsPage/>}/>
                  </Routes>
              </Box>
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}
