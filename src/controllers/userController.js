const User = require("../models/user");

//User
exports.getUserName = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select(
      "biodata.name.givenName biodata.name.familyName biodata.photos"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userName = `${user?.biodata?.name?.givenName || ""} ${user?.biodata?.name?.familyName || ""}`.trim();
    const userPhoto = user.biodata.photos;

    return res.status(200).json({ userName, userPhoto });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("biodata ");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const changes = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    console.log("Changes: ", changes);

    const updatedBiodata = { ...user.biodata.toObject(), ...changes };

    console.log(updatedBiodata);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { biodata: updatedBiodata },
      { new: true, runValidators: true, select: "biodata" }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

//Admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred while fetching users.", error });
  }
};

exports.addNewUser = async (req, res)=>{
  try{

  }catch{
    res.status(500).json({ message: "Failed to add new user" });
  }
}