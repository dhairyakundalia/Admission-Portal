const otpTemplate = (otp, expiryMinutes = 5) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
    </head>
    <body>
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Email Verification</h2>
      <p>Your OTP for account verification is:</p>
      <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
        <span style="font-size: 24px; font-weight: bold; color: #007bff;">${otp}</span>
      </div>
      <p>This OTP will expire in ${expiryMinutes} minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    </div>
    </body>
    </html>
  `;
};

export { otpTemplate };