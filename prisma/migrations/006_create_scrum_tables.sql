-- ============================================
-- MIGRATION 006: Scrum/Agile Tables (Optional)
-- ============================================

-- 1. SCRUM_TEAMS TABLE
CREATE TABLE public.scrum_teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TEAM_MEMBERS TABLE
CREATE TABLE public.team_members (
    team_id UUID NOT NULL REFERENCES public.scrum_teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member', -- 'member', 'scrum_master', 'product_owner'
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (team_id, user_id)
);

-- 3. SPRINTS TABLE
CREATE TABLE public.sprints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES public.scrum_teams(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    goal TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT DEFAULT 'planning', -- 'planning', 'active', 'completed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. BACKLOG_ITEMS TABLE
CREATE TABLE public.backlog_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES public.scrum_teams(id) ON DELETE CASCADE,
    sprint_id UUID REFERENCES public.sprints(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    item_type TEXT DEFAULT 'story', -- 'story', 'bug', 'task', 'epic'
    priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    status TEXT DEFAULT 'todo', -- 'todo', 'in_progress', 'review', 'done'
    story_points INTEGER,
    estimated_hours DECIMAL(5,2),
    actual_hours DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CEREMONIES TABLE
CREATE TABLE public.ceremonies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES public.scrum_teams(id) ON DELETE CASCADE,
    sprint_id UUID REFERENCES public.sprints(id) ON DELETE SET NULL,
    ceremony_type TEXT NOT NULL, -- 'planning', 'daily', 'review', 'retrospective'
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. VIDEO_CALLS TABLE
CREATE TABLE public.video_calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    room_name TEXT NOT NULL UNIQUE,
    host_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    title TEXT,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'scheduled', -- 'scheduled', 'active', 'ended'
    participants JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.scrum_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backlog_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ceremonies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_calls ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES - TENANT ISOLATION
-- ============================================

-- SCRUM_TEAMS
CREATE POLICY "Users can view own tenant teams"
ON public.scrum_teams FOR SELECT
TO authenticated
USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Admins can manage teams"
ON public.scrum_teams FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

-- TEAM_MEMBERS
CREATE POLICY "Users can view team members"
ON public.team_members FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.scrum_teams st
    WHERE st.id = team_members.team_id
    AND st.tenant_id = public.get_user_tenant_id(auth.uid())
  )
);

-- SPRINTS
CREATE POLICY "Users can view sprints"
ON public.sprints FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.scrum_teams st
    WHERE st.id = sprints.team_id
    AND st.tenant_id = public.get_user_tenant_id(auth.uid())
  )
);

-- BACKLOG_ITEMS
CREATE POLICY "Users can view backlog items"
ON public.backlog_items FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.scrum_teams st
    WHERE st.id = backlog_items.team_id
    AND st.tenant_id = public.get_user_tenant_id(auth.uid())
  )
);

CREATE POLICY "Team members can update items"
ON public.backlog_items FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.team_id = backlog_items.team_id
    AND tm.user_id = auth.uid()
  )
);

-- VIDEO_CALLS
CREATE POLICY "Users can view own tenant video calls"
ON public.video_calls FOR SELECT
TO authenticated
USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can create video calls"
ON public.video_calls FOR INSERT
TO authenticated
WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

-- ============================================
-- TRIGGERS: Update updated_at
-- ============================================

CREATE TRIGGER update_scrum_teams_updated_at
BEFORE UPDATE ON public.scrum_teams
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sprints_updated_at
BEFORE UPDATE ON public.sprints
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_backlog_items_updated_at
BEFORE UPDATE ON public.backlog_items
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- INDEXES for performance
-- ============================================

CREATE INDEX idx_scrum_teams_tenant_id ON public.scrum_teams(tenant_id);
CREATE INDEX idx_sprints_team_id ON public.sprints(team_id);
CREATE INDEX idx_backlog_items_team_id ON public.backlog_items(team_id);
CREATE INDEX idx_backlog_items_sprint_id ON public.backlog_items(sprint_id);
CREATE INDEX idx_ceremonies_team_id ON public.ceremonies(team_id);
CREATE INDEX idx_video_calls_tenant_id ON public.video_calls(tenant_id);
