<script lang="ts">
  import { Position, type NodeProps } from '@xyflow/system';

  import { Handle } from '$lib/components/Handle';

  interface $$Props extends NodeProps<{ label: string }> {}

  export let data: $$Props['data'] = { label: 'Node' };
  export let targetPosition: $$Props['targetPosition'] = Position.Top;
  export let sourcePosition: $$Props['sourcePosition'] = Position.Bottom;

  // unused props - we need to list them here in order to prevent warnings
  export let id: $$Props['id'] = '';
  export let width: $$Props['width'] = undefined;
  export let height: $$Props['height'] = undefined;
  export let selected: $$Props['selected'] = undefined;
  export let type: $$Props['type'] = undefined;
  export let zIndex: $$Props['zIndex'] = undefined;
  export let dragging: $$Props['dragging'] = false;
  export let dragHandle: $$Props['dragHandle'] = undefined;
  export let positionAbsolute: $$Props['positionAbsolute'] = {
    x: 0,
    y: 0
  };
  export let isConnectable: $$Props['isConnectable'] = undefined;

  // @todo: there must be a better way to do this
  id;
  width;
  height;
  selected;
  type;
  zIndex;
  dragging;
  dragHandle;
  positionAbsolute;
  isConnectable;
</script>

<Handle type="target" position={targetPosition} on:connectstart on:connect on:connectend />
{data?.label}
<Handle type="source" position={sourcePosition} on:connectstart on:connect on:connectend />
