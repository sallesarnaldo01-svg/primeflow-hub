import { useCallback, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Background,
  Controls,
  MiniMap,
  Connection,
  useNodesState,
  useEdgesState,
  MarkerType,
  NodeTypes,
} from 'react-flow-renderer';
import { NodeConfigPanel } from './NodeConfigPanel';
import { 
  Zap, MessageSquare, Clock, GitBranch, Mail, 
  Tag, Database, Settings 
} from 'lucide-react';

interface WorkflowCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (nodes: Node[]) => void;
  onEdgesChange: (edges: Edge[]) => void;
  workflowName?: string;
}

// Componente customizado para nós
const CustomNode = ({ data }: { data: any }) => {
  const getNodeIcon = () => {
    const type = data.type || 'action';
    const actionType = data.config?.actionType;

    switch (type) {
      case 'trigger':
        return <Zap className="h-4 w-4 text-blue-600" />;
      case 'delay':
        return <Clock className="h-4 w-4 text-purple-600" />;
      case 'condition':
        return <GitBranch className="h-4 w-4 text-yellow-600" />;
      case 'action':
        switch (actionType) {
          case 'send_email':
            return <Mail className="h-4 w-4 text-orange-600" />;
          case 'add_tag':
            return <Tag className="h-4 w-4 text-pink-600" />;
          case 'update_field':
            return <Database className="h-4 w-4 text-cyan-600" />;
          default:
            return <MessageSquare className="h-4 w-4 text-green-600" />;
        }
      default:
        return <Settings className="h-4 w-4 text-gray-600" />;
    }
  };

  const getNodeColor = () => {
    const type = data.type || 'action';
    switch (type) {
      case 'trigger':
        return 'border-blue-500 bg-blue-50';
      case 'delay':
        return 'border-purple-500 bg-purple-50';
      case 'condition':
        return 'border-yellow-500 bg-yellow-50';
      case 'action':
        return 'border-green-500 bg-green-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  return (
    <div className={`px-4 py-3 shadow-lg rounded-lg border-2 ${getNodeColor()} min-w-[180px]`}>
      <div className="flex items-center gap-2">
        {getNodeIcon()}
        <div className="font-semibold text-sm">{data.label}</div>
      </div>
      {data.config?.message && (
        <div className="text-xs text-muted-foreground mt-1 truncate max-w-[160px]">
          {data.config.message}
        </div>
      )}
    </div>
  );
};

const nodeTypes: NodeTypes = {
  trigger: CustomNode,
  action: CustomNode,
  condition: CustomNode,
  delay: CustomNode,
};

const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  nodes: initialNodes,
  edges: initialEdges,
  onNodesChange,
  onEdgesChange,
  workflowName,
}) => {
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const onConnect = useCallback(
    (params: Connection | Edge) => {
      const newEdge = {
        ...params,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#6366f1', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#6366f1',
        },
      };
      setEdges((eds) => {
        const updatedEdges = addEdge(newEdge, eds);
        onEdgesChange(updatedEdges);
        return updatedEdges;
      });
    },
    [setEdges, onEdgesChange]
  );

  const handleNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const handleConfigSave = useCallback((nodeId: string, config: any) => {
    setNodes((nds) => {
      const updatedNodes = nds.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                label: config.label || node.data.label,
                config,
              },
            }
          : node
      );
      onNodesChange(updatedNodes);
      return updatedNodes;
    });
  }, [setNodes, onNodesChange]);

  // Sync nodes and edges with parent
  const handleNodesChange = useCallback(
    (changes: any) => {
      onNodesChangeInternal(changes);
      setNodes((nds) => {
        onNodesChange(nds);
        return nds;
      });
    },
    [onNodesChangeInternal, setNodes, onNodesChange]
  );

  const handleEdgesChange = useCallback(
    (changes: any) => {
      onEdgesChangeInternal(changes);
      setEdges((eds) => {
        onEdgesChange(eds);
        return eds;
      });
    },
    [onEdgesChangeInternal, setEdges, onEdgesChange]
  );

  return (
    <div className="flex h-[600px] gap-4">
      <div className="flex-1 border rounded-lg overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={onConnect}
          onNodeClick={handleNodeClick}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
          defaultEdgeOptions={{
            type: 'smoothstep',
            animated: true,
          }}
        >
          <Background color="#e5e7eb" gap={16} />
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              switch (node.type) {
                case 'trigger':
                  return '#3b82f6';
                case 'action':
                  return '#10b981';
                case 'condition':
                  return '#f59e0b';
                case 'delay':
                  return '#8b5cf6';
                default:
                  return '#6b7280';
              }
            }}
            maskColor="rgba(0, 0, 0, 0.1)"
          />
        </ReactFlow>
      </div>

      {selectedNode && (
        <div className="w-80 border rounded-lg overflow-hidden">
          <NodeConfigPanel
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
            onSave={handleConfigSave}
          />
        </div>
      )}
    </div>
  );
};

export default WorkflowCanvas;
