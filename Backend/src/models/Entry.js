import mongoose from "mongoose";

const entrySchema = new mongoose.Schema({
  paymentId: String,
  planID: String,
  serialNo: String,
  employeeId: String,
  employeeName: String,
  selectOption: String,
  selectOptions: String,
  selectSR: String,
  currency: String,
  mode: String,
  amount: String,
  remarks: String,
  status: String,
});

const Entry = mongoose.model("Entry", entrySchema);

export default Entry;
