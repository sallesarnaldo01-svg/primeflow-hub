import { useCallback, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  MiniMap,
} from 'react-flow-renderer';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface WorkflowCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (nodes: Node[]) => void;
  onEdgesChange: (edges: Edge[]) => void;
  workflowId?: string;
  workflowName?: string;
}

const nodeTypes = {
  trigger: ({ data }: any) => (
    <Card className="p-3 min-w-[150px] bg-blue-50 border-blue-200">
      <div className="font-semibold text-blue-900">{data.label}</div>
      <div className="text-xs text-blue-700">{data.type}</div>
    </Card>
  ),
  action: ({ data }: any) => (
    <Card className="p-3 min-w-[150px] bg-green-50 border-green-200">
      <div className="font-semibold text-green-900">{data.label}</div>
      <div className="text-xs text-green-700">{data.type}</div>
    </Card>
  ),
  condition: ({ data }: any) => (
    <Card className="p-3 min-w-[150px] bg-yellow-50 border-yellow-200">
      <div className="font-semibold text-yellow-900">{data.label}</div>
      <div className="text-xs text-yellow-700">IF/ELSE</div>
    </Card>
  ),
  delay: ({ data }: any) => (
    <Card className="p-3 min-w-[150px] bg-purple-50 border-purple-200">
      <div className="font-semibold text-purple-900">{data.label}</div>
      <div className="text-xs text-purple-700">Delay</div>
    </Card>
  ),
};

export default function WorkflowCanvas({
  nodes: initialNodes,
  edges: initialEdges,
  onNodesChange: handleNodesUpdate,
  onEdgesChange: handleEdgesUpdate,
  workflowId,
  workflowName = 'Novo Workflow',
}: WorkflowCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    if (workflowId) {
      loadWorkflow(workflowId);
    }
  }, [workflowId]);

  const loadWorkflow = async (id: string) => {
    try {
      // @ts-ignore - Supabase types not regenerated
      const { data: flowData, error: flowError } = await (supabase as any)
        .from('flows')
        .select('*')
        .eq('id', id)
        .single();

      if (flowError) throw flowError;

      // @ts-ignore - Supabase types not regenerated
      const { data: nodesData, error: nodesError } = await (supabase as any)
        .from('flow_nodes')
        .select('*')
        .eq('flow_id', id);

      if (nodesError) throw nodesError;

      // @ts-ignore - Supabase types not regenerated
      const { data: edgesData, error: edgesError } = await (supabase as any)
        .from('flow_edges')
        .select('*')
        .eq('flow_id', id);

      if (edgesError) throw edgesError;

      // Transformar dados do banco para formato ReactFlow
      const loadedNodes = (nodesData as any[]).map(n => ({
        id: n.node_id,
        type: n.type,
        position: { x: n.position_x, y: n.position_y },
        data: n.config
      }));

      const loadedEdges = (edgesData as any[]).map(e => ({
        id: e.id,
        source: e.source_node_id,
        target: e.target_node_id,
        label: e.condition
      }));

      setNodes(loadedNodes);
      setEdges(loadedEdges);
      toast.success('Workflow carregado');
    } catch (error: any) {
      toast.error('Erro ao carregar workflow');
      console.error(error);
    }
  };

  const saveWorkflow = async () => {
    try {
      let flowId = workflowId;

      if (!flowId) {
        // Criar novo flow
        // @ts-ignore - Supabase types not regenerated
        const { data: newFlow, error: flowError } = await (supabase as any)
          .from('flows')
          .insert({
            name: workflowName,
            trigger_type: 'new_message',
            active: true
          })
          .select()
          .single();

        if (flowError) throw flowError;
        flowId = (newFlow as any).id;
      }

      // Salvar nodes
      // @ts-ignore - Supabase types not regenerated
      const { error: nodesError } = await (supabase as any)
        .from('flow_nodes')
        .upsert(
          nodes.map(node => ({
            flow_id: flowId,
            node_id: node.id,
            type: node.type,
            position_x: node.position.x,
            position_y: node.position.y,
            config: node.data
          }))
        );

      if (nodesError) throw nodesError;

      // Salvar edges
      // @ts-ignore - Supabase types not regenerated
      const { error: edgesError } = await (supabase as any)
        .from('flow_edges')
        .upsert(
          edges.map(edge => ({
            flow_id: flowId,
            source_node_id: edge.source,
            target_node_id: edge.target,
            condition: edge.label as string | undefined
          }))
        );

      if (edgesError) throw edgesError;

      toast.success('Workflow salvo com sucesso');
    } catch (error: any) {
      toast.error('Erro ao salvar workflow');
      console.error(error);
    }
  };

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdges = addEdge(params, edges);
      setEdges(newEdges);
      handleEdgesUpdate(newEdges);
    },
    [edges, setEdges, handleEdgesUpdate]
  );

  const onNodeDragStop = useCallback(
    (_: any, node: Node) => {
      const updatedNodes = nodes.map((n) =>
        n.id === node.id ? { ...n, position: node.position } : n
      );
      setNodes(updatedNodes);
      handleNodesUpdate(updatedNodes);
    },
    [nodes, setNodes, handleNodesUpdate]
  );

  return (
    <div className="h-[700px] border rounded-lg bg-background relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        fitView
        className="bg-muted/5"
      >
        <Controls className="bg-background border shadow-sm" />
        <MiniMap 
          className="bg-background border shadow-sm" 
          nodeColor={(node) => {
            switch (node.type) {
              case 'trigger': return '#3b82f6';
              case 'action': return '#22c55e';
              case 'condition': return '#eab308';
              case 'delay': return '#a855f7';
              default: return '#64748b';
            }
          }}
        />
        <Background className="bg-muted/5" />
      </ReactFlow>
    </div>
  );
}
