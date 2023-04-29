const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const fileUpload = require('../../middleware/upload');

jest.mock('multer');
jest.mock('multer-storage-cloudinary');

describe('fileUpload module', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should create a productUpload instance with correct configuration', () => {
        jest.isolateModules(() => {
            const { productUpload } = require('../../middleware/upload');

            const cloudinaryStorageConstructorCall = CloudinaryStorage.mock.calls[0][0];

            expect(cloudinaryStorageConstructorCall).toHaveProperty('cloudinary', expect.any(Object));
            expect(cloudinaryStorageConstructorCall).toHaveProperty('params', expect.any(Function));
        });
    });

    test('should create an avatarUpload instance with correct configuration', () => {
        jest.isolateModules(() => {
            const { avatarUpload } = require('../../middleware/upload');

            const cloudinaryStorageConstructorCall = CloudinaryStorage.mock.calls[0][0];

            expect(cloudinaryStorageConstructorCall).toHaveProperty('cloudinary', expect.any(Object));
            expect(cloudinaryStorageConstructorCall).toHaveProperty('params', expect.any(Function));
        });
    });
});
