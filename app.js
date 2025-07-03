fetch('https://<your-render-app>.onrender.com/data')  // ✅ Replace with your real backend URL
  .then(res => res.json())
  .then(data => {
    const triples = [
      { subject: "MeenakshiTemple", predicate: "name", object: data["schema:name"] },
      { subject: "MeenakshiTemple", predicate: "location", object: data["schema:location"] },
      { subject: "MeenakshiTemple", predicate: "touristType", object: data["schema:touristType"] }
    ];

    const nodes = [];
    const links = [];

    triples.forEach(({ subject, predicate, object }) => {
      if (!nodes.find(n => n.id === subject)) nodes.push({ id: subject });
      if (!nodes.find(n => n.id === object)) nodes.push({ id: object });
      links.push({ source: subject, target: object, label: predicate });
    });

    const svg = d3.select("svg");
    const width = +svg.attr("width");
    const height = +svg.attr("height");

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(200))
      .force("charge", d3.forceManyBody().strength(-500))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg.selectAll("line")
      .data(links)
      .enter().append("line")
      .style("stroke", "#999");

    const node = svg.selectAll("circle")
      .data(nodes)
      .enter().append("circle")
      .attr("r", 10)
      .style("fill", "#007BFF");

    const label = svg.selectAll("text")
      .data(nodes)
      .enter().append("text")
      .text(d => d.id)
      .attr("font-size", 12)
      .attr("dy", -15);

    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

      label
        .attr("x", d => d.x)
        .attr("y", d => d.y);
    });
  })
  .catch(error => {
    console.error("Failed to load RDF data:", error);
  });
