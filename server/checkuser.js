const p = require('./prismaClient');
p.user.findUnique({ where: { id: 'cmomv1t0j0000ckkz13r0hgzl' }, select: { email: true } })
  .then(r => console.log('User:', r))
  .finally(() => p.$disconnect());