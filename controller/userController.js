const getToken = require("../config/jwtToken");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const validateMongoId = require("../utils/mongoIdValidate");
const getRefreshToken = require("../config/refreshToken");
const jwt = require("jsonwebtoken");

// register user
const createUser = asyncHandler(async (req, res) => {
  const email = req.body.email;

  const findUser = await User.findOne({ email: email });

  if (!findUser) {
    const newUser = await User.create(req.body);
    res.json(newUser);
  } else {
    /**
     * TODO:if user found then thow an error: User already exists
     */
    res.json({
      mgs: "User Already Exists",
      success: false,
    });
  }
});

// user login
const loginUser = asyncHandler(async (req, res) => {
  /**
   * TODO:Get the email from req.body
   */
  const { email, password } = req.body;

  const findUser = await User.findOne({ email });

  if (findUser && (await findUser.isMatchedPassword(password))) {
    const token = getToken(findUser?._id);
    const refreshToken = getRefreshToken(findUser?._id);
    const updateUser = await User.findByIdAndUpdate(
      findUser?._id,
      {
        refreshToken: refreshToken,
      },
      {
        new: true,
      }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });
    const newUser = {
      firstName: findUser?.firstName,
      lastName: findUser?.lastName,
      emailName: findUser?.email,
      mobileName: findUser?.mobile,
      role: findUser?.role,
      token: token,
    };

    res.json({
      newUser,
    });
  } else {
    res.json({
      mgs: "Invalid Credentials",
    });
  }
});
// refresh token handler
const refreshTokenHandle = asyncHandler(async (req, res) => {
  const cookie = req.cookies;

  if (!cookie.refreshToken) {
    throw new Eroor("Not refresh token");
  }
  const refreshToken = cookie.refreshToken;

  const user = await User.findOne({ refreshToken });

  if (!user) {
    throw new Error("No refresh token matched");
  }

  // verify refresh token

  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decode) => {
    if (err || user.id !== decode.id) {
      throw new Error("there is something wrong with refresh token");
    }

    const accessToken = getToken(user.id);
    res.json({
      accessToken,
    });
  });
});

// logout
const logout = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });
    return res.sendStatus(204); // forbidden
  }
  await User.findOneAndUpdate(refreshToken, {
    refreshToken: "",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });
  res.sendStatus(204); // forbidden
});

// get all user
const getallUser = asyncHandler(async (req, res) => {
  try {
    const getUsers = await User.find();
    res.json(getUsers);
  } catch (error) {
    throw new Error(error);
  }
});

// get single user
const getSingleUser = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoId(id);
    const getUser = await User.findById(id);
    res.json(getUser);
  } catch (error) {
    throw new Error(error);
  }
});
// update user
const updateUser = asyncHandler(async (req, res) => {
  try {
    const { _id } = req.user;
    const { firstName, lastName, email, mobile } = req.body;
    const getUser = await User.findByIdAndUpdate(
      _id,
      {
        firstName: firstName,
        lastName: lastName,
        email: email,
        mobile: mobile,
      },
      {
        new: true,
      }
    );
    res.json({
      mgs: "User Updated",
      getUser,
    });
  } catch (error) {
    throw new Error(error);
  }
});
// delete user
const deleteUser = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const getUser = await User.findByIdAndDelete(id);
    res.json({
      mgs: "User delete Successfully",
    });
  } catch (error) {
    throw new Error(error);
  }
});
// block user
const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoId(id);
  try {
    const block = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: true,
      },
      {
        new: true,
      }
    );
    res.json({
      mgs: "User Blocked",
    });
  } catch (error) {
    throw new Error(error);
  }
});
// unblock user
const unblockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoId(id);

  try {
    const unblock = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: false,
      },
      {
        new: true,
      }
    );
    res.json({
      mgs: "User has unblocked",
    });
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createUser,
  loginUser,
  getallUser,
  getSingleUser,
  deleteUser,
  updateUser,
  blockUser,
  unblockUser,
  refreshTokenHandle,
  logout,
};
