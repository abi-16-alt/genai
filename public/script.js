fetch('/data')
  .then(res => res.json())
  .then(data => {
    const triples = [];

    for (const key in data) {
      if (key === '@context' || key === '@id' || key === '@type') continue;
      const value = data[key];

      if (typeof value === 'object' && value['@type']) {
        const objId = key;
        triples.push({ subject: "MeenakshiTemple", predicate: key, object: objId });

        for (const innerKey in value) {
          if (innerKey.startsWith('@')) continue;
          triples.push({ subject: objId, predicate: innerKey, object: value[innerKey] });
        }
      } else {
        triples.push({ subject: "MeenakshiTemple", predicate: key, object: value });
      }
    }

    const graph = triplesToGraph(triples);
    drawGraph(graph);
  });

function triplesToGraph(triples) {
  const nodes = {};
  const links = [];

  triples.forEach(({ subject, predicate, object }) => {
    if (!nodes[subject]) nodes[subject] = { id: subject };
    if (!nodes[object]) nodes[object] = { id: object };
    links.push({ source: subject, target: object, label: predicate });
  });

  return {
    nodes: Object.values(nodes),
    links
  };
}

function drawGraph(graph) {
  const svg = d3.select("svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height");

  const simulation = d3.forceSimulation(graph.nodes)
    .force("link", d3.forceLink(graph.links).id(d => d.id).distance(120))
    .force("charge", d3.forceManyBody().strength(-300))
    .force("center", d3.forceCenter(width / 2, height / 2));

  const link = svg.append("g")
    .selectAll("line")
    .data(graph.links)
    .enter().append("line")
    .attr("class", "link");

  const node = svg.append("g")
    .selectAll("circle")
    .data(graph.nodes)
    .enter().append("circle")
    .attr("class", "node")
    .attr("r", 10)
    .call(drag(simulation));

  const label = svg.append("g")
    .selectAll("text")
    .data(graph.nodes)
    .enter().append("text")
    .text(d => d.id)
    .attr("x", 12)
    .attr("y", ".31em");

  const edgeLabel = svg.append("g")
    .selectAll("text")
    .data(graph.links)
    .enter().append("text")
    .text(d => d.label)
    .attr("fill", "#555");

  simulation.on("tick", () => {
    link
      .attr("x1", d => d.source.x).attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x).attr("y2", d => d.target.y);

    node
      .attr("cx", d => d.x).attr("cy", d => d.y);

    label
      .attr("x", d => d.x + 12).attr("y", d => d.y);
      
    edgeLabel
      .attr("x", d => (d.source.x + d.target.x) / 2)
      .attr("y", d => (d.source.y + d.target.y) / 2);
  });
}

function drag(simulation) {
  return d3.drag()
    .on("start", event => {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    })
    .on("drag", event => {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    })
    .on("end", event => {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    });
}
