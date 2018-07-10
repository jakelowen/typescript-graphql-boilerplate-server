// TODO - figure out how to better type these

export default (keys: any, keyFn: any) => {
  return (rows: any) => {
    const group = new Map(keys.map((key: any) => [key, []]));
    rows.forEach((row: any) =>
      ((group.get(keyFn(row)) || []) as any[]).push(row)
    );
    return Array.from(group.values());
  };
};
