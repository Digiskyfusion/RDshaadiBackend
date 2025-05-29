const User = require("../model/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Profile= require("../model/ProfileSchema")
const randomstring   = require("randomstring");
const sendMailNodemailer  = require("../utils/emailSender");


let URL= process.env.FRONTEND_URL
// console.log(URL);


// const multiForm = async (req, res) => {
//   try {
//     let { emailId, password, mobileNumber, ...otherData } = req.body;

//     if (!password) {
//       return res.status(400).json({ error: "Password is required in the second step" });
//     }

//     emailId = emailId.trim().toLowerCase();

//     // Check if user exists
//     const existingUser = await User.findOne({ emailId });
//     if (existingUser) {
//       return res.status(400).json({ error: "An account with this email already exists" });
//     }

//     // Hash the password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     // Save new user
//     const newUser = new User({
//       emailId,
//       mobileNumber,
//       password: hashedPassword,
//       ...otherData,
//     });

//     await newUser.save();

//     // Create JWT token
//     const payload = { id: newUser._id, emailId: newUser.emailId , mobileNumber};
//     const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: "7d" });

//     res.status(201).json({
//       message: "User registered successfully",
//       token,
//       user: {
//         id: newUser._id,
//         emailId: newUser.emailId,
//         mobileNumber:mobileNumber,
//         ...otherData
//       }
//     });
//   } catch (error) {
//     console.error("Error in user registration:", error.message);
//     res.status(500).json({ error: "Server error. Please try again later." });
//   }
// };
const multiForm = async (req, res) => {
  try {
    let { emailId, password, mobileNumber, ...otherData } = req.body;

    if (!password) {
      return res.status(400).json({ error: "Password is required in the second step" });
    }

    emailId = emailId.trim().toLowerCase();

    // Check if user with this email already exists
    const existingEmailUser = await User.findOne({ emailId });
    if (existingEmailUser) {
      return res.status(400).json({ error: "An account with this email already exists" });
    }

    // Check if user with this mobile number already exists
    const existingMobileUser = await User.findOne({ mobileNumber });
    if (existingMobileUser) {
      return res.status(400).json({ error: "An account with this mobile number already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save new user
    const newUser = new User({
      emailId,
      mobileNumber,
      password: hashedPassword,
      ...otherData,
    });

    await newUser.save();

    // Create JWT token
    const payload = { id: newUser._id, emailId: newUser.emailId, mobileNumber };
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: "7d" });

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser._id,
        emailId: newUser.emailId,
        mobileNumber: newUser.mobileNumber,
        ...otherData
      }
    });
  } catch (error) {
    console.error("Error in user registration:", error.message);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};






const login = async (req, res) => {
  const { identifier, password } = req.body;
  // console.log("Request Body:", req.body);

  if (!identifier || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const user = await User.findOne({
      $or: [{ emailId: identifier }, { mobileNumber: identifier }],
    });

    console.log("Found user:", user);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // ✅ Create token
    const payload = {
      id: user._id,
      emailId: user.emailId,
      mobileNumber: user.mobileNumber,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    // ✅ Remove password from user object before sending
    const userWithoutPassword = { ...user._doc };
    delete userWithoutPassword.password;

    res.status(200).json({
      message: "Login successful.",
      token,
      user: userWithoutPassword,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
};

// get user by id

const getById = async (req, res) => {
  try{
   const userId = req.params.id;
    if(!userId){
     return res.status(401).json({ message: "Invalid userId" });
    }
 
    const user = await User.findById({_id:userId})
 
    if(!user){
     return res.status(401).json({ message: "No user found." });
    }
    return res.status(200).json({user})
 
  }catch(error){
   return res.status(500).json({ message: "something went wrong", error: error.message });
  }
 }

 //get by gender
 const getBygender= async (req, res) => {
  try {
    const userId = req.params.userId;

    // Step 1: Get gender of logged-in user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const userGender = user.gender;
    // console.log(userGender);
    

    // Step 2: Determine opposite gender
    let oppositeGender;

    if (userGender === 'Male') {
      oppositeGender = 'Female';
    } else if (userGender === 'Female') {
      oppositeGender = 'Male';
    } else if (userGender === 'Other') {
      oppositeGender = ['Male', 'Female'];
    } else {
      return res.status(400).json({ error: 'Invalid gender' });
    }
    // Step 3: Find profiles where user's gender is opposite
    const profiles = await Profile.find()
      .populate({
        path: 'userId',
        match: { gender: oppositeGender },
        select: 'firstName lastName profileImage dob gender'
      });

    // Step 4: Filter out profiles where userId didn’t match (no opposite gender)
    const filteredProfiles = profiles.filter(profile => profile.userId);

    res.status(200).json(filteredProfiles);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

// signle user by profile
const getProfileWithUser = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.params.userId }).populate('userId', 'firstName  lastName profileImage dob emailId mobileNumber gender credits')
    // .populate('religion.userId','age religion height growup diet community healthinformation disability gothram highestqualification workingwith currentresidence stateofresidence residencystatus zippincode'); // Populating partner preferences;
    
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    // const userData = profile.userId;
    // console.log(userData);
    

    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

//  update user
 const updateUser=  async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedUser = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error.message);
    res.status(500).json({ message: "error in updating user." });
  }
};


//forget password
const forgetPassword = async (req, res) => {
  try {
      let { emailId } = req.body;
      let user = await User.findOne({ emailId });
      console.log(user);
      
    
      
      if (user) {
          let randomString = randomstring.generate();
          let expirationTime = Date.now() + 60 * 60 * 1000;
          await User.updateOne({ emailId }, { $set: { token: randomString ,tokenExpiresAt:new Date(expirationTime) } });
          try {
            // Send email
            await sendMailNodemailer({
              to: emailId,
              subject: "Welcome to  reset password",
              text: "hello",
              html: `<p>Hi ${user.firstName},</p>
              <p>Please click the link below to reset your password:</p>
              <a href="https://www.shaadisanskar.com/reset-password?token=${randomString}" target="_blank">Reset Password</a>
              <p>If you did not request this, please ignore this email.</p>`,
            });
        
            return res.status(200).json({
              success: true,
              message: "Please check your email inbox to reset your password."
          });
          } catch (error) {
           return res.status(500).json({ message: "Failed to send mail", error });
          }
      } else {
          return res.status(404).json({
              success: false,
              message: "This email does not exist."
          });
      }
  } catch (error) {
      console.log("Error in forgetPassword:", error);
      return res.status(500).send("Error from forgetPassword route.");
  }
};


//rest password
const resetPassword = async (req, res) => {
  try {
      const token = req.query.token;
      // console.log(token);
      
      let tokenData = await User.findOne({ token });
  //  console.log(tokenData);

      if (tokenData) {
          const { password } = req.body;

          // Hash the new password
          bcrypt.genSalt(10, async (err, salt) => {
              if (err) {
                  return res.status(500).send({ success: false, message: "Error generating salt" });
              }

              // Hash the password
              bcrypt.hash(password, salt, async (err, hash) => {
                  if (err) {
                      return res.status(500).send({ success: false, message: "Error hashing password" });
                  }

                  // Update the user password in the database
                  let updatedUser = await User.findByIdAndUpdate(
                       tokenData._id,
                      { $set: { password: hash, token: "" } },
                      { new: true }
                  );

                  // Respond with the updated user data
                  res.status(200).json({
                      success: true,
                      message: "User password has been reset ssuccessfully.",
                      data: updatedUser,
                  });
              });
          });
      } else {
          return res.status(404).send({ success: false, message: "The link has expired or is invalid hihi." });
      }
  } catch (error) {
      console.error(error);
      return res.status(500).send({ success: false, message: "An error occurred during password reset." });
  }
};

const connectHandler = async (req, res) => {
  try {
    const userId = req.params.userId // assuming user ID is available from auth middleware
    console.log(userId);
    

    const user = await User.findById(userId);
  

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.credits <= 0) {
      return res.status(400).json({ message: "Not enough credits" });
    }

    // Deduct 1 credit
    user.credits -= 1;
    await user.save();
      console.log("userrrrrr",user)

    return res.status(200).json({ message: "Connected successfully", creditsLeft: user.credits });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error : err.message });
  }
};

module.exports ={multiForm,login,getById,updateUser,getBygender,getProfileWithUser,forgetPassword,resetPassword,connectHandler};
