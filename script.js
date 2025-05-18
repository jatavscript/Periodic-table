function getBlock(el) {
  // s-block: Groups 1-2 (except He), including H, and He (special case)
  if ((el.xpos === 1 || el.xpos === 2) && el.ypos <= 7) {
    if (el.symbol === 'He') return 'p'; // Helium is a noble gas but in s position, treat as p-block
    return 's';
  }
  // f-block: Lanthanides and Actinides (periods 6, 7, ypos 9, 10)
  if ((el.ypos === 9 || el.ypos === 10)) return 'f';
  // d-block: Groups 3-12, periods 4-7
  if (el.xpos >= 3 && el.xpos <= 12 && el.ypos >= 4 && el.ypos <= 7) return 'd';
  // p-block: Groups 13-18, periods 2-7
  if (el.xpos >= 13 && el.xpos <= 18 && el.ypos >= 2 && el.ypos <= 7) return 'p';
  return '';
}

fetch("periodic-table.json")
  .then(res => res.json())
  .then(data => {
    const table = document.getElementById("periodicTable");
    const panel = document.getElementById("detailsPanel");
    const nameEl = document.getElementById("elementName");
    const symbolEl = document.getElementById("elementSymbol");
    const numberEl = document.getElementById("elementNumber");
    const massEl = document.getElementById("elementMass");
    const discovererEl = document.getElementById("elementDiscoverer");
    const yearEl = document.getElementById("elementYear");

    // Dropdowns
    const categoryFilter = document.getElementById('categoryFilter');
    const periodFilter = document.getElementById('periodFilter');
    const groupFilter = document.getElementById('groupFilter');
    const blockFilter = document.getElementById('blockFilter');

    // Populate dropdowns
    const categories = Array.from(new Set(data.map(e => e.category))).sort();
    categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat.replace(/\b\w/g, l => l.toUpperCase());
      categoryFilter.appendChild(opt);
    });
    for (let i = 1; i <= 7; i++) {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = `Period ${i}`;
      periodFilter.appendChild(opt);
    }
    for (let i = 1; i <= 18; i++) {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = `Group ${i}`;
      groupFilter.appendChild(opt);
    }

    function renderTable() {
      table.innerHTML = '';
      const catVal = categoryFilter.value;
      const perVal = periodFilter.value;
      const grpVal = groupFilter.value;
      const blkVal = blockFilter.value;
      data.forEach(el => {
        const block = getBlock(el);
        if (
          (catVal === 'all' || el.category === catVal) &&
          (perVal === 'all' || el.ypos == perVal) &&
          (grpVal === 'all' || el.xpos == grpVal) &&
          (blkVal === 'all' || block === blkVal)
        ) {
          const div = document.createElement("div");
          div.className = `element ${el.category.replace(/\s+/g, '-').toLowerCase()}`;
          div.style.gridColumn = el.xpos;
          div.style.gridRow = el.ypos;
          div.innerHTML = `
            <div class="number">${el.number}</div>
            <div class="symbol">${el.symbol}</div>
            <div class="el-name">${el.name}</div>
          `;
          div.addEventListener("mouseenter", () => {
            nameEl.textContent = el.name;
            symbolEl.textContent = el.symbol;
            numberEl.textContent = el.number;
            massEl.textContent = el.atomic_mass;
            discovererEl.textContent = el.discovered_by || "Unknown";
            yearEl.textContent = el.year_discovered || "N/A";
            panel.classList.add("active");
          });
          div.addEventListener("mouseleave", () => {
            panel.classList.remove("active");
          });
          table.appendChild(div);
        }
      });
    }

    categoryFilter.addEventListener('change', renderTable);
    periodFilter.addEventListener('change', renderTable);
    groupFilter.addEventListener('change', renderTable);
    blockFilter.addEventListener('change', renderTable);

    renderTable();
  })
  .catch(err => {
    console.error("Failed to load periodic-table.json:", err);
  });
