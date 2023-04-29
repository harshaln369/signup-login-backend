import mongoose from "mongoose";

const validateEmail = (email) => {
  const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: "Name is required",
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: [true, "Email already exists, try with different email"],
    required: "Email address is required",
    validate: [validateEmail, "Please fill a valid email address"],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please fill a valid email address",
    ],
  },
  password: {
    type: String,
    required: true,
  },
  salt: {
    type: String,
    required: true,
  },
});

userSchema.post("save", function (error, _doc, _next) {
  if (error?.keyValue?.email != null && error.code === 11000) {
    throw new Error("Email already exists, try again with different email");
  } else if (
    error?.errors?.name?.path &&
    error?.errors?.name?.kind === "required"
  ) {
    throw new Error(`${error?.errors?.name?.path} is a required field`);
  } else if (
    error?.errors?.email?.path &&
    error?.errors?.email?.kind === "required"
  ) {
    throw new Error(`${error?.errors?.email?.path} is a required field`);
  } else {
    console.log("Error occured while saving in database", error.errors);
    throw new Error("Error occured while saving in database");
  }
});

const User = mongoose.model("User", userSchema);

export default User;
