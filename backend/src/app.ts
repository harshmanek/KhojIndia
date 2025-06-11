import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes";
import experienceRoutes from "./routes/experiences.route";
import bookingRoutes from "./routes/booking.routes";
import cookieParser from "cookie-parser"

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin:process.env.FRONTEND_URL||'http://localhost:3000',
    credentials:true,
    methods:['GET','POST','PUT','DELETE','PATCH'],
    allowedHeaders:['Content-Type','Authoization']
}));


morgan.token('body', (req: any) => JSON.stringify(req.body));
morgan.token('response-time', (req: any, res: any) => {
    if (!res._header || !req._startAt) return '';
    const diff = process.hrtime(req._startAt);
    const time = diff[0] * 1e3 + diff[1] * 1e-6;
    return time.toFixed(3);
});

const morganFormat = ':method :url :status :response-time ms - :res[content-length] - :body';



app.use(morgan(morganFormat));
// api for authorization
app.use('/api/auth', authRoutes);

// api for experiences
app.use('/api/experiences', experienceRoutes);

// apis for bookings
app.use('/api/booking',bookingRoutes);



export default app;