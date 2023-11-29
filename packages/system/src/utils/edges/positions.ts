import { EdgePosition } from '../../types/edges';
import { ConnectionMode, OnError } from '../../types/general';
import { NodeBase, NodeHandle, NodeHandleBounds } from '../../types/nodes';
import { Position, Rect, XYPosition } from '../../types/utils';
import { errorMessages, internalsSymbol } from '../../constants';
import { HandleElement } from '../../types';

export type GetEdgePositionParams = {
  id: string;
  sourceNode: NodeBase;
  sourceHandle: string | null;
  targetNode: NodeBase;
  targetHandle: string | null;
  connectionMode: ConnectionMode;
  onError?: OnError;
};

export function getEdgePosition(params: GetEdgePositionParams): EdgePosition | null {
  const [sourceNodeRect, sourceHandleBounds, isSourceValid] = getHandleDataByNode(params.sourceNode);
  const [targetNodeRect, targetHandleBounds, isTargetValid] = getHandleDataByNode(params.targetNode);

  if (!isSourceValid || !isTargetValid) {
    return null;
  }

  // when connection type is loose we can define all handles as sources and connect source -> source
  const targetNodeHandles =
    params.connectionMode === ConnectionMode.Strict
      ? targetHandleBounds!.target
      : (targetHandleBounds!.target ?? []).concat(targetHandleBounds!.source ?? []);
  const sourceHandle = getHandle(sourceHandleBounds!.source!, params.sourceHandle);
  const targetHandle = getHandle(targetNodeHandles!, params.targetHandle);
  const sourcePosition = sourceHandle?.position || Position.Bottom;
  const targetPosition = targetHandle?.position || Position.Top;

  if (!sourceHandle || !targetHandle) {
    params.onError?.(
      '008',
      errorMessages['error008'](!sourceHandle ? 'source' : 'target', {
        id: params.id,
        sourceHandle: params.sourceHandle,
        targetHandle: params.targetHandle,
      })
    );

    return null;
  }

  const { x: sourceX, y: sourceY } = getHandlePosition(sourcePosition, sourceNodeRect, sourceHandle);
  const { x: targetX, y: targetY } = getHandlePosition(targetPosition, targetNodeRect, targetHandle);

  return {
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  };
}

function toHandleBounds(handles?: NodeHandle[]) {
  if (!handles) {
    return null;
  }

  return handles.reduce<NodeHandleBounds>(
    (res, item) => {
      item.width = item.width || 1;
      item.height = item.height || 1;

      if (item.type === 'source') {
        res.source?.push(item as HandleElement);
      }

      if (item.type === 'target') {
        res.target?.push(item as HandleElement);
      }

      return res;
    },
    {
      source: [],
      target: [],
    }
  );
}

function getHandleDataByNode(node?: NodeBase): [Rect, NodeHandleBounds | null, boolean] {
  const handleBounds = node?.[internalsSymbol]?.handleBounds || toHandleBounds(node?.handles) || null;
  const nodeWidth = node?.computed?.width || node?.width;
  const nodeHeight = node?.computed?.height || node?.height;

  const isValid =
    handleBounds &&
    nodeWidth &&
    nodeHeight &&
    typeof node?.computed?.positionAbsolute?.x !== 'undefined' &&
    typeof node?.computed?.positionAbsolute?.y !== 'undefined';

  return [
    {
      x: node?.computed?.positionAbsolute?.x || 0,
      y: node?.computed?.positionAbsolute?.y || 0,
      width: nodeWidth || 0,
      height: nodeHeight || 0,
    },
    handleBounds,
    !!isValid,
  ];
}

function getHandlePosition(position: Position, nodeRect: Rect, handle: HandleElement | null = null): XYPosition {
  const x = (handle?.x || 0) + nodeRect.x;
  const y = (handle?.y || 0) + nodeRect.y;
  const width = handle?.width || nodeRect.width;
  const height = handle?.height || nodeRect.height;

  switch (position) {
    case Position.Top:
      return {
        x: x + width / 2,
        y,
      };
    case Position.Right:
      return {
        x: x + width,
        y: y + height / 2,
      };
    case Position.Bottom:
      return {
        x: x + width / 2,
        y: y + height,
      };
    case Position.Left:
      return {
        x,
        y: y + height / 2,
      };
  }
}

function getHandle(bounds: HandleElement[], handleId?: string | null): HandleElement | null {
  if (!bounds) {
    return null;
  }

  if (bounds.length === 1 || !handleId) {
    return bounds[0];
  } else if (handleId) {
    return bounds.find((d) => d.id === handleId) || null;
  }

  return null;
}
