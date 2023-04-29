import jwt from "jsonwebtoken";

export const auth = (req, res, next) => {
  const token = req.header("Authorization").split("Bearer ")[1];
  try {
    const userDetails = jwt.verify(token, process.env.JWT_SECRET);
    req.userDetails = userDetails;
  } catch (error) {
    console.log("error in token", error);
    return res
      .status(400)
      .json({ status: false, data: { message: error.message } });
  }
  next();
};
