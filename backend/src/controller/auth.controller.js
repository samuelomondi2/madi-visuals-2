const authService = require('../services/auth.service');
const jwt = require('jsonwebtoken');

exports.register = async (req, res, next) => {
  try {
    await authService.register(req.body);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const user = await authService.login(req.body);

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ message: 'Logged in successfully', token });
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const token = await authService.forgotPassword(email);
    if (token) {
      console.log(`Reset link: ${process.env.FRONTEND_URL}/reset-password?token=${token}`);
    }
    res.status(201).json({ message: 'If email exists, reset link sent' });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    const { token } = req.params;

    await authService.resetPassword(token, password);

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    next(error);
  }
};
