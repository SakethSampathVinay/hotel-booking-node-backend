import express from "express";
import cors from "cors";
import { pool, connectToDB } from "./database/db.js";
import authRouter from "./routes/authRoutes.js";
import roomsRouter from "./routes/roomsRoutes.js";
import createTables from "./models/rooms.js";
import createBookingsTable from "./models/booking.js";
import bookingRouter from "./routes/bookingsRoutes.js";
import ordersModel from "./models/orders.js";
import ordersRouter from "./routes/ordersRoutes.js";
import createOrdersTable from "./models/orders.js";
import createUser from "./models/auth.js";
import createRoomsTable from "./models/rooms.js";

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/auth", authRouter);
app.use("/", roomsRouter);
app.use("/", bookingRouter);
app.use("/api", ordersRouter);

createUser();
createBookingsTable();
createOrdersTable();
createRoomsTable();

connectToDB();

app.get("/", (req, res) => {
  res.send("EasyStay NodeJS Backend with MariaDB");
});

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
