'use client';

import * as d3 from 'd3';
import { useEffect, useRef, useState } from 'react';

interface CosmicNetworkProps {
  userId: string;
}

interface NetworkNode {
  id: string;
  name: string;
  zodiac: string;
  avatar?: string;
  type: 'user' | 'friend';
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface Friend {
  id: string;
  name: string;
  zodiac: string;
  avatar?: string;
}

interface Interaction {
  source_id: string;
  target_id: string;
  type: string;
}

interface NetworkLink {
  source: string | NetworkNode;
  target: string | NetworkNode;
  type: 'friendship' | 'interaction';
}

interface CosmicNetworkData {
  user: {
    id: string;
    name: string;
    zodiac: string;
    avatar?: string;
  };
  friends: Friend[];
  interactions: Interaction[];
}

export default function CosmicNetwork({ userId }: CosmicNetworkProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const loadNetworkData = async () => {
      try {
        setLoading(true);

        // Fetch cosmic network data from backend
        const response = await fetch(`/api/v1/cosmic_network/${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch network data');
        }

        const data = await response.json() as CosmicNetworkData;

        // Transform data for D3
        const nodes: NetworkNode[] = [
          {
            id: data.user.id,
            name: data.user.name,
            zodiac: data.user.zodiac,
            avatar: data.user.avatar,
            type: 'user'
          },
          ...data.friends.map((friend: Friend) => ({
            id: friend.id,
            name: friend.name,
            zodiac: friend.zodiac,
            avatar: friend.avatar,
            type: 'friend' as const
          }))
        ];

        // Create links based on friendships and interactions
        const links: NetworkLink[] = [
          // Friendship links
          ...data.friends.map((friend: Friend) => ({
            source: data.user.id,
            target: friend.id,
            type: 'friendship' as const
          })),
          // Interaction links (recent interactions)
          ...data.interactions.map((interaction: Interaction) => ({
            source: data.user.id,
            target: interaction.target_id,
            type: 'interaction' as const
          }))
        ];

        renderNetwork(nodes, links);

      } catch (err) {
        console.error('Error loading cosmic network:', err);
        setError(err instanceof Error ? err.message : 'Failed to load network');
      } finally {
        setLoading(false);
      }
    };

    loadNetworkData();
  }, [userId]);

  const renderNetwork = (nodes: NetworkNode[], links: NetworkLink[]) => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    const width = 600;
    const height = 400;

    svg.attr('width', width).attr('height', height);

    // Create force simulation
    const simulation = d3.forceSimulation(nodes as d3.SimulationNodeDatum[])
      .force('link', d3.forceLink(links).id((d: d3.SimulationNodeDatum) => (d as NetworkNode).id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30));

    // Create links
    const link = svg.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke', (d) => d.type === 'friendship' ? '#8b5cf6' : '#06b6d4')
      .attr('stroke-width', (d) => d.type === 'friendship' ? 3 : 1)
      .attr('stroke-opacity', 0.6)
      .attr('stroke-dasharray', (d) => d.type === 'interaction' ? '5,5' : null);

    // Create nodes
    const node = svg.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(nodes)
      .enter().append('g')
      .attr('class', 'node')
      .call(d3.drag<SVGGElement, NetworkNode>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      );

    // Add circles for nodes
    node.append('circle')
      .attr('r', (d) => d.type === 'user' ? 25 : 20)
      .attr('fill', (d) => d.type === 'user' ? '#8b5cf6' : '#06b6d4')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .attr('fill-opacity', 0.8);

    // Add avatars or initials
    node.each(function(d) {
      const nodeGroup = d3.select(this);

      if (d.avatar) {
        // Add image
        nodeGroup.append('defs')
          .append('pattern')
          .attr('id', `avatar-${d.id}`)
          .attr('patternUnits', 'objectBoundingBox')
          .attr('width', 1)
          .attr('height', 1)
          .append('image')
          .attr('href', d.avatar)
          .attr('width', d.type === 'user' ? 50 : 40)
          .attr('height', d.type === 'user' ? 50 : 40)
          .attr('x', 0)
          .attr('y', 0);

        nodeGroup.select('circle')
          .attr('fill', `url(#avatar-${d.id})`)
          .attr('stroke', '#8b5cf6')
          .attr('stroke-width', 3);
      } else {
        // Add initials
        nodeGroup.append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', '0.35em')
          .attr('fill', 'white')
          .attr('font-size', d.type === 'user' ? '14px' : '12px')
          .attr('font-weight', 'bold')
          .attr('pointer-events', 'none')
          .text(d.name.charAt(0).toUpperCase());
      }
    });

    // Add labels
    node.append('text')
      .attr('dx', 0)
      .attr('dy', (d) => d.type === 'user' ? 40 : 35)
      .attr('text-anchor', 'middle')
      .attr('fill', '#e5e7eb')
      .attr('font-size', '10px')
      .attr('font-weight', '500')
      .attr('pointer-events', 'none')
      .text((d) => d.name.length > 10 ? d.name.substring(0, 10) + '...' : d.name);

    // Add zodiac symbols
    const zodiacSymbols: { [key: string]: string } = {
      'Aries': '♈', 'Taurus': '♉', 'Gemini': '♊', 'Cancer': '♋',
      'Leo': '♌', 'Virgo': '♍', 'Libra': '♎', 'Scorpio': '♏',
      'Sagittarius': '♐', 'Capricorn': '♑', 'Aquarius': '♒', 'Pisces': '♓'
    };

    node.append('text')
      .attr('dx', 0)
      .attr('dy', (d) => d.type === 'user' ? 50 : 45)
      .attr('text-anchor', 'middle')
      .attr('fill', '#fbbf24')
      .attr('font-size', '12px')
      .attr('pointer-events', 'none')
      .text((d) => zodiacSymbols[d.zodiac] || '✨');

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: NetworkLink) => (d.source as NetworkNode).x!)
        .attr('y1', (d: NetworkLink) => (d.source as NetworkNode).y!)
        .attr('x2', (d: NetworkLink) => (d.target as NetworkNode).x!)
        .attr('y2', (d: NetworkLink) => (d.target as NetworkNode).y!);

      node
        .attr('transform', (d: NetworkNode) => `translate(${d.x}, ${d.y})`);
    });

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 2])
      .on('zoom', (event) => {
        svg.selectAll('g').attr('transform', event.transform);
      });

    // @ts-expect-error - D3 zoom typing compatibility issue
    svg.call(zoom);

    // Add tooltips
    node.on('mouseover', function(event, d) {
      const tooltip = d3.select('body')
        .append('div')
        .attr('class', 'cosmic-tooltip')
        .style('position', 'absolute')
        .style('background', 'rgba(0, 0, 0, 0.9)')
        .style('color', 'white')
        .style('padding', '8px 12px')
        .style('border-radius', '6px')
        .style('font-size', '12px')
        .style('pointer-events', 'none')
        .style('z-index', '1000')
        .style('border', '1px solid #8b5cf6')
        .html(`
          <div style="font-weight: bold; color: #8b5cf6;">${d.name}</div>
          <div style="color: #06b6d4;">${zodiacSymbols[d.zodiac] || '✨'} ${d.zodiac}</div>
          <div style="color: #9ca3af; font-size: 11px;">${d.type === 'user' ? 'You' : 'Friend'}</div>
        `);

      tooltip
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px');
    })
    .on('mouseout', () => {
      d3.selectAll('.cosmic-tooltip').remove();
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent mx-auto"></div>
          <p className="text-gray-400">Loading cosmic network...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-red-400">
          <p>Failed to load cosmic network</p>
          <p className="text-sm text-gray-500 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cosmic-network-container">
      <svg
        ref={svgRef}
        className="w-full h-96 border border-purple-500/20 rounded-lg bg-black/20 backdrop-blur-sm cosmic-network-svg"
      />
      <div className="mt-4 text-xs text-gray-400 text-center">
        <p>Drag nodes to explore • Solid lines: Friendships • Dashed lines: Recent interactions</p>
        <p>Hover for details • Scroll to zoom</p>
      </div>
    </div>
  );
}