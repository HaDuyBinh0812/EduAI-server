import { CorsOptions } from "cors";

export const corsOptions: CorsOptions = {
    origin: ["http://localhost:5173", "https://eduai-client.netlify.app"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
};
