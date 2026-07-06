import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { User } from '../models/user.model.js';

export const registerUser = asyncHandler(async (req, res) => {
   // TODO: Implement user registration logic
   // 1. Validate the request body
      
       const { username, email, password } = req.body;
       if (!username || !email || !password) {
           throw new ApiError(400, 'All fields are required');
        }
        // if (password.length < 8) {
        //     throw new ApiError(400, 'Password must be at least 8 characters long');
        // }
   if (!email.includes('@')) {
       throw new ApiError(400, 'Invalid email address');
    }
    if (!username.trim()) {
        throw new ApiError(400, 'Username is required');
    }
    if (!email.trim()) {
        throw new ApiError(400, 'Email is required');
    }
    if (!password.trim()) {
        throw new ApiError(400, 'Password is required');
    }
    // 2. Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ApiError(400, 'User already exists');
    }
// 2.1. Check if the profile picture is provided
    if (req.files && req.files.profilePicture && req.files.profilePicture.length > 0) {
        const profilePicture = req.files.profilePicture[0].path;
        const profilePictureUrl = await uploadImage(profilePicture);
        if (!profilePictureUrl) {
            throw new ApiError(400, 'Failed to upload profile picture');
        }
    }
    // 3. Create a new user
    const newUser = await User.create({ username, email, password });
    if (!newUser) {
        throw new ApiError(400, 'Failed to create user');
    }

    // 4. Send a verification email
    // 5. Return the user data
    res.status(200).json({ newUser });

});