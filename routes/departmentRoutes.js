const express = require('express');
const multer = require('multer');
const departmentController = require('../controllers/departmentController');
const router = express.Router();

const upload = multer({ dest: 'uploads/' });

router.post('/upload-csv', upload.single('file'), departmentController.uploadCSV);
router.get('/export-csv', departmentController.exportCSV);

module.exports = router;
