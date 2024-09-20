export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ message: 'No image provided' });
    }

    // Decode the base64 image string
    const base64Data = image.replace(/^data:image\/jpeg;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Here, you can write the image to the file system or upload to cloud storage.
    // For example, writing to the server's local file system:
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(process.cwd(), 'public', 'uploads', `${Date.now()}.jpeg`);

    fs.writeFileSync(filePath, buffer);

    res.status(200).json({ message: 'Image uploaded successfully', path: `/uploads/${Date.now()}.jpeg` });
  } catch (error) {
    console.error('Error saving the image:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
