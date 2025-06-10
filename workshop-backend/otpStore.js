const otpMap = new Map();

function setOtp(email, otp) {
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
  otpMap.set(email, { otp, expiresAt });
}

function verifyOtp(email, inputOtp) {
  const data = otpMap.get(email);
  if (!data) return { success: false, message: 'OTP not found' };

  const { otp, expiresAt } = data;
  if (Date.now() > expiresAt) {
    otpMap.delete(email);
    return { success: false, message: 'OTP expired' };
  }

  if (otp !== inputOtp) {
    return { success: false, message: 'Incorrect OTP' };
  }

  otpMap.delete(email);
  return { success: true, message: 'OTP verified successfully' };
}

module.exports = { setOtp, verifyOtp };
