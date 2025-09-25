import { useReducer, useCallback } from 'react';

export type Brief = {
  duration_min: number;
  audience: string[];
  genres: string[];
  eras: string[];
  energy_curve: string[];
  familiarity_bias: "low"|"medium"|"high";
  explicit_ok: boolean;
  must_include: string[];
  must_exclude: string[];
};

export type SetItem = {
  pos: number;
  id: string;
  title: string;
  artist: string;
  bpm: number | null;
  keyCamelot: string | null;
  duration_sec: number;
  source: "deezer" | "getsongbpm" | "analysis_preview";
  transition: string;
};

export type Phase = "idle"|"clarify"|"brewing"|"ready"|"error";

export type LabState = {
  phase: Phase;
  brief: Brief;
  missing: string[];
  progress: number;
  items: SetItem[];
  selectedRowId?: string;
  messages: Array<{
    id: string;
    type: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
};

type CopilotAction =
  | { type: 'SET_PLAN'; payload: { brief: Brief; missing: string[] } }
  | { type: 'UPDATE_BRIEF'; payload: { brief: Partial<Brief>; missing?: string[] } }
  | { type: 'SET_PROGRESS'; payload: number }
  | { type: 'SET_ITEMS'; payload: SetItem[] }
  | { type: 'SET_PHASE'; payload: Phase }
  | { type: 'SELECT_ROW'; payload: string | undefined }
  | { type: 'PATCH_ROW'; payload: { pos: number; item: Partial<SetItem> } }
  | { type: 'ADD_MESSAGE'; payload: { type: 'user' | 'assistant'; content: string } }
  | { type: 'SET_ERROR'; payload: string };

const initialState: LabState = {
  phase: 'idle',
  brief: {
    duration_min: 60,
    audience: [],
    genres: [],
    eras: [],
    energy_curve: [],
    familiarity_bias: 'medium',
    explicit_ok: false,
    must_include: [],
    must_exclude: []
  },
  missing: [],
  progress: 0,
  items: [],
  selectedRowId: undefined,
  messages: []
};

function copilotReducer(state: LabState, action: CopilotAction): LabState {
  switch (action.type) {
    case 'SET_PLAN':
      return {
        ...state,
        brief: action.payload.brief,
        missing: action.payload.missing,
        phase: action.payload.missing.length === 0 ? 'brewing' : 'clarify'
      };
    
    case 'UPDATE_BRIEF':
      return {
        ...state,
        brief: { ...state.brief, ...action.payload.brief },
        missing: action.payload.missing ?? state.missing
      };
    
    case 'SET_PROGRESS':
      return { ...state, progress: action.payload };
    
    case 'SET_ITEMS':
      return { ...state, items: action.payload, phase: 'ready' };
    
    case 'SET_PHASE':
      return { ...state, phase: action.payload };
    
    case 'SELECT_ROW':
      return { ...state, selectedRowId: action.payload };
    
    case 'PATCH_ROW':
      return {
        ...state,
        items: state.items.map(item => 
          item.pos === action.payload.pos 
            ? { ...item, ...action.payload.item }
            : item
        )
      };
    
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [
          ...state.messages,
          {
            id: Date.now().toString(),
            type: action.payload.type,
            content: action.payload.content,
            timestamp: new Date()
          }
        ]
      };
    
    case 'SET_ERROR':
      return { ...state, phase: 'error' };
    
    default:
      return state;
  }
}

export function useCopilot() {
  const [state, dispatch] = useReducer(copilotReducer, initialState);

  const submitPrompt = useCallback(async (text: string) => {
    dispatch({ type: 'ADD_MESSAGE', payload: { type: 'user', content: text } });
    
    try {
      const response = await fetch('/api/ai/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text })
      });
      
      if (!response.ok) throw new Error('Failed to plan');
      
      const data = await response.json();
      
      dispatch({ type: 'SET_PLAN', payload: data });
      
      dispatch({ 
        type: 'ADD_MESSAGE', 
        payload: { 
          type: 'assistant', 
          content: `I understand you want a ${data.brief.duration_min}-minute set. Let me ask a few questions to create the perfect flow.` 
        } 
      });
      
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Unknown error' });
    }
  }, []);

  const answerClarifier = useCallback(async (field: string, value: any) => {
    try {
      const response = await fetch('/api/ai/clarify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          brief: state.brief, 
          answer: { [field]: value } 
        })
      });
      
      if (!response.ok) throw new Error('Failed to clarify');
      
      const data = await response.json();
      
      dispatch({ type: 'UPDATE_BRIEF', payload: data });
      
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Unknown error' });
    }
  }, [state.brief]);

  const brew = useCallback(async () => {
    dispatch({ type: 'SET_PHASE', payload: 'brewing' });
    dispatch({ type: 'SET_PROGRESS', payload: 0 });
    
    try {
      // Simulate progress stages
      const stages = [
        { progress: 25, label: 'Gathering songs' },
        { progress: 50, label: 'Enriching BPM/Key' },
        { progress: 75, label: 'Sequencing' },
        { progress: 100, label: 'Done' }
      ];
      
      for (const stage of stages) {
        dispatch({ type: 'SET_PROGRESS', payload: stage.progress });
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      const response = await fetch('/api/ai/setlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief: state.brief })
      });
      
      if (!response.ok) throw new Error('Failed to generate setlist');
      
      const data = await response.json();
      dispatch({ type: 'SET_ITEMS', payload: data.items });
      
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Unknown error' });
    }
  }, [state.brief]);

  const selectRow = useCallback((rowId: string | undefined) => {
    dispatch({ type: 'SELECT_ROW', payload: rowId });
  }, []);

  const patchRow = useCallback((pos: number, item: Partial<SetItem>) => {
    dispatch({ type: 'PATCH_ROW', payload: { pos, item } });
  }, []);

  const moveRow = useCallback((pos: number, direction: 'up' | 'down') => {
    const items = [...state.items];
    const index = items.findIndex(item => item.pos === pos);
    
    if (index === -1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= items.length) return;
    
    [items[index], items[newIndex]] = [items[newIndex], items[index]];
    
    // Update positions
    items.forEach((item, i) => {
      item.pos = i + 1;
    });
    
    dispatch({ type: 'SET_ITEMS', payload: items });
  }, [state.items]);

  const lockRow = useCallback((pos: number) => {
    // For now, just mark as locked visually
    patchRow(pos, { transition: '🔒 Locked' });
  }, [patchRow]);

  return {
    state,
    actions: {
      submitPrompt,
      answerClarifier,
      brew,
      selectRow,
      patchRow,
      moveRow,
      lockRow
    }
  };
}
