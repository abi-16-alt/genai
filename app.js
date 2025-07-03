fetch('https://your-backend-url.onrender.com/data') // Update this!
  .then(res => res.json())
  .then(data => {
    const triples = [
      { subject: "MeenakshiTemple", predicate: "name", object: data["schema:name"] },
      { subject: "MeenakshiTemple", predicate: "location", object: data["schema:location"] },
      { subject: "MeenakshiTemple", predicate: "touristType", object: data["schema:touristType"] },
      { subject: "MeenakshiTemple", predicate: "price", object: data["schema:price"] },
      { subject: "MeenakshiTemple", predicate: "review", object: "Review1" },
      { subject: "Review1", predicate: "reviewRating", object: data["schema:review"]["schema:reviewRating"] },
      { subject: "Review1", predicate: "reviewBody", object: data["schema:review"]["schema:reviewBody"] },
      { subject: "Review1", predicate: "author", object: data["schema:review"]["schema:author"] }
    ];

    const graph = triplesToGraph(triples);
    renderGraph(graph);
  });

function triplesToGraph(triples) {
  const nodes = {};
  const links = [];

  triples.forEach(({ subject, predicate, object }) => {
    if (!nodes[subject]) nodes[subject] = { id: subject };
    if (!nodes[object]) nodes[object] = { id: object };
    links.push({ source: subject, target: object, label: predicate });
  });

  return { nodes: Object.values(nodes), links };
}

function renderGraph(graph) {
  const svg = d3.select("svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height");

  const simulation = d3.forceSimulation(graph.nodes)
    .force("link", d3.forceLink(graph.links).id(d => d.id).distance(150))
    .force("charge", d3.forceManyBody().strength(-300))
    .force("center", d3.forceCenter(width / 2, height / 2));

  const link = svg.append("g")
    .selectAll("line")
    .data(graph.links)
    .enter().append("line")
    .attr("stroke", "#999");

  const node = svg.append("g")
    .selectAll("circle")
    .data(graph.nodes)
    .enter().append("circle")
    .attr("r", 10)
    .attr("fill", "#69b3a2");

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
