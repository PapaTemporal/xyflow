import {
  infiniteExtent,
  ConnectionMode,
  updateNodes,
  getNodesBounds,
  getViewportForBounds,
  Transform,
} from '@xyflow/system';

import type { Edge, Node, ReactFlowStore } from '../types';

const getInitialState = ({
  nodes = [],
  edges = [],
  width,
  height,
  fitView,
}: {
  nodes?: Node[];
  edges?: Edge[];
  width?: number;
  height?: number;
  fitView?: boolean;
} = {}): ReactFlowStore => {
  const nodeLookup = new Map<string, Node>();
  const nextNodes = updateNodes(nodes, nodeLookup, { nodeOrigin: [0, 0], elevateNodesOnSelect: false });

  let transform: Transform = [0, 0, 1];

  if (fitView && width && height) {
    const nodesWithDimensions = nextNodes.filter((node) => node.width && node.height);
    const bounds = getNodesBounds(nodesWithDimensions, [0, 0]);
    const { x, y, zoom } = getViewportForBounds(bounds, width, height, 0.5, 2, 0.1);
    transform = [x, y, zoom];
  }

  return {
    rfId: '1',
    width: 0,
    height: 0,
    transform,
    nodes: nextNodes,
    nodeLookup,
    edges: edges,
    onNodesChange: null,
    onEdgesChange: null,
    hasDefaultNodes: false,
    hasDefaultEdges: false,
    panZoom: null,
    minZoom: 0.5,
    maxZoom: 2,
    translateExtent: infiniteExtent,
    nodeExtent: infiniteExtent,
    nodesSelectionActive: false,
    userSelectionActive: false,
    userSelectionRect: null,
    connectionPosition: { x: 0, y: 0 },
    connectionStatus: null,
    connectionMode: ConnectionMode.Strict,
    domNode: null,
    paneDragging: false,
    noPanClassName: 'nopan',
    nodeOrigin: [0, 0],
    nodeDragThreshold: 0,

    snapGrid: [15, 15],
    snapToGrid: false,

    nodesDraggable: true,
    nodesConnectable: true,
    nodesFocusable: true,
    edgesFocusable: true,
    edgesUpdatable: true,
    elementsSelectable: true,
    elevateNodesOnSelect: true,
    fitViewOnInit: false,
    fitViewDone: false,
    fitViewOnInitOptions: undefined,
    selectNodesOnDrag: true,

    multiSelectionActive: false,

    connectionStartHandle: null,
    connectionEndHandle: null,
    connectionClickStartHandle: null,
    connectOnClick: true,

    ariaLiveMessage: '',
    autoPanOnConnect: true,
    autoPanOnNodeDrag: true,
    connectionRadius: 20,
    onError: () => null,
    isValidConnection: undefined,
    onSelectionChangeHandlers: [],

    lib: 'react',
  };
};

export default getInitialState;
