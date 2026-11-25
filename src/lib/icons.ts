import {
  ArrowRight,
  Check,
  Circle,
  CloudOff,
  Menu,
  MessageCircle,
  MousePointer2,
  PenTool,
  Plus,
  RefreshCw,
  RotateCcw,
  Share2,
  Smartphone,
  Sparkles,
  Square,
  Star,
  Type,
  X,
  createElement,
} from 'lucide';

export const icons = {
  arrowRight: ArrowRight,
  check: Check,
  circle: Circle,
  cloudOff: CloudOff,
  menu: Menu,
  message: MessageCircle,
  pointer: MousePointer2,
  pen: PenTool,
  plus: Plus,
  refresh: RefreshCw,
  reset: RotateCcw,
  share: Share2,
  phone: Smartphone,
  sparkles: Sparkles,
  square: Square,
  star: Star,
  type: Type,
  close: X,
};

type IconNode = Parameters<typeof createElement>[0];

export function iconHtml(node: IconNode, size = 20): string {
  const svg = createElement(node, {
    width: String(size),
    height: String(size),
    'stroke-width': '2.25',
  });
  svg.setAttribute('aria-hidden', 'true');
  return svg.outerHTML;
}
