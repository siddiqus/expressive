import { Handler } from "../../../src";

export const someMiddleware: Handler = async (req, res) => {
  console.log(`some user middleware`)
}