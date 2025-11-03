//se creo la clase de server para lka funcion principal de user
import express from "express";
import cors from "cors";
import userRoutes from "./presentation/routes/user.routes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ Servidor User corriendo en puerto ${PORT}`));
