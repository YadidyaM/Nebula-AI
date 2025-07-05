import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { AlertTriangle } from 'lucide-react';

interface ResourceData {
  hour: number;
  day: number;
  value: number;
  type: 'power' | 'storage' | 'bandwidth';
}

interface ResourceHeatmapProps {
  data: ResourceData[];
  title: string;
  colorScale: string[];
}

const ResourceHeatmap: React.FC<ResourceHeatmapProps> = ({ data, title, colorScale }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    // Set dimensions
    const margin = { top: 50, right: 40, bottom: 60, left: 60 };
    const width = svgRef.current.clientWidth - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const x = d3.scaleBand()
      .range([0, width])
      .domain(d3.range(24).map(d => d.toString()))
      .padding(0.05);

    const y = d3.scaleBand()
      .range([height, 0])
      .domain(d3.range(7).map(d => d.toString()))
      .padding(0.05);

    const color = d3.scaleQuantile<string>()
      .domain([0, d3.max(data, d => d.value) || 0])
      .range(colorScale);

    // Add X axis with hour labels
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d => `${d}:00`))
      .selectAll("text")
      .style("text-anchor", "middle")
      .attr("transform", "rotate(-45)")
      .attr("dy", "1em");

    // Add Y axis with day labels
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    svg.append("g")
      .call(d3.axisLeft(y).tickFormat(d => days[parseInt(d)]))
      .selectAll("text")
      .style("text-anchor", "end");

    // Add title with styling
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("fill", "#374151")
      .text(title);

    // Add subtitle
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -margin.top / 4)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "#6B7280")
      .text("Hourly resource utilization patterns");

    // Create tooltip
    const tooltip = d3.select(tooltipRef.current);

    // Format value for tooltip
    const formatValue = (value: number, type: string) => {
      switch (type) {
        case 'power':
          return `${value.toFixed(1)}W`;
        case 'storage':
          return `${value.toFixed(1)}GB`;
        case 'bandwidth':
          return `${value.toFixed(1)}Mbps`;
        default:
          return `${value.toFixed(1)}%`;
      }
    };

    // Add cells with enhanced interactivity
    svg.selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", d => x(d.hour.toString()) || 0)
      .attr("y", d => y(d.day.toString()) || 0)
      .attr("rx", 2)
      .attr("ry", 2)
      .attr("width", x.bandwidth())
      .attr("height", y.bandwidth())
      .style("fill", d => color(d.value))
      .style("stroke", "#fff")
      .style("stroke-width", 1)
      .style("transition", "all 0.2s ease")
      .on("mouseover", function(event, d) {
        // Highlight cell
        d3.select(this)
          .style("stroke", "#4B5563")
          .style("stroke-width", 2)
          .style("filter", "brightness(0.9)");

        // Show tooltip
        tooltip.style("opacity", 1)
          .html(`
            <div class="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg">
              <div class="font-medium">${days[d.day]}, ${d.hour}:00</div>
              <div class="text-gray-300 text-sm">
                Usage: ${formatValue(d.value, d.type)}
              </div>
              ${d.value > 80 ? `
                <div class="flex items-center text-yellow-300 text-sm mt-1">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  High Usage
                </div>
              ` : ''}
            </div>
          `)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 10}px`);
      })
      .on("mouseout", function() {
        // Reset cell styling
        d3.select(this)
          .style("stroke", "#fff")
          .style("stroke-width", 1)
          .style("filter", null);

        // Hide tooltip
        tooltip.style("opacity", 0);
      });

    // Add color legend with gradient
    const legendWidth = 200;
    const legendHeight = 15;
    
    const legendScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value) || 0])
      .range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legendScale)
      .ticks(5)
      .tickFormat(d => `${d}%`);

    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width - legendWidth - 10},${height + 40})`);

    // Create gradient
    const gradient = legend.append("defs")
      .append("linearGradient")
      .attr("id", "heatmap-gradient")
      .attr("x1", "0%")
      .attr("x2", "100%")
      .attr("y1", "0%")
      .attr("y2", "0%");

    colorScale.forEach((color, i) => {
      gradient.append("stop")
        .attr("offset", `${(i / (colorScale.length - 1)) * 100}%`)
        .attr("stop-color", color);
    });

    // Add gradient rectangle
    legend.append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#heatmap-gradient)")
      .style("rx", 3)
      .style("ry", 3);

    // Add legend axis
    legend.append("g")
      .attr("transform", `translate(0,${legendHeight})`)
      .call(legendAxis)
      .selectAll("text")
      .style("font-size", "10px");

    // Add legend title
    legend.append("text")
      .attr("x", 0)
      .attr("y", -5)
      .style("font-size", "12px")
      .style("fill", "#4B5563")
      .text("Resource Usage");

    // Add grid pattern
    const gridPattern = svg.append("defs")
      .append("pattern")
      .attr("id", "grid-pattern")
      .attr("width", x.bandwidth())
      .attr("height", y.bandwidth())
      .attr("patternUnits", "userSpaceOnUse");

    gridPattern.append("path")
      .attr("d", `M ${x.bandwidth()} 0 L 0 0 0 ${y.bandwidth()}`)
      .style("fill", "none")
      .style("stroke", "#E5E7EB")
      .style("stroke-width", 1);

    // Add pattern to background
    svg.insert("rect", ":first-child")
      .attr("width", width)
      .attr("height", height)
      .style("fill", "url(#grid-pattern)");

  }, [data, title, colorScale]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="relative">
        <svg ref={svgRef} className="w-full" />
        <div
          ref={tooltipRef}
          className="absolute opacity-0 pointer-events-none transition-opacity duration-200"
          style={{ zIndex: 50 }}
        />
      </div>
      
      {/* Usage Insights */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-3 bg-blue-50 rounded-lg">
          <h4 className="text-blue-700 font-medium">Peak Hours</h4>
          <p className="text-blue-600 text-sm">10:00 - 14:00</p>
        </div>
        <div className="p-3 bg-green-50 rounded-lg">
          <h4 className="text-green-700 font-medium">Low Usage</h4>
          <p className="text-green-600 text-sm">22:00 - 04:00</p>
        </div>
        <div className="p-3 bg-yellow-50 rounded-lg flex items-start">
          <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
          <div>
            <h4 className="text-yellow-700 font-medium">High Load Days</h4>
            <p className="text-yellow-600 text-sm">Tuesday, Thursday</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceHeatmap;