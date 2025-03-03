const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./config/config");
const nodemailer = require("nodemailer");
const userRoutes = require("./routes/userRoutes");

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

app.use("/user", userRoutes);
// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
