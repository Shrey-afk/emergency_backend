const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./config/config");
const nodemailer = require("nodemailer");
const userRoutes = require("./routes/userRoutes");
const multer = require("multer");
const upload = multer();
const app = express();
connectDB();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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

app.post("/send-audio-mail", upload.single("file"), async (req, res) => {
  // Create transporter for nodemailer

  const { user, guardianEmails } = req.query; // Get user and emails from query params
  const audioFile = req.file; // Get the uploaded audio file

  console.log("Received file:", audioFile); // Log the file for debugging
  console.log("User:", user); // Log the user for debugging
  console.log("Guardian Emails:", guardianEmails); // Log the emails for debugging

  if (!guardianEmails || guardianEmails.length === 0) {
    return res.status(400).json({ message: "No guardian emails provided." });
  }

  if (!audioFile) {
    return res.status(400).json({ message: "No audio file provided." });
  }

  try {
    // Parse user and emails from query params
    const userData = JSON.parse(user);
    const emails = JSON.parse(guardianEmails);

    // Define mail options
    const mailOptions = {
      from: "lifeline8555@gmail.com",
      to: emails.join(", "), // Send to multiple recipients
      subject: "Urgent: Help",
      text: `${userData.name} is not feeling safe. Please reach out to them immediately.`,
      attachments: [
        {
          filename: "audio.m4a", // Name of the attachment
          content: audioFile.buffer, // Audio file as a buffer
        },
      ],
    };
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "lifeline8555@gmail.com",
        pass: "gwhn trey sker wenp",
      },
    });
    // Send the email
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Alert email sent successfully." });
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "Failed to send email." });
  }
});

app.use("/user", userRoutes);
// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
