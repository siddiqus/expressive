import path from "path";
import fs from "fs";
import SwaggerUtils from "../src/SwaggerUtils";

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
                        doc: {
                            tags: ["Engagement"]
                        },
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
                                    doc: {
                                        tags: ["Engagement"]
                                    },
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
                mockRouter, outputPath, "/api", sampleSwaggerInfo
            );

            const file = fs.readFileSync(outputPath);
            expect(file).toBeDefined();
            fs.unlinkSync(outputPath);
        });

        it("should write json for swagger using defaults", () => {
            const mockRouter = {
                routes: [
                    {
                        path: "/",
                        method: "get",
                        controller: () => { },
                        doc: {
                            tags: ["Engagement"]
                        },
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
                                    doc: {
                                        tags: ["Engagement"]
                                    },
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
                mockRouter, outputPath
            );

            const file = fs.readFileSync(outputPath);
            expect(file).toBeDefined();
            fs.unlinkSync(outputPath);
        });
    });

    describe("getSwaggerHeader", () => {
        it("works with defaults", () => {
            const header = SwaggerUtils.getSwaggerHeader();
            expect(header).toBeDefined();
        });

        it("works with non defaults", () => {
            const header = SwaggerUtils.getSwaggerHeader("/api");
            expect(header).toBeDefined();
        });
    });
});
