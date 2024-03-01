const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const twilio = require('twilio');
require('dotenv').config(); 

const app = express();
const PORT = process.env.PORT || 3000;

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceID = process.env.TWILIO_SERVICE_SID;

const client = twilio(accountSid, authToken);

app.use(cors());
app.use(bodyParser.json());

// Route for OTP generation
app.post('/api/generate-otp', async (req, res) => {
    const countryCode = req.body.countryCode;
    const phoneNumber = req.body.phoneNumber;

    try {
        await client.verify.v2.services(serviceID)
            .verifications.create({
                to: `+${countryCode}${phoneNumber}`,
                channel: 'sms',
            });

        res.status(200).json({ message: "OTP sent successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
});

// Route for OTP verification
app.post('/api/verify-otp', async (req, res) => {
    const countryCode = req.body.countryCode;
    const phoneNumber = req.body.phoneNumber;
    const otp = req.body.otp;

    try {
        const verificationCheck = await client.verify.v2.services(serviceID)
            .verificationChecks.create({
                to: `+${countryCode}${phoneNumber}`,
                code: otp
            });

        if (verificationCheck.status === "approved") {
            res.status(200).json({ message: "OTP verified successfully" });
        } else {
            res.status(400).json({ message: "Entered OTP is wrong" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
