import { Handler } from "../../../src";

export const someMiddleware: Handler = async (req) => {
  console.log(`some user middleware`, req.user)
}