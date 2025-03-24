const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./config/config");
const nodemailer = require("nodemailer");
const userRoutes = require("./routes/userRoutes");
const multer = require("multer");
const storage = multer.memoryStorage(); // Store files in memory as buffers
const upload = multer({ storage: storage });
const app = express();
connectDB();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const otpStorage = new Map();
app.post("/send-mail", async (req, res) => {
  const { user, guardianEmails, location } = req.body;

  if (!guardianEmails || guardianEmails.length === 0) {
    return res.status(400).json({ message: "No guardian emails provided." });
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "lifeline8555@gmail.com",
      pass: "gwhn trey sker wenp",
    },
  });

  const mailOptions = {
    from: "lifeline8555@gmail.com",
    to: guardianEmails,
    subject: "Urgent: Help",
    text: ` ${user.name} is not feeling safe. Please reach out to them immediately.  
Current Location:  
Latitude: ${location.latitude}, Longitude: ${location.longitude}  

Google Maps: https://www.google.com/maps?q=${location.latitude},${location.longitude} `,
    html: `<p><strong>${user.name}</strong> is not feeling safe. Please reach out to them immediately.</p>
         <p><strong>Current Location:</strong> Latitude: ${location.latitude}, Longitude: ${location.longitude}</p>
         <p><a href="https://www.google.com/maps?q=${location.latitude},${location.longitude}" target="_blank">
         <strong>Click here to view location in Google Maps</strong></a></p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Alert email sent successfully." });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Failed to send email." });
  }
});

app.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Email is required" });
  }

  try {
    // Generate a 6-digit random OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 5 * 60 * 1000; // OTP valid for 5 minutes

    // Store OTP with expiry time
    otpStorage.set(email, { otp, expiry: otpExpiry });

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "lifeline8555@gmail.com",
        pass: "gwhn trey sker wenp",
      },
    });

    // Email options
    const mailOptions = {
      from: "lifeline8555@gmail.com",
      to: email,
      subject: "Your OTP for Password Reset",
      text: `Your OTP for password reset is: ${otp}. This OTP is valid for 5 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #841584;">Password Reset OTP</h2>
          <p>Your OTP for password reset is:</p>
          <h3 style="background: #f0f0f0; display: inline-block; padding: 10px 20px; border-radius: 5px;">${otp}</h3>
          <p>This OTP is valid for 5 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // Return success response with OTP (for development/testing)
    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      otp: otp, // Returning OTP for testing purposes (remove in production)
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
});

app.post("/send-audio-mail", upload.single("file"), async (req, res) => {
  try {
    // Safely parse query parameters
    const parseParam = (param) => {
      try {
        return param ? JSON.parse(param) : null;
      } catch (e) {
        console.error(`Failed to parse ${param}`);
        return null;
      }
    };

    const user = parseParam(req.query.user);
    const guardianEmails = parseParam(req.query.guardianEmails);
    const location = parseParam(req.query.location);

    // Validate required fields
    if (
      !guardianEmails ||
      !Array.isArray(guardianEmails) ||
      guardianEmails.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "No valid guardian emails provided.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No audio file provided.",
      });
    }

    // Prepare email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "lifeline8555@gmail.com",
        pass: "gwhn trey sker wenp",
      },
    });

    const mailOptions = {
      from: "lifeline8555@gmail.com",
      to: guardianEmails.join(", "),
      subject: "Urgent: Help",
      text: `${user?.name} needs assistance. Location: ${location?.latitude},${location?.longitude}`,
      attachments: [
        {
          filename: "audio.m4a",
          content: req.file.buffer,
        },
      ],
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: "Alert sent successfully",
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process request",
      error: error.message,
    });
  }
});

app.use("/user", userRoutes);
// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
