import rateLimiter from "express-rate-limit";

export const rateLimitMiddleware = rateLimiter({
    max: 100, // the rate limit in reqs
    windowMs: 1 * 60 * 1000, // time where limit applies
    handler: (request, response, next, options) =>
        response
            .status(options.statusCode)
            .send({ message: "Za dużo zapytań, spróbuj ponownie za chwilę" }),
});
