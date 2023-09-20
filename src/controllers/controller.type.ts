import { Router } from "express";

export type Controller = {
    path: string;
    router: Router;
};
