// TODO - figure out how to better type these

export default (keys: any, keyFn: any, valueFn: any) => {
  return (rows: any) => {
    const group = new Map(keys.map((key: any) => [key, null]));
    rows.forEach((row: any) => group.set(keyFn(row), valueFn(row)));
    return Array.from(group.values());
  };
};
