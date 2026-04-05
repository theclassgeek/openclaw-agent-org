async function main() {
  const res = await fetch('agents.json');
  const data = await res.json();
  document.getElementById('title').textContent = data.title;
  document.getElementById('subtitle').textContent = `${data.subtitle} · Updated ${data.updatedAt}`;

  const chart = document.getElementById('chart');
  const nodes = new Map(data.nodes.map((n) => [n.id, n]));
  const children = new Map();

  data.nodes.forEach((node) => {
    const parent = node.reportsTo || '__root__';
    if (!children.has(parent)) children.set(parent, []);
    children.get(parent).push(node);
  });

  function renderLevel(parentId, target) {
    const items = children.get(parentId) || [];
    if (!items.length) return;

    const level = document.createElement('div');
    level.className = 'level';

    items.forEach((node) => {
      const wrap = document.createElement('div');
      wrap.className = 'node-wrap';

      if (parentId !== '__root__') {
        const connector = document.createElement('div');
        connector.className = 'connector';
        wrap.appendChild(connector);
      }

      const card = document.createElement('article');
      card.className = 'card';

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
    items.forEach((node) => renderLevel(node.id, target));
  }

  renderLevel('__root__', chart);
}

main().catch((error) => {
  console.error(error);
  document.getElementById('subtitle').textContent = 'Failed to load org chart data.';
});
