import { useState, useCallback } from 'react';
import {
  ReactFlow,
  Edge,
  Node,
  NodeChange,
  applyNodeChanges,
  Connection,
  addEdge,
  applyEdgeChanges,
  EdgeChange,
  Controls,
  Background,
  MiniMap,
  Panel,
} from '@xyflow/react';

import { getNodesAndEdges } from './utils';

const { nodes: initialNodes, edges: initialEdges } = getNodesAndEdges(25, 25);

const StressFlow = () => {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const onConnect = useCallback((connection: Connection) => {
    setEdges((eds) => addEdge(connection, eds));
  }, []);
  const updatePos = () => {
    setNodes((nds) => {
      return nds.map((n) => {
        return {
          ...n,
          position: {
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          },
        };
      });
    });
  };

  const updateElements = () => {
    const grid = Math.ceil(Math.random() * 10);
    const initialElements = getNodesAndEdges(grid, grid);
    setNodes(initialElements.nodes);
    setEdges(initialElements.edges);
  };

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((ns) => applyNodeChanges(changes, ns));
  }, []);

  const onEdgeChange = useCallback((changes: EdgeChange[]) => {
    setEdges((es) => applyEdgeChanges(changes, es));
  }, []);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onConnect={onConnect}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgeChange}
      minZoom={0.2}
      fitView
    >
      <MiniMap />
      <Controls />
      <Background />

      <Panel position="top-right">
        <button onClick={updatePos}>change pos</button>
        <button onClick={updateElements}>update elements</button>
      </Panel>
    </ReactFlow>
  );
};

export default StressFlow;
