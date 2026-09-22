const jwt = require("jsonwebtoken");

const admins = [
  {
    id: "admin01",
    password: "Admin@123",
  },
  {
    id: "admin02",
    password: "Admin@456",
  },
  {
    id: "admin03",
    password: "Admin@789",
  },
];

const login = async (req, res) => {
  try {
    const { id, password } = req.body;

    if (!id || !password) {
      return res.status(400).json({
        success: false,
        message: "ID and password are required",
      });
    }

    const admin = admins.find(
      (admin) => admin.id === id && admin.password === password
    );

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin ID or password",
      });
    }

    const token = jwt.sign(
      {
        id: admin.id,
        role: "admin",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.status(200).json({
      success: true,
      message: "Admin login successful",
      data: {
        id: admin.id,
        role: "admin",
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

module.exports = {
  login,
};