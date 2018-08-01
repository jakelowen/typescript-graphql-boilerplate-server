import { map } from "lodash";
import loadSinglePage from "./loadSinglePage";

export default (keys: string[]) =>
  Promise.resolve(map(keys, key => loadSinglePage(key)));
