// import knexfile from "./knexfile";
import * as knex from "knex";

const environment = process.env.NODE_ENV || "development"; // if something else isn't setting ENV, use development
// TODO - find or make proper knexfile type
// const configuration = (knexfile as any)[environment]; // require environment's settings from knexfile
// tslint:disable-next-line no-var-requires
const configuration = require("./knexfile")[environment];
export default knex(configuration); // connect to DB via knex using env's settings
