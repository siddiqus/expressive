import childProcess from "child_process";
import path from "path";
import fs from "fs";
import SwaggerUtils from "./SwaggerUtils";

describe("SwaggerUtils", () => {
    describe("writeSwaggerJson", () => {
        it("should write json for swagger", () => {

            const sampleSwaggerInfo = {
                version: "1.0.0",
                title: "Expressive API",
                contact: {
                    name: "Author",
                    email: "Your email address",
                    url: ""
                }
            };
            const mockRouter = {
                routes: [
                    {
                        path: "/",
                        method: "get",
                        controller: () => { },
                        doc: {}
                    }
                ],
                subroutes: [
                    {
                        path: "/users",
                        router: {
                            routes: [
                                {
                                    path: "/",
                                    method: "get",
                                    controller: () => { },
                                    doc: {}
                                },
                                {
                                    path: "/",
                                    method: "post",
                                    controller: () => { },
                                    doc: {}
                                }
                            ],
                            subroutes: [
                                {
                                    path: "/:userId/posts",
                                    router: {
                                        routes: [
                                            {
                                                path: "/",
                                                method: "get",
                                                controller: () => { }
                                            },
                                            {
                                                path: "/",
                                                method: "post",
                                                controller: () => { }
                                            }
                                        ]
                                    }
                                }
                            ]
                        },

                    }
                ]
            }
            const outputPath = path.resolve(__dirname, "output.json");
            SwaggerUtils.writeSwaggerJson(
                mockRouter, outputPath, "/", sampleSwaggerInfo
            );

            const file = fs.readFileSync(outputPath);
            expect(file).toBeDefined();
            fs.unlinkSync(outputPath);
        });

    });
});
