export const notImplemented = (req, res) => {
  return res.status(501).json({ message: "User routes not implemented" });
};
