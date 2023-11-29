/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Node, Edge, EdgeChange, NodeChange } from '../types';

export function handleParentExpand(res: any[], updateItem: any) {
  const parent = res.find((e) => e.id === updateItem.parentNode);

  if (parent) {
    if (!parent.computed) {
      parent.computed = {};
    }
    const extendWidth = updateItem.position.x + updateItem.computed.width - parent.computed.width;
    const extendHeight = updateItem.position.y + updateItem.computed.height - parent.computed.height;

    if (extendWidth > 0 || extendHeight > 0 || updateItem.position.x < 0 || updateItem.position.y < 0) {
      parent.style = { ...parent.style } || {};

      parent.style.width = parent.style.width ?? parent.computed.width;
      parent.style.height = parent.style.height ?? parent.computed.height;

      if (extendWidth > 0) {
        parent.style.width += extendWidth;
      }

      if (extendHeight > 0) {
        parent.style.height += extendHeight;
      }

      if (updateItem.position.x < 0) {
        const xDiff = Math.abs(updateItem.position.x);
        parent.position.x = parent.position.x - xDiff;
        parent.style.width += xDiff;
        updateItem.position.x = 0;
      }

      if (updateItem.position.y < 0) {
        const yDiff = Math.abs(updateItem.position.y);
        parent.position.y = parent.position.y - yDiff;
        parent.style.height += yDiff;
        updateItem.position.y = 0;
      }

      parent.computed.width = parent.style.width;
      parent.computed.height = parent.style.height;
    }
  }
}

// This function applies changes to nodes or edges that are triggered by React Flow internally.
// When you drag a node for example, React Flow will send a position change update.
// This function then applies the changes and returns the updated elements.
function applyChanges(changes: any[], elements: any[]): any[] {
  // we need this hack to handle the setNodes and setEdges function of the useReactFlow hook for controlled flows
  if (changes.some((c) => c.type === 'reset')) {
    return changes.filter((c) => c.type === 'reset').map((c) => c.item);
  }

  let remainingChanges = changes;
  const initElements: any[] = changes.filter((c) => c.type === 'add').map((c) => c.item);

  return elements.reduce((res: any[], item: any) => {
    const nextChanges: any[] = [];
    const _remainingChanges: any[] = [];

    remainingChanges.forEach((c) => {
      if (c.id === item.id) {
        nextChanges.push(c);
      } else {
        _remainingChanges.push(c);
      }
    });
    remainingChanges = _remainingChanges;

    if (nextChanges.length === 0) {
      res.push(item);
      return res;
    }

    const updateItem = { ...item };

    for (const currentChange of nextChanges) {
      if (currentChange) {
        switch (currentChange.type) {
          case 'select': {
            updateItem.selected = currentChange.selected;
            break;
          }
          case 'position': {
            if (typeof currentChange.position !== 'undefined') {
              updateItem.position = currentChange.position;
            }

            if (typeof currentChange.positionAbsolute !== 'undefined') {
              if (!updateItem.computed) {
                updateItem.computed = {};
              }
              updateItem.computed.positionAbsolute = currentChange.positionAbsolute;
            }

            if (typeof currentChange.dragging !== 'undefined') {
              updateItem.dragging = currentChange.dragging;
            }

            if (updateItem.expandParent) {
              handleParentExpand(res, updateItem);
            }
            break;
          }
          case 'dimensions': {
            if (typeof currentChange.dimensions !== 'undefined') {
              if (!updateItem.computed) {
                updateItem.computed = {};
              }
              updateItem.computed.width = currentChange.dimensions.width;
              updateItem.computed.height = currentChange.dimensions.height;
            }

            if (typeof currentChange.updateStyle !== 'undefined') {
              updateItem.style = { ...(updateItem.style || {}), ...currentChange.dimensions };
            }

            if (typeof currentChange.resizing === 'boolean') {
              updateItem.resizing = currentChange.resizing;
            }

            if (updateItem.expandParent) {
              handleParentExpand(res, updateItem);
            }
            break;
          }
          case 'remove': {
            return res;
          }
        }
      }
    }

    res.push(updateItem);
    return res;
  }, initElements);
}

export function applyNodeChanges<NodeData = any>(changes: NodeChange[], nodes: Node<NodeData>[]): Node<NodeData>[] {
  return applyChanges(changes, nodes) as Node<NodeData>[];
}

export function applyEdgeChanges<EdgeData = any>(changes: EdgeChange[], edges: Edge<EdgeData>[]): Edge<EdgeData>[] {
  return applyChanges(changes, edges) as Edge<EdgeData>[];
}

export const createSelectionChange = (id: string, selected: boolean) => ({
  id,
  type: 'select',
  selected,
});

export function getSelectionChanges(items: any[], selectedIds: string[]) {
  return items.reduce((res, item) => {
    const willBeSelected = selectedIds.includes(item.id);

    if (!item.selected && willBeSelected) {
      item.selected = true;
      res.push(createSelectionChange(item.id, true));
    } else if (item.selected && !willBeSelected) {
      item.selected = false;
      res.push(createSelectionChange(item.id, false));
    }

    return res;
  }, []);
}
