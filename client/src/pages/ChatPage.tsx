import {useChat} from '@ai-sdk/react';
import {useEffect, useRef, useState} from 'react';
import {DefaultChatTransport} from 'ai';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';

export default function ChatPage() {
    const {messages, sendMessage, status} = useChat({
        transport: new DefaultChatTransport({api: 'http://localhost:3001/api/chat'}),
    });

    const [input, setInput] = useState('');
    const [reasoningExpanded, setReasoningExpanded] = useState<Record<string, boolean>>({});
    const scrollRef = useRef<HTMLDivElement>(null);
    const isLoading = status === 'submitted' || status === 'streaming';

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;
        sendMessage({text: input});
        setInput('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: 'calc(100vh - 64px)',
                mx: 'auto',
                maxWidth: 800,
                width: '100%',
            }}
        >
            {/* Messages */}
            <Box ref={scrollRef} sx={{flexGrow: 1, overflowY: 'auto', px: 2, py: 3}}>
                {messages.length === 0 && (
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        opacity: 0.5
                    }}>
                        <SmartToyRoundedIcon sx={{fontSize: 48, mb: 1}}/>
                        <Typography variant="h6">Sunday Agent</Typography>
                        <Typography variant="body2">发送一条消息开始对话</Typography>
                    </Box>
                )}

                {messages.map((message) => (
                    <Box
                        key={message.id}
                        sx={{
                            display: 'flex',
                            gap: 1.5,
                            mb: 3,
                            flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
                        }}
                    >
                        <Avatar
                            sx={{
                                width: 32,
                                height: 32,
                                bgcolor: message.role === 'user' ? 'primary.main' : 'grey.300',
                                flexShrink: 0,
                                mt: 0.5,
                            }}
                        >
                            {message.role === 'user'
                                ? <PersonRoundedIcon sx={{fontSize: 18}}/>
                                : <SmartToyRoundedIcon sx={{fontSize: 18, color: 'grey.700'}}/>}
                        </Avatar>

                        <Box sx={{maxWidth: '85%', minWidth: 0}}>
                            {/* Reasoning (collapsible) */}
                            {message.parts
                                .filter((part): part is {
                                    type: 'reasoning';
                                    text: string
                                } => part.type === 'reasoning')
                                .map((part, i) => (
                                    <Box key={`r-${i}`}>
                                        <Box
                                            onClick={() => setReasoningExpanded(prev => ({
                                                ...prev,
                                                [message.id]: !prev[message.id]
                                            }))}
                                            sx={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: 0.5,
                                                cursor: 'pointer',
                                                color: 'text.secondary',
                                                fontSize: 12,
                                                mb: 0.5,
                                                '&:hover': {opacity: 0.8},
                                            }}
                                        >
                                            {reasoningExpanded[message.id] ?
                                                <ExpandLessRoundedIcon sx={{fontSize: 16}}/> :
                                                <ExpandMoreRoundedIcon sx={{fontSize: 16}}/>}
                                            思考过程
                                        </Box>
                                        {reasoningExpanded[message.id] && (
                                            <Box sx={{
                                                fontSize: 13,
                                                color: 'text.secondary',
                                                whiteSpace: 'pre-wrap',
                                                bgcolor: 'action.hover',
                                                borderRadius: 2,
                                                p: 1.5,
                                                mb: 1,
                                                lineHeight: 1.6
                                            }}>
                                                {part.text}
                                            </Box>
                                        )}
                                    </Box>
                                ))}

                            {/* Text content */}
                            {message.parts
                                .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
                                .map((part, i) => (
                                    <Box
                                        key={`t-${i}`}
                                        sx={{
                                            whiteSpace: 'pre-wrap',
                                            wordBreak: 'break-word',
                                            lineHeight: 1.7,
                                            fontSize: 15,
                                            bgcolor: message.role === 'user' ? 'primary.main' : 'action.hover',
                                            color: message.role === 'user' ? 'primary.contrastText' : 'text.primary',
                                            px: 2,
                                            py: 1.5,
                                            borderRadius: message.role === 'user'
                                                ? '20px 20px 4px 20px'
                                                : '20px 20px 20px 4px',
                                        }}
                                    >
                                        {part.text}
                                        {isLoading && message.role === 'assistant' && i === message.parts.filter(p => p.type === 'text').length - 1 && part.text === '' && (
                                            <CircularProgress size={14} sx={{ml: 1, verticalAlign: 'middle'}}/>
                                        )}
                                    </Box>
                                ))}
                        </Box>
                    </Box>
                ))}

                {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                    <Box sx={{display: 'flex', gap: 1.5, mb: 3}}>
                        <Avatar sx={{width: 32, height: 32, bgcolor: 'grey.300', flexShrink: 0}}>
                            <SmartToyRoundedIcon sx={{fontSize: 18, color: 'grey.700'}}/>
                        </Avatar>
                        <Box sx={{px: 2, py: 1.5, bgcolor: 'action.hover', borderRadius: '20px 20px 20px 4px'}}>
                            <CircularProgress size={16}/>
                        </Box>
                    </Box>
                )}
            </Box>

            {/* Input */}
            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: 1,
                    px: 2,
                    py: 2,
                    borderTop: 1,
                    borderColor: 'divider',
                    bgcolor: 'background.default',
                }}
            >
                <TextField
                    fullWidth
                    multiline
                    minRows={1}
                    maxRows={4}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="输入消息... (Enter 发送, Shift+Enter 换行)"
                    disabled={isLoading}
                    variant="outlined"
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            fontSize: 15,
                        },
                    }}
                />
                <IconButton
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': {bgcolor: 'primary.dark'},
                        '&:disabled': {bgcolor: 'action.disabledBackground'},
                        borderRadius: 3,
                        p: 1.2,
                        flexShrink: 0,
                    }}
                >
                    <SendRoundedIcon sx={{fontSize: 20}}/>
                </IconButton>
            </Box>
        </Box>
    );
}
