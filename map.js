function mapLogic() {
    return { 
        fontSize: 14, 
        updateSize() { d3.selectAll(".label-box").style("font-size", this.fontSize + "px"); }, 
        reset() { d3.select("#svg-canvas").transition().call(d3.zoom().transform, d3.zoomIdentity); }, 
        exportCode() { window.runExport(); } 
    }
}

window.initD3 = function() {
    const svg = d3.select("#svg-canvas"), g = svg.append("g");
    const labels = {};
    const W = 1200, H = 800;

    const projection = d3.geoMercator().scale(190).translate([W/2, H/1.4]);
    const path = d3.geoPath().projection(projection);

    svg.call(d3.zoom().scaleExtent([1, 40]).on("zoom", (e) => { 
        g.attr("transform", e.transform); 
        updateL(); 
    }));

    d3.select("#msf-box").call(d3.drag().filter(e => e.target.className === 'drag-handle').on("drag", function(e) {
        d3.select(this).style("left", e.x + "px").style("top", e.y + "px");
    }));

    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then(data => {
        g.selectAll("path").data(data.features).enter().append("path")
            .attr("d", path).attr("class", "country")
            .on("click", function(e, d) {
                const n = d3.select(this);
                const active = !n.classed("active");
                n.classed("active", active);
                if(active) labels[d.id] = { name: d.properties.name, pos: path.centroid(d), url: '' };
                else delete labels[d.id];
                draw();
            });
    });

    function draw() {
        const wrap = d3.select("#labels-container").selectAll(".label-wrap").data(Object.entries(labels), d => d[0]);
        wrap.exit().remove();
        const ent = wrap.enter().append("div").attr("class", "label-wrap")
            .call(d3.drag().on("drag", function(ev, d) {
                const t = d3.zoomTransform(svg.node());
                labels[d[0]].pos = [(ev.x - t.x)/t.k, (ev.y - t.y)/t.k];
                updateL();
            }));
        ent.append("div").attr("class", "label-box").attr("contenteditable", "true")
            .on("input", function(e, d) { labels[d[0]].name = this.innerText; });
        ent.append("input").attr("class", "label-url-input").attr("placeholder", "Link URL (valgfri)")
            .on("input", function(e, d) { labels[d[0]].url = this.value; });
        
        ent.merge(wrap).select(".label-box").text(d => d[1].name);
        updateL();
    }

    function updateL() {
        const t = d3.zoomTransform(svg.node());
        d3.selectAll(".label-wrap").each(function(d) {
            const p = labels[d[0]].pos;
            d3.select(this).style("left", (p[0] * t.k + t.x) + "px").style("top", (p[1] * t.k + t.y) + "px");
        });
    }

    window.runExport = function() {
        const t = d3.zoomTransform(svg.node());
        const box = document.getElementById('msf-box');
        const cont = document.getElementById('map-area');
        let lHtml = "";
        Object.values(labels).forEach(d => {
            const x = (d.pos[0] * t.k + t.x) / cont.offsetWidth * 100;
            const y = (d.pos[1] * t.k + t.y) / cont.offsetHeight * 100;
            const inner = d.url ? `<a href="${d.url}" target="_blank" style="color:black;text-decoration:none;">${d.name}</a>` : d.name;
            lHtml += `<div style="position:absolute;left:${x}%;top:${y}%;transform:translate(-50%,-100%);background:white;padding:4px 10px;font-weight:900;text-transform:uppercase;font-size:1.2vw;border:1px solid #ccc;white-space:nowrap;box-shadow:2px 2px 8px rgba(0,0,0,0.15);z-index:5;">${inner}</div>`;
        });

        const code = `<div style="position:relative;width:100%;aspect-ratio:1200/800;background:#b5d5d5;overflow:hidden;font-family:sans-serif;">
<svg viewBox="${-t.x/t.k} ${-t.y/t.k} ${W/t.k} ${H/t.k}" style="width:100%;height:100%;">
${g.html().replace(/class="country active"/g, 'fill="#e30613"').replace(/class="country"/g, 'fill="#f3ece6" stroke="#94a3b8" stroke-width="0.2"')}
</svg>${lHtml}
<div style="position:absolute;left:${(box.offsetLeft/cont.offsetWidth)*100}%;top:${(box.offsetTop/cont.offsetHeight)*100}%;width:26%;background:white;padding:2%;border-left:6px solid #e30613;box-shadow:0 4px 15px rgba(0,0,0,0.25);">
<div style="font-weight:900;font-size:1.8vw;color:black;line-height:1.1;">${document.getElementById('box-h').innerText}</div>
<div style="display:flex;align-items:center;margin-top:6%;font-size:1.2vw;color:black;font-weight:bold;"><div style="width:12px;height:12px;background:#e30613;border-radius:50%;margin-right:10px;"></div>${document.getElementById('box-s').innerText}</div>
</div></div>`;
        navigator.clipboard.writeText(code);
        alert("Færdig HTML er kopieret!");
    };
};
