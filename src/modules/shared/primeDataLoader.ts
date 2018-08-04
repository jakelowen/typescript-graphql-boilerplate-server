import * as DataLoader from "dataloader";
export default (dataloader: DataLoader<string, any>, key: string, value: any) =>
  dataloader
    .clear(key)
    .prime(key, value)
    .load(key);
