export const orderer = (query, orderArg) => {
  if (!orderArg) {
    return query;
  }
  // determine which field to sort by and direction
  let direction = 'ASC';
  let sortVar;
  if (orderArg.endsWith('_ASC')) {
    direction = 'ASC';
    sortVar = orderArg.replace('_ASC', '');
  } else if (orderArg.endsWith('_DESC')) {
    direction = 'DESC';
    sortVar = orderArg.replace('_DESC', '');
  }

  // order by field and determined direction
  query.orderBy(sortVar, direction);
  return query;
};
