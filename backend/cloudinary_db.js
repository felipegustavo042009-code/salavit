const cloud = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();

console.log('CLOUD NAME:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API KEY:', process.env.CLOUDINARY_API_KEY);
console.log('API SECRET:', process.env.CLOUDINARY_API_SECRET ? 'OK' : 'NÃO CARREGOU');

cloud.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
async function test() {
    try {
        const result = await cloud.uploader.upload(
            'https://res.cloudinary.com/demo/image/upload/sample.jpg'
        );
        console.log('UPLOAD OK:', result.secure_url);
    } catch (err) {
        console.error('ERRO:', err);
    }
}

test();

module.exports = cloud;