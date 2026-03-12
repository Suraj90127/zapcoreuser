// utils/generatePrefix.js
import User from "../models/UserModel.js";

export const generateNextPrefix = async () => {
  // Get last created user (latest prefix)
  const lastUser = await User.findOne({})
    .sort({ createdAt: -1 })
    .select("prefix")
    .lean();

  // First user case
  if (!lastUser || !lastUser.prefix) {
    return "a00";
  }

  const prefix = lastUser.prefix; // e.g. "c07"
  const letter = prefix[0];       // c
  const number = parseInt(prefix.slice(1), 10); // 7

  let nextLetter = letter;
  let nextNumber = number;

  // Increment letter first
  if (letter < "z") {
    nextLetter = String.fromCharCode(letter.charCodeAt(0) + 1);
  } else {
    // z reached → reset letter & increment number
    nextLetter = "a";
    nextNumber += 1;
  }

  // Pad number to 2 digits
  const paddedNumber = String(nextNumber).padStart(2, "0");

  return `${nextLetter}${paddedNumber}`;
};
