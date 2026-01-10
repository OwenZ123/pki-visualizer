import { useCallback, useRef, useEffect, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { pkiNodes, categoryColors } from '../data/pkiNodes';
import { pkiLinks } from '../data/pkiLinks';
import { flowColors } from '../data/beginnerFlows';

// Layout configurations for different flow types
const flowLayouts = {
  'cert-issuance': 'horizontal',
  'trust-chain': 'vertical',
  'revocation': 'branching',
  'key-pair': 'horizontal',
  'mtls': 'parallel',
  'renewal': 'horizontal',
  'format-conversion': 'horizontal'
};

function getNodePositions(flow, width, height) {
  const layout = flowLayouts[flow.id] || 'horizontal';
  const nodes = flow.nodes;
  const centerX = width / 2;
  const centerY = height / 2;

  switch (layout) {
    case 'vertical':
      // Top to bottom hierarchy
      return nodes.map((node, i) => ({
        fx: centerX,
        fy: centerY - 120 + (i * 80)
      }));

    case 'branching':
      // CA at top, branches below
      if (nodes.length === 4) {
        return [
          { fx: centerX, fy: centerY - 80 },        // CA
          { fx: centerX - 100, fy: centerY + 20 },  // CRL
          { fx: centerX + 100, fy: centerY + 20 },  // OCSP
          { fx: centerX, fy: centerY + 120 }        // Cert
        ];
      }
      return nodes.map((node, i) => ({
        fx: centerX - 150 + (i * 100),
        fy: centerY
      }));

    case 'parallel':
      // Two parallel rows for mTLS
      if (nodes.length >= 4) {
        return nodes.map((node, i) => ({
          fx: centerX - 100 + ((i % 2) * 200),
          fy: centerY - 60 + (Math.floor(i / 2) * 120)
        }));
      }
      return nodes.map((node, i) => ({
        fx: centerX - 150 + (i * 100),
        fy: centerY
      }));

    case 'horizontal':
    default:
      // Left to right
      const spacing = Math.min(130, (width - 200) / (nodes.length - 1 || 1));
      const startX = centerX - ((nodes.length - 1) * spacing) / 2;
      return nodes.map((node, i) => ({
        fx: startX + (i * spacing),
        fy: centerY
      }));
  }
}

export default function PKIGraph({
  onNodeClick,
  selectedNode,
  width,
  height,
  beginnerMode = false,
  selectedFlow = null,
  currentStep = -1,
  darkMode = false
}) {
  const graphRef = useRef();

  // Build graph data based on mode
  const graphData = useMemo(() => {
    if (beginnerMode && selectedFlow) {
      const flowColor = flowColors[selectedFlow.id] || '#3498db';
      const positions = getNodePositions(selectedFlow, width, height);

      return {
        nodes: selectedFlow.nodes.map((node, index) => {
          const fullNode = pkiNodes.find(n => n.id === node.fullId);
          return {
            ...node,
            ...fullNode,
            id: node.id,
            originalId: node.fullId,
            label: node.label,
            color: flowColor,
            stepIndex: index,
            ...positions[index]
          };
        }),
        links: selectedFlow.links.map(link => ({
          ...link,
          color: flowColor
        }))
      };
    }

    return {
      nodes: pkiNodes.map(node => ({
        ...node,
        color: categoryColors[node.category]
      })),
      links: pkiLinks.map(link => ({
        ...link,
        color: darkMode ? '#666' : '#999'
      }))
    };
  }, [beginnerMode, selectedFlow, width, height, darkMode]);

  useEffect(() => {
    if (graphRef.current) {
      if (beginnerMode) {
        graphRef.current.d3Force('charge').strength(-100);
        graphRef.current.d3Force('link').distance(100);
        setTimeout(() => {
          graphRef.current.centerAt(width / 2, height / 2, 500);
          graphRef.current.zoom(1.2, 500);
        }, 100);
      } else {
        graphRef.current.d3Force('charge').strength(-400);
        graphRef.current.d3Force('link').distance(120);
      }
    }
  }, [beginnerMode, width, height, selectedFlow]);

  const handleNodeClick = useCallback((node) => {
    onNodeClick(node);
    if (graphRef.current) {
      graphRef.current.centerAt(node.x, node.y, 500);
      graphRef.current.zoom(beginnerMode ? 1.2 : 1.5, 500);
    }
  }, [onNodeClick, beginnerMode]);

  const nodeCanvasObject = useCallback((node, ctx, globalScale) => {
    const label = node.label;
    const isSelected = selectedNode?.id === node.id;
    const isCurrentStep = currentStep >= 0 && node.stepIndex === currentStep;
    const isPastStep = currentStep >= 0 && node.stepIndex < currentStep;
    const isFutureStep = currentStep >= 0 && node.stepIndex > currentStep;

    if (beginnerMode) {
      let nodeRadius = 40;
      if (isSelected || isCurrentStep) nodeRadius = 48;

      // Pulsing animation for current step
      if (isCurrentStep) {
        const pulse = Math.sin(Date.now() / 200) * 3;
        nodeRadius += pulse;
      }

      // Draw glow for current step
      if (isCurrentStep) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeRadius + 10, 0, 2 * Math.PI);
        ctx.fillStyle = `${node.color}44`;
        ctx.fill();
      }

      // Draw node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI);

      // Dim future steps during autoplay
      if (isFutureStep) {
        ctx.fillStyle = `${node.color}66`;
      } else if (isPastStep) {
        ctx.fillStyle = `${node.color}aa`;
      } else {
        ctx.fillStyle = node.color;
      }
      ctx.fill();

      // Border
      ctx.strokeStyle = isSelected || isCurrentStep ? '#fff' : 'rgba(255,255,255,0.5)';
      ctx.lineWidth = (isSelected || isCurrentStep ? 4 : 2) / globalScale;
      ctx.stroke();

      // Checkmark for completed steps
      if (isPastStep) {
        const checkSize = 12 / globalScale;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3 / globalScale;
        ctx.beginPath();
        ctx.moveTo(node.x - checkSize/2, node.y);
        ctx.lineTo(node.x - checkSize/6, node.y + checkSize/3);
        ctx.lineTo(node.x + checkSize/2, node.y - checkSize/3);
        ctx.stroke();
      }

      // Draw label
      const fontSize = 13 / globalScale;
      ctx.font = `bold ${fontSize}px Sans-Serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = isFutureStep ? 'rgba(255,255,255,0.5)' : '#fff';

      const dotIndex = label.indexOf('. ');
      if (dotIndex > 0) {
        const stepNum = label.substring(0, dotIndex + 1);
        const stepText = label.substring(dotIndex + 2);
        ctx.fillText(stepNum, node.x, node.y - fontSize * 0.7);
        ctx.fillText(stepText, node.x, node.y + fontSize * 0.7);
      } else {
        ctx.fillText(label, node.x, node.y);
      }
    } else {
      // Full mode
      const fontSize = 14 / globalScale;
      ctx.font = `${fontSize}px Sans-Serif`;
      const nodeRadius = isSelected ? 12 : 10;

      ctx.beginPath();
      ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI);
      ctx.fillStyle = node.color;
      ctx.fill();

      if (isSelected) {
        ctx.strokeStyle = darkMode ? '#fff' : '#fff';
        ctx.lineWidth = 3 / globalScale;
        ctx.stroke();
      }

      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = darkMode ? '#eee' : '#333';
      ctx.fillText(label, node.x, node.y + nodeRadius + 2);
    }
  }, [selectedNode, beginnerMode, currentStep, darkMode]);

  const linkCanvasObject = useCallback((link, ctx, globalScale) => {
    const start = link.source;
    const end = link.target;

    if (typeof start !== 'object' || typeof end !== 'object') return;

    const nodeRadius = beginnerMode ? 40 : 12;
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist === 0) return;

    const angle = Math.atan2(dy, dx);

    const startX = start.x + nodeRadius * Math.cos(angle);
    const startY = start.y + nodeRadius * Math.sin(angle);
    const endX = end.x - nodeRadius * Math.cos(angle);
    const endY = end.y - nodeRadius * Math.sin(angle);

    // Check if this link is part of current step animation
    const startNode = graphData.nodes.find(n => n.id === (typeof start === 'object' ? start.id : start));
    const endNode = graphData.nodes.find(n => n.id === (typeof end === 'object' ? end.id : end));
    const isActiveLink = currentStep >= 0 && startNode && endNode &&
      startNode.stepIndex < currentStep && endNode.stepIndex <= currentStep;

    if (beginnerMode) {
      const lineWidth = (isActiveLink ? 5 : 4) / globalScale;

      // Draw line
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = isActiveLink ? link.color : `${link.color}88`;
      ctx.lineWidth = lineWidth;
      ctx.stroke();

      // Draw arrow
      const arrowLength = 15 / globalScale;
      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(
        endX - arrowLength * Math.cos(angle - Math.PI / 6),
        endY - arrowLength * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        endX - arrowLength * Math.cos(angle + Math.PI / 6),
        endY - arrowLength * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fillStyle = isActiveLink ? link.color : `${link.color}88`;
      ctx.fill();

      // Draw label
      const midX = (startX + endX) / 2;
      const midY = (startY + endY) / 2 - 15 / globalScale;
      const fontSize = 12 / globalScale;
      ctx.font = `bold ${fontSize}px Sans-Serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const labelWidth = ctx.measureText(link.label).width + 8;
      ctx.fillStyle = darkMode ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)';
      ctx.fillRect(midX - labelWidth / 2, midY - fontSize / 2 - 2, labelWidth, fontSize + 4);

      ctx.fillStyle = link.color;
      ctx.fillText(link.label, midX, midY);
    } else {
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.strokeStyle = darkMode ? '#555' : '#ccc';
      ctx.lineWidth = 1.5 / globalScale;
      ctx.stroke();

      const arrowLength = 8 / globalScale;
      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(
        endX - arrowLength * Math.cos(angle - Math.PI / 6),
        endY - arrowLength * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        endX - arrowLength * Math.cos(angle + Math.PI / 6),
        endY - arrowLength * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fillStyle = darkMode ? '#666' : '#999';
      ctx.fill();

      const midX = (start.x + end.x) / 2;
      const midY = (start.y + end.y) / 2;
      const fontSize = 10 / globalScale;
      ctx.font = `${fontSize}px Sans-Serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const labelWidth = ctx.measureText(link.label).width + 4;
      ctx.fillStyle = darkMode ? 'rgba(30, 30, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)';
      ctx.fillRect(midX - labelWidth / 2, midY - fontSize / 2 - 1, labelWidth, fontSize + 2);

      ctx.fillStyle = darkMode ? '#aaa' : '#666';
      ctx.fillText(link.label, midX, midY);
    }
  }, [beginnerMode, currentStep, darkMode, graphData.nodes]);

  return (
    <ForceGraph2D
      ref={graphRef}
      graphData={graphData}
      width={width}
      height={height}
      backgroundColor={darkMode ? '#1a1a2e' : '#fafafa'}
      nodeCanvasObject={nodeCanvasObject}
      linkCanvasObject={linkCanvasObject}
      onNodeClick={handleNodeClick}
      nodePointerAreaPaint={(node, color, ctx) => {
        const radius = beginnerMode ? 50 : 15;
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
      }}
      cooldownTicks={beginnerMode ? 0 : 100}
      enableNodeDrag={!beginnerMode}
      enableZoomInteraction={true}
      enablePanInteraction={true}
    />
  );
}
