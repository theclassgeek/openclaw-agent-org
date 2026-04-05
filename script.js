async function main() {
  const res = await fetch('agents.json');
  const data = await res.json();
  document.getElementById('title').textContent = data.title;
  document.getElementById('subtitle').textContent = `${data.subtitle} · Updated ${data.updatedAt}`;

  const chart = document.getElementById('chart');
  const nodes = new Map(data.nodes.map((n) => [n.id, n]));
  const children = new Map();

  const hoverName = document.getElementById('hover-name');
  const hoverRole = document.getElementById('hover-role');
  const hoverSummary = document.getElementById('hover-summary');
  const hoverMeta = document.getElementById('hover-meta');

  function setHover(node) {
    if (!node) {
      hoverName.textContent = data.title;
      hoverRole.textContent = 'Move over a card to inspect an agent.';
      hoverSummary.textContent = 'Details about the selected node will appear here.';
      hoverMeta.textContent = '';
      return;
    }
    hoverName.textContent = node.name;
    hoverRole.textContent = `${node.role} · ${node.kind}`;
    hoverSummary.textContent = node.summary || '';
    const bits = [];
    if (node.meta?.channel) bits.push(`Channel: ${node.meta.channel}`);
    if (node.meta?.agentId) bits.push(`Agent ID: ${node.meta.agentId}`);
    if (node.status) bits.push(`Status: ${node.status}`);
    const manager = node.reportsTo ? nodes.get(node.reportsTo)?.name : null;
    if (manager) bits.push(`Reports to: ${manager}`);
    hoverMeta.textContent = bits.join(' · ');
  }

  data.nodes.forEach((node) => {
    const parent = node.reportsTo || '__root__';
    if (!children.has(parent)) children.set(parent, []);
    children.get(parent).push(node);
  });

  function renderLevel(parentId, target, isRoot = false) {
    const items = children.get(parentId) || [];
    if (!items.length) return;

    const level = document.createElement('div');
    level.className = `level ${isRoot ? 'level--root' : 'level--children'}`;

    items.forEach((node) => {
      const wrap = document.createElement('div');
      wrap.className = 'node-wrap';

      const card = document.createElement('article');
      card.className = 'card';
      card.addEventListener('mouseenter', () => setHover(node));
      card.addEventListener('focusin', () => setHover(node));
      card.addEventListener('mouseleave', () => setHover(null));

      const badge = document.createElement('div');
      badge.className = 'badge';
      badge.textContent = node.kind;
      card.appendChild(badge);

      const avatar = document.createElement('img');
      avatar.className = 'avatar';
      avatar.src = node.avatar;
      avatar.alt = `${node.name} profile picture`;
      card.appendChild(avatar);

      const name = document.createElement('h2');
      name.className = 'name';
      name.textContent = node.name;
      card.appendChild(name);

      const role = document.createElement('p');
      role.className = 'role';
      role.textContent = node.role;
      card.appendChild(role);

      const summary = document.createElement('p');
      summary.className = 'summary';
      summary.textContent = node.summary || '';
      card.appendChild(summary);

      const meta = document.createElement('div');
      meta.className = 'meta';
      const bits = [];
      if (node.meta?.channel) bits.push(node.meta.channel);
      if (node.meta?.agentId) bits.push(`agent: ${node.meta.agentId}`);
      if (node.status) bits.push(`status: ${node.status}`);
      meta.textContent = bits.join(' · ');
      card.appendChild(meta);

      wrap.appendChild(card);
      level.appendChild(wrap);
    });

    target.appendChild(level);
    items.forEach((node) => renderLevel(node.id, target, false));
  }

  setHover(null);
  renderLevel('__root__', chart, true);
}

main().catch((error) => {
  console.error(error);
  document.getElementById('subtitle').textContent = 'Failed to load org chart data.';
});
