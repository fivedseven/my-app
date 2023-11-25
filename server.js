const express = require('express');
const app = express();
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const dirName = 'images';
const imagesPath = `http://localhost:3000/images/`;
const data = []

// Define the destination and filename for uploaded file
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});
// Create an instance of the multer
const upload = multer({storage});

// Generate a random ID function
function generateRandomId() {
    return Math.random().toString(36).substr(2, 9);
}

// Add the uploaded image data to the data array
function addImageToData(request, fileUrl) {
    const imageInfo = {
        id: generateRandomId(),
        title: request.title,
        description: request.description,
        fileName: request.fileName,
        tags: request.tags.split(','),
        price: parseFloat(request.price),
        createdAt: request.createdAt,
        url: fileUrl,
    };
    data.push(imageInfo);
}

// Read all files in the images folder and create an array of image data
fs.readdirSync(dirName).forEach((file) => {
    let id = generateRandomId();
    const imageInfo = {
        id: id,
        title: `Image ${id}`,
        description:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla euismod, nisl eget ultrices aliquam, nunc nisl aliquet nunc, eget aliquam nisl nunc eget nisl.',
        fileName: file,
        tags: ['tag1', 'tag2'],
        price: 100,
        createdAt: '2021-04-01',
        url: imagesPath + file,
    }
    data.push(imageInfo);
});


// Enable CORS for all routes
app.use(cors());

// Serve the images from the 'images' directory as static files
app.use('/images', express.static(path.join(__dirname, dirName)));

// routes -----------------------------------------------------------------

// List all images
app.get('/api/images', (req, res) => {
    res.json(data);
});

// Add a new image
app.post('/api/image', upload.single('image'), (req, res) => {
    const file = req.file;
    const fileUrl = `${imagesPath}${file.originalname}`;

    addImageToData(req.body, fileUrl);

    res.json({message: 'File uploaded successfully', url: fileUrl});
});

// Delete an image
app.delete('/api/images/:id', (req, res) => {
    const idToDelete = req.params.id;
    const imageIndex = data.findIndex((image) => image.id === idToDelete);

    if (imageIndex !== -1) {
        const imageToDelete = data[imageIndex];
        const imagePath = path.join(__dirname, 'images', imageToDelete.fileName);

        // Delete the file from the 'images' directory
        fs.unlink(imagePath, (err) => {
            if (err) {
                console.error(err);
                res.status(500).json({error: 'Failed to delete image file'});
            } else {
                // Remove the image entry from the data array
                data.splice(imageIndex, 1);
                res.json({message: 'Image deleted successfully'});
            }
        });
    } else {
        res.status(404).json({error: 'Image not found'});
    }
});

// Start the server
app.listen(3000, () => {
    console.log('Server listening on port 3000');
});
