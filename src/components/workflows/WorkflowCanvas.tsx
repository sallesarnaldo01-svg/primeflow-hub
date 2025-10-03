import { useCallback } from 'react';
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

interface WorkflowCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (nodes: Node[]) => void;
  onEdgesChange: (edges: Edge[]) => void;
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
}: WorkflowCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

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
    <div className="h-[600px] border rounded-lg bg-background">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background />
      </ReactFlow>
    </div>
  );
}
