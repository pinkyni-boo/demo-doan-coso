import mongoose from "mongoose";

const clubSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  image: { type: String, required: true },
  description: { type: String, required: true },
});

const Club = mongoose.model("Club", clubSchema);

export default Club;
