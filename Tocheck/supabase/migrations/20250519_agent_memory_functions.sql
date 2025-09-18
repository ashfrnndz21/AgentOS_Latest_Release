
-- Function to check if a table exists
CREATE OR REPLACE FUNCTION public.check_table_exists(table_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  table_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public'
    AND table_name = $1
  ) INTO table_exists;
  
  RETURN table_exists;
END;
$$;

-- Function to get agent memory
CREATE OR REPLACE FUNCTION public.get_agent_memory(p_agent_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  memory_record jsonb;
BEGIN
  IF NOT public.check_table_exists('agent_memory') THEN
    RETURN NULL;
  END IF;

  SELECT jsonb_build_object(
    'agent_id', agent_id,
    'chat_history', chat_history,
    'memory_type', memory_type,
    'updated_at', updated_at
  )
  INTO memory_record
  FROM public.agent_memory
  WHERE agent_id = p_agent_id;
  
  RETURN memory_record;
END;
$$;

-- Function to save agent memory
CREATE OR REPLACE FUNCTION public.save_agent_memory(
  p_agent_id text,
  p_chat_history jsonb,
  p_memory_type text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  record_exists boolean;
BEGIN
  IF NOT public.check_table_exists('agent_memory') THEN
    RETURN false;
  END IF;

  -- Check if a record exists for this agent
  SELECT EXISTS (
    SELECT 1 FROM public.agent_memory WHERE agent_id = p_agent_id
  ) INTO record_exists;
  
  IF record_exists THEN
    -- Update existing record
    UPDATE public.agent_memory
    SET chat_history = p_chat_history,
        memory_type = p_memory_type,
        updated_at = now()
    WHERE agent_id = p_agent_id;
  ELSE
    -- Insert new record
    INSERT INTO public.agent_memory (agent_id, chat_history, memory_type)
    VALUES (p_agent_id, p_chat_history, p_memory_type);
  END IF;
  
  RETURN true;
END;
$$;

-- Function to delete agent memory
CREATE OR REPLACE FUNCTION public.delete_agent_memory(p_agent_id text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT public.check_table_exists('agent_memory') THEN
    RETURN false;
  END IF;

  DELETE FROM public.agent_memory
  WHERE agent_id = p_agent_id;
  
  RETURN true;
END;
$$;

-- Function to list all agent memories
CREATE OR REPLACE FUNCTION public.list_agent_memories()
RETURNS TABLE (
  agent_id text,
  memory_type text,
  message_count integer,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT public.check_table_exists('agent_memory') THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT 
    am.agent_id,
    am.memory_type,
    jsonb_array_length(am.chat_history) as message_count,
    am.updated_at
  FROM public.agent_memory am;
END;
$$;
