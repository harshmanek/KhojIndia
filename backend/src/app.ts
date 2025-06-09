import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes";
import experienceRoutes from "./routes/experiences.route";


const app = express();

morgan.token('body', (req: any) => JSON.stringify(req.body));
morgan.token('response-time', (req: any, res: any) => {
    if (!res._header || !req._startAt) return '';
    const diff = process.hrtime(req._startAt);
    const time = diff[0] * 1e3 + diff[1] * 1e-6;
    return time.toFixed(3);
});

const morganFormat = ':method :url :status :response-time ms - :res[content-length] - :body';

app.use(morgan(morganFormat));
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/experiences', experienceRoutes);
export default app;