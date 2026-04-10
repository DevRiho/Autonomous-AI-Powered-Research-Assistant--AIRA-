import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Network, ZoomIn, ZoomOut, Maximize, RefreshCcw } from 'lucide-react';
import axios from 'axios';

const KnowledgeGraph = () => {
  const svgRef = useRef(null);
  const wrapperRef = useRef(null);
  const [isSimulating, setIsSimulating] = useState(true);
  const [data, setData] = useState({ nodes: [], links: [] });

  const loadGraphData = async () => {
      try {
          const res = await axios.get('http://localhost:5000/api/graph');
          
          // Format D3 Graph shape if not exact
          const formattedNodes = res.data.nodes.map(n => ({
              id: n.id || n._id,
              label: n.label || n.title,
              group: n.type === 'paper' ? 1 : n.type === 'author' ? 2 : 3
          }));
          
          const formattedLinks = res.data.links.map(l => ({
              source: l.source,
              target: l.target,
              value: 2
          }));

          // Fallback if empty database
          if (formattedNodes.length === 0) {
              setData({
                  nodes: [
                    { id: '1', label: 'Upload Documents First', group: 1 },
                    { id: '2', label: 'Extract Entities', group: 3 }
                  ],
                  links: [{ source: '1', target: '2', value: 1 }]
              });
          } else {
              setData({ nodes: formattedNodes, links: formattedLinks });
          }
      } catch (err) {
          console.error("Failed to fetch knowledge graph:", err);
      }
  };

  useEffect(() => {
     loadGraphData();
  }, []);

  useEffect(() => {
    if (!svgRef.current || !wrapperRef.current || data.nodes.length === 0) return;
    d3.select(svgRef.current).selectAll('*').remove();

    const width = wrapperRef.current.clientWidth;
    const height = 600;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .call(d3.zoom().on('zoom', (event) => {
        g.attr('transform', event.transform);
      }));

    const g = svg.append('g');

    const simulation = d3.forceSimulation(data.nodes)
      .force('link', d3.forceLink(data.links).id(d => d.id).distance(120))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .on('end', () => setIsSimulating(false));

    // Draw Links
    const link = g.append('g')
      .selectAll('line')
      .data(data.links)
      .enter().append('line')
      .attr('stroke', '#3f3f46')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 1.5);

    // Draw Nodes
    const node = g.append('g')
      .selectAll('circle')
      .data(data.nodes)
      .enter().append('circle')
      .attr('r', 8)
      .attr('fill', d => d.group === 1 ? '#ffffff' : d.group === 2 ? '#a1a1aa' : '#52525b')
      .attr('stroke', '#18181b')
      .attr('stroke-width', 3)
      .call(drag(simulation));

    // Labels
    const labels = g.append('g')
      .selectAll('text')
      .data(data.nodes)
      .enter().append('text')
      .text(d => d.label)
      .attr('font-size', 11)
      .attr('fill', '#a1a1aa')
      .attr('font-family', 'Inter, sans-serif')
      .attr('dx', 12)
      .attr('dy', 4);

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);

      labels
        .attr('x', d => d.x)
        .attr('y', d => d.y);
    });

  }, [data]);

  function drag(simulation) {
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    
    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }
    
    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
    
    return d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  }

  return (
    <div className="p-4 md:p-10 w-full mx-auto h-full flex flex-col fade-in">
      <div className="mb-4 md:mb-6 flex flex-col md:flex-row md:justify-between items-start md:items-end border-b border-zinc-800 pb-4 md:pb-6 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-zinc-100 mb-1">Knowledge Graph</h1>
          <p className="text-xs md:text-sm text-zinc-400">Live ontology visualization dynamically built via LLMs.</p>
        </div>
        
        {/* Graph Controls */}
        <div className="flex space-x-3">
           <button onClick={() => { setIsSimulating(true); loadGraphData(); }} className="flex items-center space-x-2 text-zinc-400 hover:text-zinc-100 text-sm font-medium mr-4">
              <RefreshCcw size={16} />
              <span>Refresh Synapses</span>
           </button>
           <div className="flex bg-[#0a0a0a] rounded border border-zinc-800">
              <button className="p-2 hover:bg-zinc-900 border-r border-zinc-800 text-zinc-400 transition-colors" title="Zoom In"><ZoomIn size={16} /></button>
              <button className="p-2 hover:bg-zinc-900 border-r border-zinc-800 text-zinc-400 transition-colors" title="Zoom Out"><ZoomOut size={16} /></button>
              <button className="p-2 hover:bg-zinc-900 text-zinc-400 transition-colors" title="Fit to Screen"><Maximize size={16} /></button>
           </div>
        </div>
      </div>

      <div className="flex-1 bg-[#050505] border border-zinc-800 rounded-lg relative overflow-hidden flex flex-col" ref={wrapperRef}>
         {isSimulating && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/50">
               <span className="text-sm text-zinc-400 animate-pulse">Rendering entity relationships...</span>
            </div>
         )}
         <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing"></svg>
      </div>
    </div>
  );
};

export default KnowledgeGraph;
