const twilio = require('twilio');
require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceID = process.env.TWILIO_SERVICE_SID;

const client = twilio(accountSid, authToken);

// Middleware for OTP generation
async function reggenerateOtpMiddleware(req, res, next) {

    const phoneNumber = req.body.phoneNumber;

    try {
        await client.verify.v2.services(serviceID)
            .verifications.create({
                to: `+${91}${phoneNumber}`,
                channel: 'sms',
            });

        res.status(200).json({ message: "OTP sent successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
}

// Middleware for OTP verification
async function regverifyOtpMiddleware(req, res, next) {
  
    const phoneNumber = req.body.phoneNumber;
    const otp = req.body.otp;

    try {
        const verificationCheck = await client.verify.v2.services(serviceID)
            .verificationChecks.create({
                to: `+${91}${phoneNumber}`,
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
}

module.exports = { generateOtpMiddleware, verifyOtpMiddleware };
