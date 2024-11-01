const express = require('express');
const departmentRoutes = require('./routes/departmentRoutes');
const app = express();

app.use(express.json());
app.use('/api/departments', departmentRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
