// TODO - figure out how to better type these

export default (keys: any, keyFn: any) => {
  return (rows: any) => {
    const group = new Map(keys.map((key: any) => [key, null]));
    rows.forEach((row: any) => group.set(keyFn(row), row));
    return Array.from(group.values());
  };
};
