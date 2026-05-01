const p = require('./prismaClient');
p.mealPlanItem.findMany({ select: { userId: true, date: true } })
  .then(r => {
    console.log('Total:', r.length);
    r.forEach(i => console.log(i.userId, i.date));
  })
  .finally(() => p.$disconnect());